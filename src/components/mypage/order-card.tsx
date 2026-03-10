'use client'

import { cn } from '@/lib/utils'
import { formatPrice } from '@/lib/price'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { CompleteOrderItem } from '@/components/checkout/complete-order-item'
import type { DummyOrder } from '@/lib/dummy/orders'
import type { Image } from '@/types/models'
import type { OrderStatus } from '@/types/enums'

const ORDER_STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; className: string }
> = {
  COMPLETED: {
    label: '결제완료',
    className: 'bg-green-500 text-white hover:bg-green-500/80',
  },
  PENDING: {
    label: '결제대기',
    className: 'bg-amber-500 text-white hover:bg-amber-500/80',
  },
  FAILED: {
    label: '결제실패',
    className: 'bg-destructive text-destructive-foreground hover:bg-destructive/80',
  },
  CANCELLED: {
    label: '취소됨',
    className: '',
  },
}

interface OrderCardProps {
  order: DummyOrder
  images: Image[]
}

export function OrderCard({ order, images }: OrderCardProps) {
  const statusConfig = ORDER_STATUS_CONFIG[order.status]

  function handleDownload(token: string) {
    alert(`다운로드 준비 중입니다. (더미)\n토큰: ${token}`)
  }

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value={order.id} className="rounded-lg border px-4">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex flex-1 flex-wrap items-center gap-x-4 gap-y-1 pr-2 text-left">
            <span className="text-muted-foreground text-sm">
              {order.createdAt.toLocaleDateString('ko-KR')}
            </span>
            <span className="font-mono text-sm font-medium">
              {order.orderNumber}
            </span>
            <span className="font-semibold">
              {formatPrice(order.totalAmount)}
            </span>
            <Badge className={cn('text-xs', statusConfig.className)}>
              {statusConfig.label}
            </Badge>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="divide-y pb-2">
            {order.items.map(item => (
              <CompleteOrderItem
                key={item.id}
                orderItem={item}
                image={images.find(img => img.id === item.imageId)}
                onDownload={handleDownload}
              />
            ))}
          </div>
          {order.items.length > 0 && (
            <p className="text-muted-foreground mt-2 text-xs">
              다운로드 만료일:{' '}
              {order.items[0].expiresAt.toLocaleDateString('ko-KR')}까지
            </p>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
