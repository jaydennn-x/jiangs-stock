import {
  DEFAULT_LICENSE_EXTENDED_MULTIPLIER,
  SIZE_RATIOS,
} from '@/lib/constants'
import type { ImageSize, LicenseType } from '@/types/enums'

const SIZE_LABELS: Record<ImageSize, string> = {
  XL: 'XL(원본)',
  L: 'L(대)',
  M: 'M(중)',
  S: 'S(소)',
}

const SIZE_RESOLUTIONS: Record<ImageSize, string> = {
  XL: '1920×1080',
  L: '1440×810',
  M: '960×540',
  S: '480×270',
}

export function calculatePrice(
  basePrice: number,
  size: ImageSize,
  licenseType: LicenseType
): number {
  const sizeRatio = SIZE_RATIOS[size]
  const licenseMultiplier =
    licenseType === 'EXTENDED' ? DEFAULT_LICENSE_EXTENDED_MULTIPLIER : 1
  return Math.round(basePrice * sizeRatio * licenseMultiplier)
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('ko-KR').format(amount) + '원'
}

export function getSizeLabel(size: ImageSize): string {
  return SIZE_LABELS[size]
}

export function getSizeResolution(size: ImageSize): string {
  return SIZE_RESOLUTIONS[size]
}
