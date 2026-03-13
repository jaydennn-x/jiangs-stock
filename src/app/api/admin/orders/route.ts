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
    const search = searchParams.get('search') || undefined
    const startDate = searchParams.get('startDate') || undefined
    const endDate = searchParams.get('endDate') || undefined
    const status = searchParams.get('status') || undefined

    const where: Prisma.OrderWhereInput = {}

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ]
    }

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        where.createdAt.gte = new Date(startDate)
      }
      if (endDate) {
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)
        where.createdAt.lte = end
      }
    }

    if (status) {
      where.status = status as Prisma.EnumOrderStatusFilter
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: {
            select: { id: true, email: true, name: true },
          },
          orderItems: {
            include: {
              image: {
                select: { id: true, name: true, thumbnailUrl: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
    ])

    const serializedOrders = orders.map((order) => ({
      ...order,
      totalAmount: Number(order.totalAmount),
      orderItems: order.orderItems.map((item) => ({
        ...item,
        price: Number(item.price),
      })),
    }))

    return NextResponse.json({
      orders: serializedOrders,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('[GET /api/admin/orders]', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
