import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const RELATED_IMAGES_LIMIT = 8

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ imageId: string }> }
) {
  const { imageId } = await params

  try {
    const image = await prisma.image.findFirst({
      where: { id: imageId, isActive: true, processingStatus: 'COMPLETED' },
      select: { tags: true },
    })

    if (!image) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: '이미지를 찾을 수 없습니다.' },
        },
        { status: 404 }
      )
    }

    const relatedImages = await prisma.image.findMany({
      where: {
        id: { not: imageId },
        isActive: true,
        processingStatus: 'COMPLETED',
        ...(image.tags.length > 0 && { tags: { hasSome: image.tags } }),
      },
      orderBy: { salesCount: 'desc' },
      take: RELATED_IMAGES_LIMIT,
    })

    const images = relatedImages.map(img => ({
      ...img,
      basePrice: Number(img.basePrice),
    }))

    return NextResponse.json({ success: true, data: { images } })
  } catch (error) {
    console.error('[GET /api/images/[imageId]/related]', error)
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' },
      },
      { status: 500 }
    )
  }
}
