'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { emailQueue } from '@/lib/queues'

export type AdminOrderActionResult =
  | { success: true }
  | { success: false; error: string }

async function requireAdmin() {
  const session = await auth()
  if (!session?.user) {
    return { error: '로그인이 필요합니다', userId: null }
  }
  if (session.user.role !== 'ADMIN') {
    return { error: '관리자 권한이 필요합니다', userId: null }
  }
  return { error: null, userId: session.user.id }
}

export async function resendOrderEmail(
  orderId: string,
  orderItemId: string
): Promise<AdminOrderActionResult> {
  const { error, userId } = await requireAdmin()
  if (error) {
    return { success: false, error }
  }

  try {
    const orderItem = await prisma.orderItem.findUnique({
      where: { id: orderItemId },
      include: {
        order: {
          include: {
            user: { select: { email: true } },
          },
        },
        image: { select: { name: true } },
      },
    })

    if (!orderItem || orderItem.orderId !== orderId) {
      return { success: false, error: '주문 아이템을 찾을 수 없습니다' }
    }

    await emailQueue.add('order-email-resend', {
      to: orderItem.order.user.email,
      type: 'ORDER_CONFIRMATION',
      payload: {
        orderNumber: orderItem.order.orderNumber,
        downloadToken: orderItem.downloadToken,
        imageName: orderItem.image.name,
      },
    })

    await prisma.transactionLog.create({
      data: {
        orderId,
        action: 'EMAIL_SENT',
        status: 'SUCCESS',
        details: {
          resendBy: userId,
          orderItemId,
          type: 'admin_resend',
        },
      },
    })

    revalidatePath('/admin/orders')
    return { success: true }
  } catch (err) {
    console.error('[resendOrderEmail]', err)
    return { success: false, error: '이메일 재발송에 실패했습니다' }
  }
}

export async function resetDownload(
  orderId: string,
  orderItemId: string
): Promise<AdminOrderActionResult> {
  const { error, userId } = await requireAdmin()
  if (error) {
    return { success: false, error }
  }

  try {
    const orderItem = await prisma.orderItem.findUnique({
      where: { id: orderItemId },
    })

    if (!orderItem || orderItem.orderId !== orderId) {
      return { success: false, error: '주문 아이템을 찾을 수 없습니다' }
    }

    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    await prisma.orderItem.update({
      where: { id: orderItemId },
      data: {
        downloadCount: 0,
        expiresAt: newExpiresAt,
      },
    })

    await prisma.transactionLog.create({
      data: {
        orderId,
        action: 'DOWNLOAD',
        status: 'SUCCESS',
        details: {
          resetBy: userId,
          orderItemId,
          reason: 'admin_reset',
        },
      },
    })

    revalidatePath('/admin/orders')
    return { success: true }
  } catch (err) {
    console.error('[resetDownload]', err)
    return { success: false, error: '다운로드 초기화에 실패했습니다' }
  }
}
