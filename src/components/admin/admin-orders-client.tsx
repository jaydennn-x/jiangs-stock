'use client'

import { useState } from 'react'
import { Search, X, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { OrderDetailModal } from '@/components/admin/order-detail-modal'
import { useAdminOrders } from '@/lib/hooks/use-admin-orders'
import type { OrderStatus } from '@/types/enums'

const ITEMS_PER_PAGE = 10

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

export function AdminOrdersClient() {
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)

  const { data, isPending, isError } = useAdminOrders({
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    search: search || undefined,
    startDate: dateFrom || undefined,
    endDate: dateTo || undefined,
  })

  const orders = data?.orders ?? []
  const total = data?.total ?? 0
  const totalPages = data?.totalPages ?? 1

  function handleSearchChange(value: string) {
    setSearch(value)
    setCurrentPage(1)
  }

  function handleDateChange(setter: (v: string) => void, value: string) {
    setter(value)
    setCurrentPage(1)
  }

  function handleReset() {
    setSearch('')
    setDateFrom('')
    setDateTo('')
    setCurrentPage(1)
  }

  function handleDetailClick(orderId: string) {
    setSelectedOrderId(orderId)
    setDetailModalOpen(true)
  }

  const pageNumbers = getPaginationNumbers(currentPage, totalPages)
  const hasFilter = search || dateFrom || dateTo

  return (
    <div className="space-y-4">
      {/* 검색 바 */}
      <Card>
        <CardContent className="flex flex-wrap items-end gap-3 pt-4">
          <div className="min-w-[200px] flex-1 space-y-1">
            <label className="text-muted-foreground text-xs">
              주문번호 / 이메일
            </label>
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2" />
              <Input
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="주문번호 또는 이메일 검색"
                className="pl-8"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-muted-foreground text-xs">시작일</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => handleDateChange(setDateFrom, e.target.value)}
              className="border-input bg-background text-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs focus-visible:ring-1 focus-visible:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-muted-foreground text-xs">종료일</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => handleDateChange(setDateTo, e.target.value)}
              className="border-input bg-background text-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs focus-visible:ring-1 focus-visible:outline-none"
            />
          </div>

          {hasFilter && (
            <Button variant="outline" onClick={handleReset}>
              <X className="mr-1.5 h-4 w-4" />
              초기화
            </Button>
          )}
        </CardContent>
      </Card>

      {/* 결과 수 */}
      <p className="text-muted-foreground text-sm">총 {total}건</p>

      {/* 주문 목록 테이블 */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>주문번호</TableHead>
                <TableHead>구매자</TableHead>
                <TableHead className="text-right">결제 금액</TableHead>
                <TableHead>주문일</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>다운로드 현황</TableHead>
                <TableHead className="text-right">상세</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isPending ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-12 text-center"
                  >
                    <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                  </TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-destructive py-12 text-center text-sm"
                  >
                    주문 목록을 불러오는데 실패했습니다.
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-muted-foreground py-12 text-center text-sm"
                  >
                    검색 결과가 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => {
                  const totalDownloaded = order.orderItems.reduce(
                    (sum, item) => sum + item.downloadCount,
                    0
                  )
                  const totalLimit = order.orderItems.reduce(
                    (sum, item) => sum + item.downloadLimit,
                    0
                  )
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-xs">
                        {order.orderNumber}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {order.user.email}
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium">
                        {order.totalAmount.toLocaleString('ko-KR')}원
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(order.createdAt).toLocaleDateString('ko-KR')}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            ORDER_STATUS_VARIANT[
                              order.status as OrderStatus
                            ]
                          }
                        >
                          {ORDER_STATUS_LABEL[order.status as OrderStatus]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        <span
                          className={
                            totalDownloaded >= totalLimit && totalLimit > 0
                              ? 'text-destructive font-medium'
                              : ''
                          }
                        >
                          {totalDownloaded} / {totalLimit}회
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDetailClick(order.id)}
                        >
                          상세보기
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            이전
          </Button>
          {pageNumbers.map((page, idx) =>
            page === null ? (
              <span
                key={`ellipsis-${idx}`}
                className="text-muted-foreground px-1 text-sm"
              >
                ...
              </span>
            ) : (
              <Button
                key={page}
                variant={currentPage === page ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            )
          )}
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            다음
          </Button>
        </div>
      )}

      {/* 주문 상세 모달 */}
      <OrderDetailModal
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        orderId={selectedOrderId}
      />
    </div>
  )
}

function getPaginationNumbers(
  currentPage: number,
  totalPages: number
): (number | null)[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const pages: (number | null)[] = []

  if (currentPage <= 3) {
    pages.push(1, 2, 3, 4, null, totalPages)
  } else if (currentPage >= totalPages - 2) {
    pages.push(
      1,
      null,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages
    )
  } else {
    pages.push(
      1,
      null,
      currentPage - 1,
      currentPage,
      currentPage + 1,
      null,
      totalPages
    )
  }

  return pages
}
