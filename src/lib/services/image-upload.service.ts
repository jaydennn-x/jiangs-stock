import fs from 'fs/promises'
import path from 'path'
import { prisma } from '@/lib/prisma'
import { imageProcessingQueue } from '@/lib/queues'
import {
  ensureStorageDirs,
  getOriginalPath,
  getRelativePath,
  cleanupImageFiles,
} from '@/lib/image-processing/storage'
import type { Orientation } from '@/types/enums'
import type { Image as PrismaImage } from '@/generated/prisma/client'

export interface UploadImageInput {
  file: Buffer
  code: string
  name: string
  description?: string
  categoryId: string
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
 * 2. Save original file to disk
 * 3. Enqueue BullMQ processing job
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
      categoryId: input.categoryId,
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
    // Step 2: Save original file to disk
    const originalPath = getOriginalPath(image.id, input.format)
    await fs.mkdir(path.dirname(originalPath), { recursive: true })
    await fs.writeFile(originalPath, input.file)

    // Update originalUrl with relative path
    const relativePath = getRelativePath(originalPath)
    await prisma.image.update({
      where: { id: image.id },
      data: { originalUrl: relativePath },
    })

    // Step 3: Enqueue BullMQ processing job
    await imageProcessingQueue.add('process-image', {
      imageId: image.id,
      originalPath,
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
