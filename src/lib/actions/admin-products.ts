'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { uploadImage } from '@/lib/services/image-upload.service'
import {
  IMAGE_UPLOAD_MAX_SIZE_BYTES,
  ALLOWED_IMAGE_FORMATS,
} from '@/lib/constants'
import { cleanupImageFiles } from '@/lib/image-processing/storage'
import {
  createProductSchema,
  updateProductSchema,
} from '@/lib/validations/admin-product'
import type {
  AdminProductActionResult,
  AdminProductMutationResult,
} from '@/lib/validations/admin-product'

export async function requireAdmin(): Promise<string | null> {
  const session = await auth()
  if (!session?.user) {
    return '로그인이 필요합니다'
  }
  if (session.user.role !== 'ADMIN') {
    return '관리자 권한이 필요합니다'
  }
  return null
}

async function generateProductCode(): Promise<string> {
  let code: string
  do {
    code = String(Math.floor(Math.random() * 9_000_000_000 + 1_000_000_000))
    const exists = await prisma.image.findUnique({
      where: { code },
      select: { id: true },
    })
    if (!exists) break
  } while (true)
  return code
}

export async function createProduct(
  formData: FormData
): Promise<AdminProductActionResult> {
  const authError = await requireAdmin()
  if (authError) {
    return { success: false, error: authError }
  }

  try {
    const file = formData.get('file')
    if (!file || !(file instanceof File)) {
      return { success: false, error: '이미지 파일을 선택해주세요' }
    }

    if (file.size > IMAGE_UPLOAD_MAX_SIZE_BYTES) {
      return { success: false, error: '파일 크기는 50MB 이하여야 합니다' }
    }

    const metadataRaw = formData.get('metadata')
    if (!metadataRaw || typeof metadataRaw !== 'string') {
      return { success: false, error: '메타데이터가 누락되었습니다' }
    }

    let metadata: unknown
    try {
      metadata = JSON.parse(metadataRaw)
    } catch {
      return { success: false, error: '메타데이터 형식이 올바르지 않습니다' }
    }

    const validated = createProductSchema.safeParse(metadata)
    if (!validated.success) {
      const firstError = validated.error.issues[0]
      return {
        success: false,
        error: firstError?.message ?? '입력값이 올바르지 않습니다',
      }
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    const sharp = (await import('sharp')).default
    const sharpMetadata = await sharp(buffer).metadata()

    if (!sharpMetadata.width || !sharpMetadata.height || !sharpMetadata.format) {
      return { success: false, error: '이미지 메타데이터를 읽을 수 없습니다' }
    }

    const format = sharpMetadata.format === 'tiff' ? 'tiff' : sharpMetadata.format
    if (
      !ALLOWED_IMAGE_FORMATS.includes(
        format as (typeof ALLOWED_IMAGE_FORMATS)[number]
      )
    ) {
      return {
        success: false,
        error: `허용되지 않는 이미지 형식입니다 (허용: ${ALLOWED_IMAGE_FORMATS.join(', ')})`,
      }
    }

    // Extract EXIF shoot date
    const exif = sharpMetadata.exif
    let exifShootDate: string | undefined
    if (exif) {
      const { default: ExifReader } = await import('exif-reader')
      try {
        const parsed = ExifReader(exif)
        const dt =
          parsed?.Photo?.DateTimeOriginal ??
          parsed?.Photo?.DateTimeDigitized ??
          parsed?.Image?.DateTime
        if (dt instanceof Date) {
          exifShootDate = dt.toISOString().slice(0, 10)
        }
      } catch {
        // EXIF parsing failed, ignore
      }
    }

    const shootDate = validated.data.shootDate || exifShootDate

    // Auto-generate code if not provided
    let code = validated.data.code
    if (!code) {
      code = await generateProductCode()
    }

    const image = await uploadImage({
      file: buffer,
      code,
      name: validated.data.name,
      description: validated.data.description,
      orientation: validated.data.orientation,
      width: sharpMetadata.width,
      height: sharpMetadata.height,
      format,
      basePrice: validated.data.basePrice,
      tags: validated.data.tags,
      colorTags: validated.data.colorTags,
      shootDate,
    })

    revalidatePath('/admin/products')
    return { success: true, imageId: image.id }
  } catch (error) {
    console.error('[createProduct]', error)
    return { success: false, error: '상품 등록에 실패했습니다' }
  }
}

export async function updateProduct(
  formData: FormData
): Promise<AdminProductMutationResult> {
  const authError = await requireAdmin()
  if (authError) {
    return { success: false, error: authError }
  }

  try {
    const metadataRaw = formData.get('metadata')
    if (!metadataRaw || typeof metadataRaw !== 'string') {
      return { success: false, error: '메타데이터가 누락되었습니다' }
    }

    let metadata: unknown
    try {
      metadata = JSON.parse(metadataRaw)
    } catch {
      return { success: false, error: '메타데이터 형식이 올바르지 않습니다' }
    }

    const validated = updateProductSchema.safeParse(metadata)
    if (!validated.success) {
      const firstError = validated.error.issues[0]
      return {
        success: false,
        error: firstError?.message ?? '입력값이 올바르지 않습니다',
      }
    }

    const { imageId, ...updateData } = validated.data

    await prisma.image.update({
      where: { id: imageId },
      data: {
        name: updateData.name,
        description: updateData.description,
        orientation: updateData.orientation,
        basePrice: updateData.basePrice,
        tags: updateData.tags,
        colorTags: updateData.colorTags,
        shootDate: updateData.shootDate,
      },
    })

    revalidatePath('/admin/products')
    return { success: true }
  } catch (error) {
    console.error('[updateProduct]', error)
    return { success: false, error: '상품 수정에 실패했습니다' }
  }
}

async function hardDeleteImage(imageId: string): Promise<void> {
  await cleanupImageFiles(imageId)

  await prisma.$transaction([
    prisma.cartItem.deleteMany({ where: { imageId } }),
    prisma.wishlist.deleteMany({ where: { imageId } }),
    prisma.orderItem.deleteMany({ where: { imageId } }),
    prisma.image.delete({ where: { id: imageId } }),
  ])
}

export async function deleteProduct(
  imageId: string
): Promise<AdminProductMutationResult> {
  const authError = await requireAdmin()
  if (authError) {
    return { success: false, error: authError }
  }

  try {
    await hardDeleteImage(imageId)

    revalidatePath('/admin/products')
    return { success: true }
  } catch (error) {
    console.error('[deleteProduct]', error)
    return { success: false, error: '상품 삭제에 실패했습니다' }
  }
}

const INLINE_EDITABLE_FIELDS = [
  'name',
  'description',
  'orientation',
  'basePrice',
  'tags',
  'colorTags',
  'shootDate',
] as const

type InlineEditableField = (typeof INLINE_EDITABLE_FIELDS)[number]

export async function updateProductField(
  imageId: string,
  field: InlineEditableField,
  value: unknown
): Promise<AdminProductMutationResult> {
  const authError = await requireAdmin()
  if (authError) {
    return { success: false, error: authError }
  }

  if (!INLINE_EDITABLE_FIELDS.includes(field)) {
    return { success: false, error: '수정할 수 없는 필드입니다' }
  }

  try {
    const image = await prisma.image.findUnique({
      where: { id: imageId },
      select: { id: true },
    })

    if (!image) {
      return { success: false, error: '상품을 찾을 수 없습니다' }
    }

    let sanitizedValue: unknown = value

    if (field === 'basePrice') {
      const num = Number(value)
      if (isNaN(num) || num <= 0 || num > 999_999_999) {
        return { success: false, error: '유효한 가격을 입력해주세요' }
      }
      sanitizedValue = num
    }

    if (field === 'name') {
      const str = String(value).trim()
      if (!str || str.length > 200) {
        return { success: false, error: '상품명은 1~200자로 입력해주세요' }
      }
      sanitizedValue = str
    }

    if (field === 'description') {
      const str = String(value ?? '').trim()
      if (str.length > 2000) {
        return { success: false, error: '설명은 2000자 이하로 입력해주세요' }
      }
      sanitizedValue = str || null
    }

    if (field === 'orientation') {
      if (!['LANDSCAPE', 'PORTRAIT', 'SQUARE'].includes(String(value))) {
        return { success: false, error: '유효하지 않은 방향입니다' }
      }
    }

    if (field === 'tags' || field === 'colorTags') {
      if (!Array.isArray(value)) {
        return { success: false, error: '태그는 배열이어야 합니다' }
      }
      sanitizedValue = value.map((v: unknown) => String(v).trim()).filter(Boolean)
    }

    await prisma.image.update({
      where: { id: imageId },
      data: { [field]: sanitizedValue },
    })

    revalidatePath('/admin/products')
    return { success: true }
  } catch (error) {
    console.error('[updateProductField]', error)
    return { success: false, error: '필드 수정에 실패했습니다' }
  }
}

export async function bulkDeleteProducts(
  imageIds: string[]
): Promise<AdminProductMutationResult> {
  const authError = await requireAdmin()
  if (authError) {
    return { success: false, error: authError }
  }

  if (!imageIds.length || imageIds.length > 100) {
    return { success: false, error: '1~100개의 상품을 선택해주세요' }
  }

  try {
    for (const id of imageIds) {
      await hardDeleteImage(id)
    }

    revalidatePath('/admin/products')
    return { success: true }
  } catch (error) {
    console.error('[bulkDeleteProducts]', error)
    return { success: false, error: '일괄 삭제에 실패했습니다' }
  }
}

export async function bulkUpdateProductsActive(
  imageIds: string[],
  isActive: boolean
): Promise<AdminProductMutationResult> {
  const authError = await requireAdmin()
  if (authError) {
    return { success: false, error: authError }
  }

  if (!imageIds.length || imageIds.length > 100) {
    return { success: false, error: '1~100개의 상품을 선택해주세요' }
  }

  try {
    await prisma.image.updateMany({
      where: { id: { in: imageIds } },
      data: { isActive },
    })

    revalidatePath('/admin/products')
    return { success: true }
  } catch (error) {
    console.error('[bulkUpdateProductsActive]', error)
    return { success: false, error: '일괄 상태 변경에 실패했습니다' }
  }
}

export async function toggleProductActive(
  imageId: string
): Promise<AdminProductMutationResult> {
  const authError = await requireAdmin()
  if (authError) {
    return { success: false, error: authError }
  }

  try {
    const image = await prisma.image.findUnique({
      where: { id: imageId },
      select: { isActive: true },
    })

    if (!image) {
      return { success: false, error: '상품을 찾을 수 없습니다' }
    }

    await prisma.image.update({
      where: { id: imageId },
      data: { isActive: !image.isActive },
    })

    revalidatePath('/admin/products')
    return { success: true }
  } catch (error) {
    console.error('[toggleProductActive]', error)
    return { success: false, error: '상태 변경에 실패했습니다' }
  }
}
