import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const { orderId } = await params

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
        orderItems: {
          include: {
            image: {
              select: { id: true, name: true, code: true, thumbnailUrl: true },
            },
          },
        },
        transactionLogs: {
          orderBy: { timestamp: 'desc' },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const serializedOrder = {
      ...order,
      totalAmount: Number(order.totalAmount),
      orderItems: order.orderItems.map((item) => ({
        ...item,
        price: Number(item.price),
      })),
    }

    return NextResponse.json({ order: serializedOrder })
  } catch (error) {
    console.error('[GET /api/admin/orders/[orderId]]', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
