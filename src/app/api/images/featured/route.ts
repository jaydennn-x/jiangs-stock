import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_request: NextRequest) {
  try {
    // 활성화된 이미지 중 랜덤으로 1개 선택
    const count = await prisma.image.count({
      where: { isActive: true, processingStatus: 'COMPLETED' },
    })

    if (count === 0) {
      return Response.json(null)
    }

    const skip = Math.floor(Math.random() * count)
    const image = await prisma.image.findFirst({
      where: { isActive: true, processingStatus: 'COMPLETED' },
      select: {
        id: true,
        name: true,
        description: true,
      },
      skip,
    })

    return Response.json(image)
  } catch (error) {
    console.error('[GET /api/images/featured]', error)
    return Response.json(null)
  }
}
