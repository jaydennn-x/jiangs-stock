'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import {
  SIZE_RATIOS,
  DEFAULT_LICENSE_EXTENDED_MULTIPLIER,
} from '@/lib/constants'
import type { ImageSize, LicenseType } from '@/types/enums'
import type { LocalCartItem, PriceChangedItem } from '@/types/cart'

export type CartActionResult =
  | { success: true; items: LocalCartItem[] }
  | { success: false; error: string }

export type CartMutationResult =
  | { success: true }
  | { success: false; error: string }

export type MergeCartResult =
  | {
      success: true
      mergedItems: LocalCartItem[]
      priceChangedItems: PriceChangedItem[]
    }
  | { success: false; error: string }

export type ValidateCartPricesResult =
  | { success: true; valid: boolean; changedItems: PriceChangedItem[] }
  | { success: false; error: string }

async function getExtendedMultiplier(): Promise<number> {
  try {
    const config = await prisma.systemConfig.findUnique({
      where: { key: 'EXTENDED_LICENSE_MULTIPLIER' },
    })
    if (config) return parseFloat(config.value)
  } catch {
    // 폴백
  }
  return DEFAULT_LICENSE_EXTENDED_MULTIPLIER
}

function calculateServerPrice(
  basePrice: number,
  size: ImageSize,
  licenseType: LicenseType,
  extendedMultiplier: number
): number {
  const sizeRatio = SIZE_RATIOS[size]
  const licenseMultiplier = licenseType === 'EXTENDED' ? extendedMultiplier : 1
  return Math.round(basePrice * sizeRatio * licenseMultiplier)
}

type CartItemWithImage = {
  id: string
  imageId: string
  size: ImageSize
  licenseType: LicenseType
  image: {
    name: string
    thumbnailUrl: string
    basePrice: { toNumber: () => number } | number
  }
}

function cartItemToLocal(
  item: CartItemWithImage,
  extendedMultiplier: number
): LocalCartItem {
  const basePrice =
    typeof item.image.basePrice === 'number'
      ? item.image.basePrice
      : item.image.basePrice.toNumber()
  return {
    id: crypto.randomUUID(),
    serverId: item.id,
    imageId: item.imageId,
    size: item.size,
    licenseType: item.licenseType,
    price: calculateServerPrice(
      basePrice,
      item.size,
      item.licenseType,
      extendedMultiplier
    ),
    basePrice,
    imageName: item.image.name,
    thumbnailUrl: `/api/images/thumbnail/${item.imageId}`,
    addedAt: Date.now(),
  }
}

async function getUserCart(userId: string) {
  return prisma.cart.findUnique({
    where: { userId },
    include: {
      cartItems: {
        include: { image: true },
        orderBy: { createdAt: 'asc' },
      },
    },
  })
}

async function upsertCart(userId: string) {
  return prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
  })
}

export async function getServerCart(): Promise<CartActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: '로그인이 필요합니다' }
  }

  try {
    const extendedMultiplier = await getExtendedMultiplier()
    const cart = await getUserCart(session.user.id)
    if (!cart) return { success: true, items: [] }

    const items = cart.cartItems.map(item =>
      cartItemToLocal(item as CartItemWithImage, extendedMultiplier)
    )
    return { success: true, items }
  } catch (error) {
    console.error('[getServerCart]', error)
    return { success: false, error: '장바구니 조회 중 오류가 발생했습니다' }
  }
}

export async function addToServerCart(
  imageId: string,
  size: ImageSize,
  licenseType: LicenseType
): Promise<CartMutationResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: '로그인이 필요합니다' }
  }

  try {
    const cart = await upsertCart(session.user.id)
    await prisma.cartItem.upsert({
      where: {
        cartId_imageId_size_licenseType: {
          cartId: cart.id,
          imageId,
          size,
          licenseType,
        },
      },
      update: {},
      create: { cartId: cart.id, imageId, size, licenseType },
    })
    return { success: true }
  } catch (error) {
    console.error('[addToServerCart]', error)
    return { success: false, error: '장바구니 추가 중 오류가 발생했습니다' }
  }
}

export async function removeFromServerCart(
  cartItemId: string
): Promise<CartMutationResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: '로그인이 필요합니다' }
  }

  try {
    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
    })
    if (!cart) return { success: false, error: '장바구니를 찾을 수 없습니다' }

    const item = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
    })
    if (!item || item.cartId !== cart.id) {
      return { success: false, error: '삭제 권한이 없습니다' }
    }

    await prisma.cartItem.delete({ where: { id: cartItemId } })
    return { success: true }
  } catch (error) {
    console.error('[removeFromServerCart]', error)
    return { success: false, error: '장바구니 삭제 중 오류가 발생했습니다' }
  }
}

