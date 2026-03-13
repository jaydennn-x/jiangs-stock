import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import type { Prisma } from '@/generated/prisma/client'

export async function GET(request: NextRequest) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const { searchParams } = request.nextUrl
    const page = Math.max(1, Number(searchParams.get('page')) || 1)
    const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit')) || 10))
    const categoryId = searchParams.get('categoryId') || undefined
    const isActiveParam = searchParams.get('isActive')
    const search = searchParams.get('search') || undefined
    const sort = searchParams.get('sort') || 'createdAt_desc'

    const where: Prisma.ImageWhereInput = {}

    if (categoryId) {
      where.categoryId = categoryId
    }

    if (isActiveParam !== null) {
      where.isActive = isActiveParam === 'true'
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ]
    }

    const orderBy = parseSort(sort)

    const [images, total] = await Promise.all([
      prisma.image.findMany({
        where,
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.image.count({ where }),
    ])

    return NextResponse.json({
      images,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('[GET /api/admin/products]', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

function parseSort(sort: string): Prisma.ImageOrderByWithRelationInput {
  const [field, direction] = sort.split('_')
  const dir = direction === 'asc' ? 'asc' : 'desc'

  switch (field) {
    case 'name':
      return { name: dir }
    case 'basePrice':
      return { basePrice: dir }
    case 'salesCount':
      return { salesCount: dir }
    default:
      return { createdAt: dir }
  }
}
