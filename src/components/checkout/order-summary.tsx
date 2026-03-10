import Image from 'next/image'

import { formatPrice, getSizeLabel } from '@/lib/price'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import type { LocalCartItem } from '@/types/cart'

interface OrderSummaryProps {
  items: LocalCartItem[]
  totalAmount: number
}

export function OrderSummary({ items, totalAmount }: OrderSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">주문 상품</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-3">
            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border">
              <Image
                src={item.thumbnailUrl}
                alt={item.imageName}
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{item.imageName}</p>
              <p className="text-muted-foreground text-xs">
                {getSizeLabel(item.size)} ·{' '}
                {item.licenseType === 'STANDARD' ? '스탠다드' : '확장'} 라이선스
              </p>
            </div>
            <span className="flex-shrink-0 text-sm font-semibold">
              {formatPrice(item.price)}
            </span>
          </div>
        ))}

        <Separator />

        <div className="flex items-center justify-between font-semibold">
          <span>총 결제 금액</span>
          <span className="text-lg">{formatPrice(totalAmount)}</span>
        </div>
      </CardContent>
    </Card>
  )
}
