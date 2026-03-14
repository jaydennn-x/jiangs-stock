import { z } from 'zod'
import type { Orientation, ProcessingStatus } from '@/types/enums'

// --- Zod Schemas ---

export const createProductSchema = z.object({
  name: z
    .string()
    .min(1, '상품명을 입력해주세요')
    .max(200, '상품명은 200자 이하로 입력해주세요'),
  code: z
    .string()
    .regex(/^[0-9]*$/, '상품 코드는 숫자만 입력 가능합니다')
    .default(''),
  description: z.string().max(2000).optional(),
  orientation: z.enum(['LANDSCAPE', 'PORTRAIT', 'SQUARE'] as const),
  basePrice: z
    .number()
    .positive('가격은 0보다 커야 합니다')
    .max(999_999_999, '가격이 너무 높습니다'),
  tags: z.array(z.string().min(1).max(50)).max(20).default([]),
  colorTags: z.array(z.string().min(1).max(30)).max(10).default([]),
  shootDate: z.string().optional(),
})

export const updateProductSchema = z.object({
  imageId: z.string().cuid(),
  name: z
    .string()
    .min(1, '상품명을 입력해주세요')
    .max(200, '상품명은 200자 이하로 입력해주세요'),
  description: z.string().max(2000).optional(),
  orientation: z.enum(['LANDSCAPE', 'PORTRAIT', 'SQUARE'] as const),
  basePrice: z
    .number()
    .positive('가격은 0보다 커야 합니다')
    .max(999_999_999, '가격이 너무 높습니다'),
  tags: z.array(z.string().min(1).max(50)).max(20).default([]),
  colorTags: z.array(z.string().min(1).max(30)).max(10).default([]),
  shootDate: z.string().optional(),
})

// --- Input Types ---

export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>

// --- Result Types ---

export type AdminProductActionResult =
  | { success: true; imageId: string }
  | { success: false; error: string }

export type AdminProductMutationResult =
  | { success: true }
  | { success: false; error: string }

export interface ImageWithCategory {
  id: string
  code: string
  name: string
  description: string | null
  orientation: Orientation
  width: number
  height: number
  format: string
  basePrice: number
  originalUrl: string
  watermarkUrl: string
  thumbnailUrl: string
  sizesJson: unknown
  fileSizesJson: unknown
  colorTags: string[]
  tags: string[]
  shootDate: string | null
  processingStatus: ProcessingStatus
  isActive: boolean
  salesCount: number
  createdAt: string
  updatedAt: string
}

export interface AdminProductListResponse {
  images: ImageWithCategory[]
  total: number
  page: number
  totalPages: number
}

export interface AdminProductStatusResponse {
  statuses: Array<{
    id: string
    processingStatus: ProcessingStatus
    thumbnailUrl: string
  }>
}
