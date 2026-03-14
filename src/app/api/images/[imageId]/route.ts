import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { calculatePrice } from '@/lib/price'
import { getExtendedMultiplier } from '@/lib/actions/cart'
import type { ImageSize, LicenseType } from '@/types/enums'

const SIZES: ImageSize[] = ['XL', 'L', 'M', 'S']
const LICENSE_TYPES: LicenseType[] = ['STANDARD', 'EXTENDED']

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ imageId: string }> }
) {
  const { imageId } = await params

  try {
    const session = await auth()

    const image = await prisma.image.findFirst({
      where: { id: imageId, isActive: true, processingStatus: 'COMPLETED' },
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

    let isPurchased = false
    if (session?.user?.id) {
      const orderItem = await prisma.orderItem.findFirst({
        where: {
          imageId,
          order: { userId: session.user.id, status: 'COMPLETED' },
        },
        include: { order: true },
      })
      isPurchased = !!orderItem
    }

    const basePrice = Number(image.basePrice)
    const extendedMultiplier = await getExtendedMultiplier()
    const sizesJson = image.sizesJson as Record<
      string,
      { width: number; height: number; path: string }
    >
    const fileSizesJson = image.fileSizesJson as Record<string, number>

    const priceOptions = SIZES.flatMap(size =>
      LICENSE_TYPES.map(licenseType => ({
        size,
        licenseType,
        price: calculatePrice(basePrice, size, licenseType, extendedMultiplier),
        width: sizesJson[size]?.width ?? 0,
        height: sizesJson[size]?.height ?? 0,
        fileSizeBytes: fileSizesJson[size] ?? 0,
      }))
    )

    return NextResponse.json({
      success: true,
      data: {
        ...image,
        basePrice,
        priceOptions,
        isPurchased,
      },
    })
  } catch (error) {
    console.error('[GET /api/images/[imageId]]', error)
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' },
      },
      { status: 500 }
    )
  }
}
