import fs from 'fs/promises'
import path from 'path'
import { createSharpInstance } from './sharp-config'
import { SIZE_RATIOS, SHARP_OUTPUT_QUALITY } from '@/lib/constants'
import { getDownloadPath, getRelativePath } from './storage'
import type { SizeMetadata, FileSizes } from '@/types/models'
import type { ImageSize } from '@/types/enums'

export interface ResizeResult {
  sizesJson: Record<ImageSize, SizeMetadata>
  fileSizesJson: FileSizes
}

const IMAGE_SIZES: ImageSize[] = ['XL', 'L', 'M', 'S']

export async function resizeImage(
  originalPath: string,
  imageId: string
): Promise<ResizeResult> {
  const metadata = await createSharpInstance(originalPath).metadata()
  const width = metadata.width!
  const height = metadata.height!

  // Ensure downloads/{imageId}/ directory exists
  await fs.mkdir(path.dirname(getDownloadPath(imageId, 'XL')), {
    recursive: true,
  })

  const sizesJson = {} as Record<ImageSize, SizeMetadata>
  const fileSizesJson = {} as FileSizes

  for (const size of IMAGE_SIZES) {
    // SIZE_RATIOS are price ratios (area-based), apply sqrt for per-dimension ratio
    const ratio = Math.sqrt(SIZE_RATIOS[size])
    const targetW = Math.round(width * ratio)
    const targetH = Math.round(height * ratio)

    const outputPath = getDownloadPath(imageId, size)

    // Sharp strips metadata by default; no withMetadata() call needed for EXIF removal
    const result = await createSharpInstance(originalPath)
      .resize(targetW, targetH, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: SHARP_OUTPUT_QUALITY.JPEG })
      .toFile(outputPath)

    sizesJson[size] = {
      path: getRelativePath(outputPath),
      width: result.width,
      height: result.height,
    }
    fileSizesJson[size] = result.size
  }

  return { sizesJson, fileSizesJson }
}
