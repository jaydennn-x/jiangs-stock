import fs from 'fs/promises'
import path from 'path'
import { prisma } from '@/lib/prisma'
import { imageProcessingQueue } from '@/lib/queues'
import {
  ensureStorageDirs,
  getTempOriginalPath,
  cleanupImageFiles,
} from '@/lib/image-processing/storage'
import type { Orientation } from '@/types/enums'
import type { Image as PrismaImage } from '@/generated/prisma/client'

export interface UploadImageInput {
  file: Buffer
  code: string
  name: string
  description?: string
  orientation: Orientation
  width: number
  height: number
  format: string
  basePrice: number
  tags: string[]
  colorTags: string[]
  shootDate?: string
}

/**
 * Upload an image with atomic ordering guarantee:
 * 1. Create DB record (PENDING)
 * 2. Save original file to temp/ for processing
 * 3. Enqueue BullMQ processing job
 *
 * 원본은 temp/에 임시 저장 → 워커가 처리 후 삭제.
 * 원본 보관은 로컬 PC (D:\jiangsstock)에서 관리.
 *
 * On failure at any step, previous steps are rolled back.
 */
export async function uploadImage(
  input: UploadImageInput
): Promise<PrismaImage> {
  await ensureStorageDirs()

  // Step 1: Create DB record with PENDING status
  const image = await prisma.image.create({
    data: {
      code: input.code,
      name: input.name,
      description: input.description,
      orientation: input.orientation,
      width: input.width,
      height: input.height,
      format: input.format,
      basePrice: input.basePrice,
      tags: input.tags,
      colorTags: input.colorTags,
      shootDate: input.shootDate,
      processingStatus: 'PENDING',
      originalUrl: '',
      watermarkUrl: '',
      thumbnailUrl: '',
      sizesJson: {},
      fileSizesJson: {},
    },
  })

  try {
    // Step 2: Save original to temp/ for processing (not permanent storage)
    const tempPath = getTempOriginalPath(image.id, input.format)
    await fs.mkdir(path.dirname(tempPath), { recursive: true })
    await fs.writeFile(tempPath, input.file)

    // Step 3: Enqueue BullMQ processing job
    await imageProcessingQueue.add('process-image', {
      imageId: image.id,
      originalPath: tempPath,
      basePrice: input.basePrice,
    })

    return image
  } catch (error) {
    // Rollback: delete DB record + cleanup files
    await prisma.image.delete({ where: { id: image.id } }).catch(() => {})
    await cleanupImageFiles(image.id)
    throw error
  }
}
