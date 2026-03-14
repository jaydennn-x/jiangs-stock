import type { ImageSize, LicenseType, Orientation } from './enums'
import type { Image } from './models'

export interface SearchParams {
  q?: string
  tag?: string
  orientation?: Orientation
  colorTag?: string
  sort?: 'latest' | 'popular' | 'price_asc' | 'price_desc'
  cursor?: string
  limit?: number
}

export interface PaginationMeta {
  hasNextPage: boolean
  nextCursor?: string
  totalCount: number
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, string[]>
}

export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: ApiError }

export interface PriceOption {
  size: ImageSize
  licenseType: LicenseType
  price: number
  width: number
  height: number
  fileSizeBytes: number
}

export interface ImageListResponse {
  images: Image[]
  pagination: PaginationMeta
}

export type ImageDetailResponse = Image & {
  priceOptions: PriceOption[]
  isPurchased: boolean
}
