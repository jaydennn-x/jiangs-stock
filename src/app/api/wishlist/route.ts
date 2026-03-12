import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import type { Image } from '@/types/models'

export async function GET(_request: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = session.user.id

  try {
    const items = await prisma.wishlist.findMany({
      where: { userId },
      include: {
        image: {
          include: { category: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const images: Image[] = items.map(item => ({
      ...item.image,
      description: item.image.description ?? undefined,
      shootDate: item.image.shootDate ?? undefined,
      basePrice: Number(item.image.basePrice),
      sizesJson: item.image.sizesJson as unknown as Image['sizesJson'],
      fileSizesJson: item.image
        .fileSizesJson as unknown as Image['fileSizesJson'],
    }))

    return NextResponse.json({ success: true, data: { images } })
  } catch (error) {
    console.error('[GET /api/wishlist]', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
