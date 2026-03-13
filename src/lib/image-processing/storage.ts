import fs from 'fs/promises'
import path from 'path'

const STORAGE_DIRS = ['temp', 'downloads', 'watermarks', 'thumbnails'] as const

function getStorageRoot(): string {
  const root = process.env.STORAGE_ROOT
  if (!root) {
    throw new Error('STORAGE_ROOT environment variable is not set')
  }
  return root
}

export async function ensureStorageDirs(): Promise<void> {
  const root = getStorageRoot()
  await Promise.all(
    STORAGE_DIRS.map(dir => fs.mkdir(path.join(root, dir), { recursive: true }))
  )
}

export function getTempOriginalPath(imageId: string, ext: string): string {
  return path.join(getStorageRoot(), 'temp', `${imageId}.${ext}`)
}

export function deleteTempOriginal(imageId: string): Promise<void> {
  const exts = ['jpeg', 'jpg', 'png', 'tiff']
  return Promise.all(
    exts.map(ext =>
      fs.unlink(path.join(getStorageRoot(), 'temp', `${imageId}.${ext}`)).catch(() => {})
    )
  ).then(() => {})
}

export function getDownloadPath(imageId: string, size: string): string {
  return path.join(getStorageRoot(), 'downloads', imageId, `${size}.jpg`)
}

export function getWatermarkPath(imageId: string): string {
  return path.join(getStorageRoot(), 'watermarks', `${imageId}.jpg`)
}

export function getThumbnailPath(imageId: string): string {
  return path.join(getStorageRoot(), 'thumbnails', `${imageId}.webp`)
}

export function getRelativePath(absolutePath: string): string {
  const root = getStorageRoot()
  return path.relative(root, absolutePath).split(path.sep).join('/')
}

export async function cleanupImageFiles(imageId: string): Promise<void> {
  const sizes = ['XL', 'L', 'M', 'S']

  const filesToDelete = [
    // Temp originals (processing 중 실패 시 정리)
    getTempOriginalPath(imageId, 'jpeg'),
    getTempOriginalPath(imageId, 'jpg'),
    getTempOriginalPath(imageId, 'png'),
    getTempOriginalPath(imageId, 'tiff'),
    // Watermark and thumbnail
    getWatermarkPath(imageId),
    getThumbnailPath(imageId),
    // Download sizes
    ...sizes.map(size => getDownloadPath(imageId, size)),
  ]

  await Promise.all(
    filesToDelete.map(file => fs.unlink(file).catch(() => {}))
  )

  // Remove downloads/{imageId}/ directory if empty
  const downloadDir = path.join(getStorageRoot(), 'downloads', imageId)
  await fs.rmdir(downloadDir).catch(() => {})
}
