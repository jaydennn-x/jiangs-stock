import { createSharpInstance } from './sharp-config'
import { SHARP_OUTPUT_QUALITY } from '@/lib/constants'
import { getWatermarkPath, getThumbnailPath, getRelativePath } from './storage'

function generateWatermarkSvg(width: number, height: number): Buffer {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <defs>
    <pattern id="wm" patternUnits="userSpaceOnUse" width="300" height="200" patternTransform="rotate(-30)">
      <text x="10" y="100" font-size="32" fill="rgba(255,255,255,0.35)" font-family="Arial,Helvetica,sans-serif" font-weight="bold">JiangsStock</text>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#wm)"/>
</svg>`
  return Buffer.from(svg)
}

/**
 * Create a watermarked preview image from the original.
 * Preview is resized to ~L size (67% per dimension) with diagonal text watermark overlay.
 * @returns Relative path for DB storage (e.g. "watermarks/abc123.jpg")
 */
export async function createWatermark(
  originalPath: string,
  imageId: string
): Promise<string> {
  const metadata = await createSharpInstance(originalPath).metadata()
  const previewWidth = Math.round(metadata.width! * 0.67)
  const previewHeight = Math.round(metadata.height! * 0.67)

  // Resize first, then get actual dimensions for SVG
  const resizedBuffer = await createSharpInstance(originalPath)
    .resize(previewWidth, previewHeight, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .toBuffer({ resolveWithObject: true })

  const watermarkSvg = generateWatermarkSvg(
    resizedBuffer.info.width,
    resizedBuffer.info.height
  )

  const outputPath = getWatermarkPath(imageId)
  await createSharpInstance(resizedBuffer.data)
    .composite([{ input: watermarkSvg, top: 0, left: 0 }])
    .jpeg({ quality: SHARP_OUTPUT_QUALITY.JPEG })
    .toFile(outputPath)

  return getRelativePath(outputPath)
}

/**
 * Create a high-quality square WebP thumbnail from the original.
 * Smart-cropped to 1200×1200 for crisp display on high-DPI screens.
 * @returns Relative path for DB storage (e.g. "thumbnails/abc123.webp")
 */
export async function createThumbnail(
  originalPath: string,
  imageId: string
): Promise<string> {
  const outputPath = getThumbnailPath(imageId)
  await createSharpInstance(originalPath)
    .resize(1200, 1200, { fit: 'cover', position: 'attention' })
    .sharpen({ sigma: 0.5 })
    .webp({ quality: 95, effort: 6 })
    .toFile(outputPath)

  return getRelativePath(outputPath)
}