export async function updateServerCartItem(
  cartItemId: string,
  imageId: string,
  newSize: ImageSize,
  newLicenseType: LicenseType
): Promise<CartMutationResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: '로그인이 필요합니다' }
  }

  try {
    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
    })
    if (!cart) return { success: false, error: '장바구니를 찾을 수 없습니다' }

    const item = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
    })
    if (!item || item.cartId !== cart.id) {
      return { success: false, error: '수정 권한이 없습니다' }
    }

    await prisma.$transaction([
      prisma.cartItem.delete({ where: { id: cartItemId } }),
      prisma.cartItem.create({
        data: {
          cartId: cart.id,
          imageId,
          size: newSize,
          licenseType: newLicenseType,
        },
      }),
    ])
    return { success: true }
  } catch (error) {
    console.error('[updateServerCartItem]', error)
    return { success: false, error: '장바구니 수정 중 오류가 발생했습니다' }
  }
}

export async function mergeCart(
  localItems: LocalCartItem[]
): Promise<MergeCartResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: '로그인이 필요합니다' }
  }

  try {
    const extendedMultiplier = await getExtendedMultiplier()
    const cart = await upsertCart(session.user.id)
    const existingCart = await getUserCart(session.user.id)
    const serverItems = existingCart?.cartItems ?? []

    const toAdd = localItems.filter(
      localItem =>
        !serverItems.some(
          si =>
            si.imageId === localItem.imageId &&
            si.size === localItem.size &&
            si.licenseType === localItem.licenseType
        )
    )

    if (toAdd.length > 0) {
      await prisma.cartItem.createMany({
        data: toAdd.map(item => ({
          cartId: cart.id,
          imageId: item.imageId,
          size: item.size,
          licenseType: item.licenseType,
        })),
        skipDuplicates: true,
      })
    }

    const finalCart = await getUserCart(session.user.id)
    const mergedItems = (finalCart?.cartItems ?? []).map(item =>
      cartItemToLocal(item as CartItemWithImage, extendedMultiplier)
    )

    const priceChangedItems: PriceChangedItem[] = []
    for (const mergedItem of mergedItems) {
      const localItem = localItems.find(
        li =>
          li.imageId === mergedItem.imageId &&
          li.size === mergedItem.size &&
          li.licenseType === mergedItem.licenseType
      )
      if (localItem && localItem.price !== mergedItem.price) {
        priceChangedItems.push({
          imageId: mergedItem.imageId,
          oldPrice: localItem.price,
          newPrice: mergedItem.price,
        })
      }
    }

    return { success: true, mergedItems, priceChangedItems }
  } catch (error) {
    console.error('[mergeCart]', error)
    return { success: false, error: '장바구니 병합 중 오류가 발생했습니다' }
  }
}

export async function clearServerCart(): Promise<CartMutationResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: '로그인이 필요합니다' }
  }

  try {
    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
    })
    if (!cart) return { success: true }

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } })
    return { success: true }
  } catch (error) {
    console.error('[clearServerCart]', error)
    return {
      success: false,
      error: '장바구니 초기화 중 오류가 발생했습니다',
    }
  }
}

export async function validateCartPrices(
  items: {
    imageId: string
    size: ImageSize
    licenseType: LicenseType
    price: number
  }[]
): Promise<ValidateCartPricesResult> {
  try {
    const extendedMultiplier = await getExtendedMultiplier()
    const changedItems: PriceChangedItem[] = []

    for (const item of items) {
      const image = await prisma.image.findUnique({
        where: { id: item.imageId },
        select: { basePrice: true },
      })
      if (!image) continue

      const basePrice = image.basePrice.toNumber()
      const serverPrice = calculateServerPrice(
        basePrice,
        item.size,
        item.licenseType,
        extendedMultiplier
      )

      if (serverPrice !== item.price) {
        changedItems.push({
          imageId: item.imageId,
          oldPrice: item.price,
          newPrice: serverPrice,
        })
      }
    }

    return { success: true, valid: changedItems.length === 0, changedItems }
  } catch (error) {
    console.error('[validateCartPrices]', error)
    return { success: false, error: '가격 검증 중 오류가 발생했습니다' }
  }
}
