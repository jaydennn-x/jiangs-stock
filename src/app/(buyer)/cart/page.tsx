'use client'

import { useSyncExternalStore } from 'react'
import { ShoppingCart } from 'lucide-react'

import { useCartStore } from '@/stores/cart-store'
import { CartItemRow } from '@/components/cart/cart-item-row'
import { CartSummary } from '@/components/cart/cart-summary'
import { EmptyState } from '@/components/common/empty-state'
import { Skeleton } from '@/components/ui/skeleton'

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
}

export default function CartPage() {
  const isClient = useIsClient()
  const items = useCartStore(s => s.items)
  const removeItem = useCartStore(s => s.removeItem)
  const updateItem = useCartStore(s => s.updateItem)
  const totalAmount = useCartStore(s => s.totalAmount)

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
              onRemove={removeItem}
              onUpdate={updateItem}
            />
          ))}
        </div>
        <CartSummary items={items} totalAmount={totalAmount()} />
      </div>
    </div>
  )
}
