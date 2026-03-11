'use client'

import { useState, useEffect } from 'react'
import { Mail, RefreshCw } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type { DummyOrder } from '@/lib/dummy'
import type { User, Image, OrderItem } from '@/types/models'
import type { OrderStatus, ImageSize, LicenseType } from '@/types/enums'

interface OrderDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: DummyOrder | null
  users: User[]
  images: Image[]
  onResetDownload: (orderId: string, itemId: string) => void
}

const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  COMPLETED: '완료',
  PENDING: '대기',
  FAILED: '실패',
  CANCELLED: '취소',
}

const ORDER_STATUS_VARIANT: Record<
  OrderStatus,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  COMPLETED: 'default',
  PENDING: 'secondary',
  FAILED: 'destructive',
  CANCELLED: 'outline',
}

const SIZE_LABEL: Record<ImageSize, string> = {
  XL: 'XL',
  L: 'L',
  M: 'M',
  S: 'S',
}

const LICENSE_LABEL: Record<LicenseType, string> = {
  STANDARD: '스탠다드',
  EXTENDED: '확장',
}

export function OrderDetailModal({
  open,
  onOpenChange,
  order,
  users,
  images,
  onResetDownload,
}: OrderDetailModalProps) {
  const [localItems, setLocalItems] = useState<OrderItem[]>([])

  useEffect(() => {
    setLocalItems(order?.items ? [...order.items] : [])
  }, [order])

  if (!order) return null

  const userEmail = users.find(u => u.id === order.userId)?.email ?? '-'

  function handleResetDownload(itemId: string) {
    setLocalItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, downloadCount: 0 } : item
      )
    )
    onResetDownload(order!.id, itemId)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>주문 상세</DialogTitle>
        </DialogHeader>

        {/* 주문 기본 정보 */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">주문 정보</h3>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div>
              <dt className="text-muted-foreground">주문번호</dt>
              <dd className="mt-0.5 font-mono text-xs font-medium">
                {order.orderNumber}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">상태</dt>
              <dd className="mt-0.5">
                <Badge variant={ORDER_STATUS_VARIANT[order.status]}>
                  {ORDER_STATUS_LABEL[order.status]}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">구매자 이메일</dt>
              <dd className="mt-0.5 font-medium">{userEmail}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">결제 금액</dt>
              <dd className="mt-0.5 font-medium">
                {order.totalAmount.toLocaleString('ko-KR')}원
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">결제 수단</dt>
              <dd className="mt-0.5">{order.paymentMethod}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">결제일</dt>
              <dd className="mt-0.5">
                {order.paidAt
                  ? order.paidAt.toLocaleDateString('ko-KR')
                  : '-'}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">주문일</dt>
              <dd className="mt-0.5">
                {order.createdAt.toLocaleDateString('ko-KR')}
              </dd>
            </div>
          </dl>
        </div>

        <Separator />

        {/* 구매 아이템 목록 */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">
            구매 이미지 ({localItems.length}건)
          </h3>
          <div className="space-y-3">
            {localItems.map(item => {
              const imageName =
                images.find(img => img.id === item.imageId)?.name ??
                item.imageId
              return (
                <div
                  key={item.id}
                  className="rounded-lg border p-3 text-sm"
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{imageName}</p>
                      <p className="text-muted-foreground text-xs">
                        {SIZE_LABEL[item.size]} · {LICENSE_LABEL[item.licenseType]} ·{' '}
                        {item.price.toLocaleString('ko-KR')}원
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="text-muted-foreground space-y-0.5 text-xs">
                      <p>
                        다운로드:{' '}
                        <span
                          className={
                            item.downloadCount >= item.downloadLimit
                              ? 'text-destructive font-medium'
                              : 'text-foreground font-medium'
                          }
                        >
                          {item.downloadCount} / {item.downloadLimit}회
                        </span>
                      </p>
                      <p>
                        만료일:{' '}
                        {item.expiresAt.toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1.5">
                      <Button variant="outline" size="sm">
                        <Mail className="mr-1 h-3.5 w-3.5" />
                        이메일 재발송
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResetDownload(item.id)}
                        disabled={item.downloadCount === 0}
                      >
                        <RefreshCw className="mr-1 h-3.5 w-3.5" />
                        다운로드 초기화
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
