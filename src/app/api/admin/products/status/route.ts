import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const idsParam = request.nextUrl.searchParams.get('ids')

    if (!idsParam) {
      return NextResponse.json({ statuses: [] })
    }

    const ids = idsParam.split(',').filter(Boolean).slice(0, 50)

    if (ids.length === 0) {
      return NextResponse.json({ statuses: [] })
    }

    const statuses = await prisma.image.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        processingStatus: true,
        thumbnailUrl: true,
      },
    })

    return NextResponse.json({ statuses })
  } catch (error) {
    console.error('[GET /api/admin/products/status]', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
