import Link from 'next/link'

import { formatPrice, getSizeLabel } from '@/lib/price'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import type { LocalCartItem } from '@/types/cart'

interface CartSummaryProps {
  items: LocalCartItem[]
  totalAmount: number
}

export function CartSummary({ items, totalAmount }: CartSummaryProps) {
  return (
    <div className="sticky top-8 h-fit space-y-4 rounded-lg border p-6">
      <h2 className="text-lg font-semibold">주문 요약</h2>

      <div className="space-y-2">
        {items.map(item => (
          <div key={item.id} className="flex justify-between text-sm">
            <span className="text-muted-foreground max-w-[180px] truncate">
              {item.imageName} · {getSizeLabel(item.size)}
            </span>
            <span className="font-medium">{formatPrice(item.price)}</span>
          </div>
        ))}
      </div>

      <Separator />

      <div className="flex justify-between font-semibold">
        <span>총 결제 금액</span>
        <span className="text-lg">{formatPrice(totalAmount)}</span>
      </div>

      <Button asChild className="w-full" size="lg">
        <Link href="/checkout">결제하기</Link>
      </Button>

      <div className="text-center">
        <Link
          href="/search"
          className="text-muted-foreground hover:text-foreground text-sm transition-colors hover:underline"
        >
          쇼핑 계속하기
        </Link>
      </div>
    </div>
  )
}
