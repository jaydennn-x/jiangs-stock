'use client'

import { useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'

import { useCartStore } from '@/stores/cart-store'
import { mergeCart, getServerCart } from '@/lib/actions/cart'

export function CartSyncProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const setItemsFromServer = useCartStore(s => s.setItemsFromServer)
  const clearCart = useCartStore(s => s.clearCart)
  const items = useCartStore(s => s.items)

  const prevStatusRef = useRef<string | null>(null)
  const hasSyncedRef = useRef(false)

  useEffect(() => {
    if (status === 'loading') return

    const prevStatus = prevStatusRef.current

    if (status === 'authenticated' && session) {
      if (prevStatus !== 'authenticated' || !hasSyncedRef.current) {
        hasSyncedRef.current = true

        if (items.length > 0) {
          mergeCart(items).then(result => {
            if (result.success) {
              setItemsFromServer(result.mergedItems)
              if (result.priceChangedItems.length > 0) {
                toast.warning('가격이 변경된 상품이 있습니다', {
                  description: '장바구니 가격이 최신 정보로 업데이트되었습니다.',
                })
              }
            }
          })
        } else {
          getServerCart().then(result => {
            if (result.success) {
              setItemsFromServer(result.items)
            }
          })
        }
      }
    } else if (status === 'unauthenticated') {
      if (prevStatus === 'authenticated') {
        clearCart()
      }
      hasSyncedRef.current = false
    }

    prevStatusRef.current = status
  }, [status, session, setItemsFromServer, clearCart, items])

  return <>{children}</>
}
