'use client'

import { useSyncExternalStore } from 'react'
import { useSession } from 'next-auth/react'
import { ShoppingCart } from 'lucide-react'

import { useCartStore } from '@/stores/cart-store'
import { removeFromServerCart, updateServerCartItem } from '@/lib/actions/cart'
import { calculatePrice } from '@/lib/price'
import { CartItemRow } from '@/components/cart/cart-item-row'
import { CartSummary } from '@/components/cart/cart-summary'
import { EmptyState } from '@/components/common/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import type { ImageSize, LicenseType } from '@/types/enums'

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
}

export default function CartPage() {
  const isClient = useIsClient()
  const { data: session } = useSession()
  const isLoggedIn = !!session?.user

  const items = useCartStore(s => s.items)
  const removeItem = useCartStore(s => s.removeItem)
  const updateItem = useCartStore(s => s.updateItem)
  const setItemsFromServer = useCartStore(s => s.setItemsFromServer)
  const totalAmount = useCartStore(s => s.totalAmount)

  async function handleRemove(id: string) {
    const item = items.find(i => i.id === id)
    if (isLoggedIn && item?.serverId) {
      await removeFromServerCart(item.serverId)
    }
    removeItem(id)
  }

  async function handleUpdate(
    id: string,
    size: ImageSize,
    licenseType: LicenseType,
    basePrice: number
  ) {
    const item = items.find(i => i.id === id)
    if (isLoggedIn && item?.serverId) {
      const result = await updateServerCartItem(
        item.serverId,
        item.imageId,
        size,
        licenseType
      )
      if (result.success) {
        const newPrice = calculatePrice(basePrice, size, licenseType)
        setItemsFromServer(
          items.map(i =>
            i.id === id
              ? { ...i, size, licenseType, price: newPrice, serverId: undefined }
              : i
          )
        )
        return
      }
    }
    updateItem(id, size, licenseType, basePrice)
  }

  if (!isClient) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="mb-8 h-8 w-48" />
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EmptyState
          icon={ShoppingCart}
          title="장바구니가 비어 있습니다"
          description="마음에 드는 이미지를 찾아 장바구니에 담아보세요"
          action={{ label: '이미지 검색하기', href: '/search' }}
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">장바구니 ({items.length}건)</h1>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
        <div className="divide-y">
          {items.map(item => (
            <CartItemRow
              key={item.id}
              item={item}
              onRemove={handleRemove}
              onUpdate={handleUpdate}
            />
          ))}
        </div>
        <CartSummary items={items} totalAmount={totalAmount()} />
      </div>
    </div>
  )
}
