'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2, Info, Mail } from 'lucide-react'

import { dummyOrders } from '@/lib/dummy/orders'
import { dummyImages } from '@/lib/dummy/images'
import {
  DEFAULT_DOWNLOAD_EXPIRES_DAYS,
  DEFAULT_DOWNLOAD_LIMIT,
} from '@/lib/constants'
import { CompleteOrderItem } from '@/components/checkout/complete-order-item'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export default function CheckoutCompletePage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')

  const order =
    dummyOrders.find(o => o.id === orderId) ?? dummyOrders[0]

  function handleDownload(token: string) {
    alert(`다운로드 준비 중입니다. (더미)\n토큰: ${token}`)
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="space-y-6">
        <div className="space-y-3 text-center">
          <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
          <h1 className="text-2xl font-bold">결제가 완료되었습니다</h1>
          <p className="text-muted-foreground text-sm">
            주문번호:{' '}
            <span className="font-mono font-semibold text-foreground">
              {order.orderNumber}
            </span>
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 rounded-lg bg-muted px-4 py-3">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            구매 확인 이메일이 발송되었습니다
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">구매한 이미지</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {order.items.map(item => (
                <CompleteOrderItem
                  key={item.id}
                  orderItem={item}
                  image={dummyImages.find(img => img.id === item.imageId)}
                  onDownload={handleDownload}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex items-start gap-3 rounded-lg border bg-muted/50 px-4 py-3">
          <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            다운로드는 구매일로부터{' '}
            <span className="font-semibold text-foreground">
              {DEFAULT_DOWNLOAD_EXPIRES_DAYS}일
            </span>{' '}
            이내,{' '}
            <span className="font-semibold text-foreground">
              최대 {DEFAULT_DOWNLOAD_LIMIT}회
            </span>
            까지 가능합니다. 기간 및 횟수 초과 시 다운로드가 불가합니다.
          </p>
        </div>

        <Separator />

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button variant="outline" asChild>
            <Link href="/mypage/orders">구매 내역으로 이동</Link>
          </Button>
          <Button asChild>
            <Link href="/">홈으로</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
