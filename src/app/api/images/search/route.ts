import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { Prisma } from '@/generated/prisma/client'

const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100

function buildOrderBy(sort: string): Prisma.ImageOrderByWithRelationInput {
  switch (sort) {
    case 'latest':
      return { createdAt: 'desc' }
    case 'price_asc':
      return { basePrice: 'asc' }
    case 'price_desc':
      return { basePrice: 'desc' }
    case 'popular':
    case 'relevant':
    default:
      return { salesCount: 'desc' }
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl

    const q = searchParams.get('q') ?? ''
    const tag = searchParams.get('tag') ?? ''
    const orientation = searchParams.get('orientation') ?? ''
    const colorTag = searchParams.get('colorTag') ?? ''
    const sort = searchParams.get('sort') ?? 'popular'
    const cursor = searchParams.get('cursor') ?? ''
    const minPrice = searchParams.get('minPrice')
      ? Number(searchParams.get('minPrice'))
      : undefined
    const maxPrice = searchParams.get('maxPrice')
      ? Number(searchParams.get('maxPrice'))
      : undefined
    const rawLimit = Number(searchParams.get('limit') ?? DEFAULT_LIMIT)
    const limit = Math.min(Math.max(1, rawLimit), MAX_LIMIT)

    const where: Prisma.ImageWhereInput = {
      isActive: true,
      processingStatus: 'COMPLETED',
    }

    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { tags: { hasSome: [q] } },
      ]
    }

    if (tag) {
      where.tags = { has: tag }
    }

    if (colorTag) {
      where.colorTags = { has: colorTag }
    }

    if (orientation) {
      where.orientation = orientation as Prisma.EnumOrientationFilter['equals']
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.basePrice = {}
      if (minPrice !== undefined) where.basePrice.gte = minPrice
      if (maxPrice !== undefined) where.basePrice.lte = maxPrice
    }

    const orderBy = buildOrderBy(sort)

    const queryOptions: Prisma.ImageFindManyArgs = {
      where,
      orderBy,
      take: limit + 1,
    }

    if (cursor) {
      queryOptions.cursor = { id: cursor }
      queryOptions.skip = 1
    }

    const [rawImages, totalCount] = await Promise.all([
      prisma.image.findMany(queryOptions),
      cursor ? Promise.resolve(undefined) : prisma.image.count({ where }),
    ])

    const hasNextPage = rawImages.length > limit
    if (hasNextPage) rawImages.pop()

    const nextCursor = hasNextPage
      ? rawImages[rawImages.length - 1]?.id
      : undefined

    const images = rawImages.map(img => ({
      ...img,
      basePrice: Number(img.basePrice),
    }))

    return NextResponse.json({
      success: true,
      data: {
        images,
        pagination: {
          hasNextPage,
          nextCursor,
          totalCount,
        },
      },
    })
  } catch (error) {
    console.error('[GET /api/images/search]', error)
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' },
      },
      { status: 500 }
    )
  }
}
