import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { uploadImage } from '@/lib/services/image-upload.service'
import {
  IMAGE_UPLOAD_MAX_SIZE_BYTES,
  ALLOWED_IMAGE_FORMATS,
} from '@/lib/constants'
import { createProductSchema } from '@/lib/validations/admin-product'
import { cleanupImageFiles } from '@/lib/image-processing/storage'

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

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
  }
  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: '관리자 권한이 필요합니다' }, { status: 403 })
  }

  try {
    const formData = await request.formData()

    const file = formData.get('file')
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: '이미지 파일을 선택해주세요', field: 'file' },
        { status: 400 }
      )
    }

    if (file.size > IMAGE_UPLOAD_MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: `파일 크기가 너무 큽니다 (${Math.round(file.size / 1024 / 1024)}MB). 최대 50MB까지 가능합니다.`, field: 'file' },
        { status: 400 }
      )
    }

    const metadataRaw = formData.get('metadata')
    if (!metadataRaw || typeof metadataRaw !== 'string') {
      return NextResponse.json(
        { error: '상품 정보가 누락되었습니다. 다시 시도해주세요.' },
        { status: 400 }
      )
    }

    let metadata: unknown
    try {
      metadata = JSON.parse(metadataRaw)
    } catch {
      return NextResponse.json(
        { error: '상품 정보 형식이 올바르지 않습니다.' },
        { status: 400 }
      )
    }

    const validated = createProductSchema.safeParse(metadata)
    if (!validated.success) {
      const issue = validated.error.issues[0]
      const fieldMap: Record<string, string> = {
        name: '상품명을 입력해주세요',
        code: '상품 코드는 숫자만 입력 가능합니다',
        basePrice: '유효한 가격을 입력해주세요 (1원 이상)',
      }
      const field = String(issue?.path?.[0] ?? '')
      return NextResponse.json(
        { error: fieldMap[field] ?? issue?.message ?? '입력값을 확인해주세요', field },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    const sharp = (await import('sharp')).default
    const sharpMetadata = await sharp(buffer).metadata()

    if (!sharpMetadata.width || !sharpMetadata.height || !sharpMetadata.format) {
      return NextResponse.json(
        { error: '이미지 파일을 읽을 수 없습니다. 손상된 파일인지 확인해주세요.', field: 'file' },
        { status: 400 }
      )
    }

    const format = sharpMetadata.format === 'tiff' ? 'tiff' : sharpMetadata.format
    if (
      !ALLOWED_IMAGE_FORMATS.includes(
        format as (typeof ALLOWED_IMAGE_FORMATS)[number]
      )
    ) {
      return NextResponse.json(
        { error: `지원하지 않는 이미지 형식입니다 (${format}). JPG, PNG, TIFF만 가능합니다.`, field: 'file' },
        { status: 400 }
      )
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

    // Check for duplicate code
    const existing = await prisma.image.findUnique({
      where: { code },
      select: { id: true },
    })
    if (existing) {
      return NextResponse.json(
        { error: `상품 코드 "${code}"가 이미 사용 중입니다. 다른 코드를 입력해주세요.`, field: 'code' },
        { status: 409 }
      )
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
    return NextResponse.json({ success: true, imageId: image.id })
  } catch (error) {
    console.error('[POST /api/admin/products/upload]', error)
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { error: `상품 등록 중 서버 오류: ${message}` },
      { status: 500 }
    )
  }
}
