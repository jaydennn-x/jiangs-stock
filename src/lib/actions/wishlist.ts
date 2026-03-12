'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export type WishlistActionResult =
  | { success: true; wishlisted: boolean }
  | { success: false; error: string }

export async function toggleWishlist(
  imageId: string
): Promise<WishlistActionResult> {
  const session = await auth()

  if (!session?.user?.id) {
    return { success: false, error: '로그인이 필요합니다' }
  }

  const userId = session.user.id

  try {
    const existing = await prisma.wishlist.findUnique({
      where: { userId_imageId: { userId, imageId } },
    })

    if (existing) {
      await prisma.wishlist.delete({
        where: { userId_imageId: { userId, imageId } },
      })
      revalidatePath('/wishlist')
      return { success: true, wishlisted: false }
    } else {
      await prisma.wishlist.create({
        data: { userId, imageId },
      })
      revalidatePath('/wishlist')
      return { success: true, wishlisted: true }
    }
  } catch (error) {
    console.error('[toggleWishlist]', error)
    return { success: false, error: '위시리스트 처리 중 오류가 발생했습니다' }
  }
}
