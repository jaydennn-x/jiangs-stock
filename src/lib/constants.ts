import type { ImageSize } from '@/types/enums'

export const SIZE_RATIOS: Readonly<Record<ImageSize, number>> = {
  XL: 1.0,
  L: 0.45,
  M: 0.2,
  S: 0.07,
}

export const DEFAULT_LICENSE_EXTENDED_MULTIPLIER = 3 as const

export const DEFAULT_DOWNLOAD_LIMIT = 3 as const

export const DEFAULT_DOWNLOAD_EXPIRES_DAYS = 7 as const

export const IMAGE_UPLOAD_MAX_SIZE_MB = 50 as const

export const IMAGE_UPLOAD_MAX_SIZE_BYTES =
  IMAGE_UPLOAD_MAX_SIZE_MB * 1024 * 1024

export const ALLOWED_IMAGE_FORMATS = ['jpeg', 'png', 'tiff'] as const

export const SHARP_OUTPUT_QUALITY = {
  JPEG: 90,
  WEBP: 90,
} as const

export const SHARP_LIMIT_INPUT_PIXELS = 300_000_000 as const
