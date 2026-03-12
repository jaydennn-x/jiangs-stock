'use server'

import bcryptjs from 'bcryptjs'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import {
  passwordChangeSchema,
  profileUpdateSchema,
  type PasswordChangeFormData,
  type ProfileUpdateFormData,
} from '@/types/forms'
import type { OrderStatus, ImageSize, LicenseType } from '@/types/enums'

const BCRYPT_SALT_ROUNDS = 12

export type ActionResult =
  | { success: true }
  | { success: false; error: string }

export type OrderItemWithImage = {
  id: string
  orderId: string
  imageId: string
  size: ImageSize
  licenseType: LicenseType
  price: number
  downloadToken: string
  downloadCount: number
  downloadLimit: number
  expiresAt: Date
  image: { name: string; thumbnailUrl: string }
}

export type OrderWithItems = {
  id: string
  orderNumber: string
  userId: string
  totalAmount: number
  status: OrderStatus
  paymentMethod: string
  paymentId: string | null
  paidAt: Date | null
  createdAt: Date
  updatedAt: Date
  orderItems: OrderItemWithImage[]
}

export type MyOrdersResult =
  | { success: true; orders: OrderWithItems[] }
  | { success: false; error: string }

export type MyProfileResult =
  | {
      success: true
      profile: {
        email: string
        name: string | null
        country: string | null
        birthYear: number | null
      }
    }
  | { success: false; error: string }

export async function getMyOrders(): Promise<MyOrdersResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: '로그인이 필요합니다' }
  }

  try {
    const rawOrders = await prisma.order.findMany({
      where: { userId: session.user.id },
      include: {
        orderItems: {
          include: {
            image: {
              select: { name: true, thumbnailUrl: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const orders: OrderWithItems[] = rawOrders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      userId: order.userId,
      totalAmount: order.totalAmount.toNumber(),
      status: order.status as OrderStatus,
      paymentMethod: order.paymentMethod,
      paymentId: order.paymentId,
      paidAt: order.paidAt,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      orderItems: order.orderItems.map(item => ({
        id: item.id,
        orderId: item.orderId,
        imageId: item.imageId,
        size: item.size as ImageSize,
        licenseType: item.licenseType as LicenseType,
        price: item.price.toNumber(),
        downloadToken: item.downloadToken,
        downloadCount: item.downloadCount,
        downloadLimit: item.downloadLimit,
        expiresAt: item.expiresAt,
        image: item.image,
      })),
    }))

    return { success: true, orders }
  } catch (error) {
    console.error('[getMyOrders]', error)
    return { success: false, error: '구매 내역 조회 중 오류가 발생했습니다' }
  }
}

export async function getMyProfile(): Promise<MyProfileResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: '로그인이 필요합니다' }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, name: true, country: true, birthYear: true },
    })

    if (!user) {
      return { success: false, error: '사용자를 찾을 수 없습니다' }
    }

    return { success: true, profile: user }
  } catch (error) {
    console.error('[getMyProfile]', error)
    return { success: false, error: '프로필 조회 중 오류가 발생했습니다' }
  }
}

export async function changePassword(
  data: PasswordChangeFormData
): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: '로그인이 필요합니다' }
  }

  const parsed = passwordChangeSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: '입력값이 올바르지 않습니다' }
  }

  const { currentPassword, newPassword } = parsed.data

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { passwordHash: true },
    })

    if (!user) {
      return { success: false, error: '사용자를 찾을 수 없습니다' }
    }

    const isValid = await bcryptjs.compare(currentPassword, user.passwordHash)
    if (!isValid) {
      return { success: false, error: '현재 비밀번호가 올바르지 않습니다' }
    }

    const passwordHash = await bcryptjs.hash(newPassword, BCRYPT_SALT_ROUNDS)
    await prisma.user.update({
      where: { id: session.user.id },
      data: { passwordHash },
    })

    return { success: true }
  } catch (error) {
    console.error('[changePassword]', error)
    return { success: false, error: '비밀번호 변경 중 오류가 발생했습니다' }
  }
}

export async function updateProfile(
  data: ProfileUpdateFormData
): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: '로그인이 필요합니다' }
  }

  const parsed = profileUpdateSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: '입력값이 올바르지 않습니다' }
  }

  const { name, country, birthYear } = parsed.data

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { name, country, birthYear },
    })

    return { success: true }
  } catch (error) {
    console.error('[updateProfile]', error)
    return { success: false, error: '프로필 수정 중 오류가 발생했습니다' }
  }
}
