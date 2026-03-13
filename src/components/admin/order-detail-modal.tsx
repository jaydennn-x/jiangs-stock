'use client'

import { Loader2, Mail, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  useAdminOrderDetail,
  useResendEmail,
  useResetDownload,
} from '@/lib/hooks/use-admin-orders'
import type { OrderStatus, ImageSize, LicenseType } from '@/types/enums'

interface OrderDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderId: string | null
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
  orderId,
}: OrderDetailModalProps) {
  const { data, isPending } = useAdminOrderDetail(open ? orderId : null)
  const resendEmail = useResendEmail()
  const resetDownloadMutation = useResetDownload()

  const order = data?.order

  function handleResendEmail(orderItemId: string) {
    if (!orderId) return
    resendEmail.mutate(
      { orderId, orderItemId },
      {
        onSuccess: (result) => {
          if (result.success) {
            toast.success('이메일이 재발송되었습니다')
          } else {
            toast.error(result.error)
          }
        },
        onError: () => {
          toast.error('이메일 재발송에 실패했습니다')
        },
      }
    )
  }

  function handleResetDownload(orderItemId: string) {
    if (!orderId) return
    resetDownloadMutation.mutate(
      { orderId, orderItemId },
      {
        onSuccess: (result) => {
          if (result.success) {
            toast.success('다운로드가 초기화되었습니다')
          } else {
            toast.error(result.error)
          }
        },
        onError: () => {
          toast.error('다운로드 초기화에 실패했습니다')
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>주문 상세</DialogTitle>
        </DialogHeader>

        {isPending ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : !order ? (
          <p className="text-muted-foreground py-12 text-center text-sm">
            주문 정보를 불러올 수 없습니다.
          </p>
        ) : (
          <>
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
                    <Badge
                      variant={
                        ORDER_STATUS_VARIANT[order.status as OrderStatus]
                      }
                    >
                      {ORDER_STATUS_LABEL[order.status as OrderStatus]}
                    </Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">구매자 이메일</dt>
                  <dd className="mt-0.5 font-medium">{order.user.email}</dd>
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
                      ? new Date(order.paidAt).toLocaleDateString('ko-KR')
                      : '-'}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">주문일</dt>
                  <dd className="mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString('ko-KR')}
                  </dd>
                </div>
              </dl>
            </div>

            <Separator />

            {/* 구매 아이템 목록 */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">
                구매 이미지 ({order.orderItems.length}건)
              </h3>
              <div className="space-y-3">
                {order.orderItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border p-3 text-sm"
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-medium">
                          {item.image.name}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {SIZE_LABEL[item.size as ImageSize]} ·{' '}
                          {LICENSE_LABEL[item.licenseType as LicenseType]} ·{' '}
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
                          {new Date(item.expiresAt).toLocaleDateString(
                            'ko-KR'
                          )}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResendEmail(item.id)}
                          disabled={resendEmail.isPending}
                        >
                          {resendEmail.isPending ? (
                            <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Mail className="mr-1 h-3.5 w-3.5" />
                          )}
                          이메일 재발송
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResetDownload(item.id)}
                          disabled={
                            item.downloadCount === 0 ||
                            resetDownloadMutation.isPending
                          }
                        >
                          {resetDownloadMutation.isPending ? (
                            <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <RefreshCw className="mr-1 h-3.5 w-3.5" />
                          )}
                          다운로드 초기화
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 거래 로그 */}
            {order.transactionLogs && order.transactionLogs.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold">
                    거래 로그 ({order.transactionLogs.length}건)
                  </h3>
                  <div className="space-y-2">
                    {order.transactionLogs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-center justify-between rounded border px-3 py-2 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {log.action}
                          </Badge>
                          <Badge
                            variant={
                              log.status === 'SUCCESS'
                                ? 'default'
                                : 'destructive'
                            }
                            className="text-xs"
                          >
                            {log.status}
                          </Badge>
                        </div>
                        <span className="text-muted-foreground">
                          {new Date(log.timestamp).toLocaleString('ko-KR')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
