'use client'

import { useSyncExternalStore, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ShoppingCart, XCircle } from 'lucide-react'
import Link from 'next/link'

import { toast } from 'sonner'
import { useCartStore } from '@/stores/cart-store'
import { validateCartPrices } from '@/lib/actions/cart'
import { formatPrice } from '@/lib/price'
import { OrderSummary } from '@/components/checkout/order-summary'
import { PaymentMethodPlaceholder } from '@/components/checkout/payment-method-placeholder'
import { AgreeSection } from '@/components/checkout/agree-section'
import type { AgreeState } from '@/components/checkout/agree-section'
import { EmptyState } from '@/components/common/empty-state'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
}

export default function CheckoutPage() {
  const isClient = useIsClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const status = searchParams.get('status')

  const items = useCartStore(s => s.items)
  const setItemsFromServer = useCartStore(s => s.setItemsFromServer)
  const totalAmount = useCartStore(s => s.totalAmount)

  const [agreed, setAgreed] = useState<AgreeState>({
    payment: false,
    privacy: false,
    terms: false,
  })

  const allAgreed = agreed.payment && agreed.privacy && agreed.terms

  function handleAgreeChange(
    key: 'payment' | 'privacy' | 'terms',
    value: boolean
  ) {
    setAgreed(prev => ({ ...prev, [key]: value }))
  }

  async function handlePayment() {
    if (!allAgreed) return

    const result = await validateCartPrices(
      items.map(i => ({
        imageId: i.imageId,
        size: i.size,
        licenseType: i.licenseType,
        price: i.price,
      }))
    )

    if (!result.success) {
      toast.error('가격 검증 중 오류가 발생했습니다')
      return
    }

    if (!result.valid && result.changedItems.length > 0) {
      const updatedItems = items.map(item => {
        const changed = result.changedItems.find(
          c => c.imageId === item.imageId
        )
        return changed ? { ...item, price: changed.newPrice } : item
      })
      setItemsFromServer(updatedItems)
      toast.warning('가격이 변경된 상품이 있습니다', {
        description: '업데이트된 가격을 확인 후 다시 결제해주세요.',
      })
      return
    }

    router.push('/checkout/complete?orderId=dummy-order-001')
  }

  if (status === 'failed') {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-md space-y-6 text-center">
          <XCircle className="text-destructive mx-auto h-16 w-16" />
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">결제에 실패했습니다</h1>
            <p className="text-muted-foreground text-sm">
              결제 처리 중 오류가 발생했습니다. 다시 시도하거나 장바구니로
              돌아가세요.
            </p>
          </div>
          <div className="flex justify-center gap-3">
            <Button variant="outline" onClick={() => router.back()}>
              다시 시도
            </Button>
            <Button asChild>
              <Link href="/cart">장바구니로</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!isClient) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="mb-8 h-8 w-32" />
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-40 w-full" />
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
          description="결제할 상품이 없습니다. 장바구니에 상품을 담아주세요."
          action={{ label: '장바구니로', href: '/cart' }}
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">결제</h1>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <OrderSummary items={items} totalAmount={totalAmount()} />
          <PaymentMethodPlaceholder />
          <AgreeSection agreed={agreed} onChange={handleAgreeChange} />
        </div>

        <div className="sticky top-8 h-fit">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">최종 결제 금액</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-2xl font-bold">{formatPrice(totalAmount())}</p>
              <Button
                className="w-full"
                size="lg"
                disabled={!allAgreed}
                onClick={handlePayment}
              >
                결제하기
              </Button>
              {!allAgreed && (
                <p className="text-muted-foreground text-center text-xs">
                  모든 항목에 동의 후 결제 가능합니다
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
