'use client'

import { useState } from 'react'
import { Search, X } from 'lucide-react'
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
import type { DummyOrder } from '@/lib/dummy'
import type { User, Image } from '@/types/models'
import type { OrderStatus } from '@/types/enums'

interface AdminOrdersClientProps {
  orders: DummyOrder[]
  users: User[]
  images: Image[]
}

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

export function AdminOrdersClient({
  orders,
  users,
  images,
}: AdminOrdersClientProps) {
  const [localOrders, setLocalOrders] = useState<DummyOrder[]>(() => [
    ...orders,
  ])
  const [orderNumberQuery, setOrderNumberQuery] = useState('')
  const [emailQuery, setEmailQuery] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [detailTarget, setDetailTarget] = useState<DummyOrder | null>(null)

  function getUserEmail(userId: string) {
    return users.find(u => u.id === userId)?.email ?? ''
  }

  const filtered = localOrders.filter(order => {
    const email = getUserEmail(order.userId)
    const orderNumMatch = order.orderNumber
      .toLowerCase()
      .includes(orderNumberQuery.toLowerCase())
    const emailMatch = email
      .toLowerCase()
      .includes(emailQuery.toLowerCase())
    const fromMatch =
      !dateFrom || new Date(order.createdAt) >= new Date(dateFrom)
    const toMatch =
      !dateTo ||
      new Date(order.createdAt) <= new Date(dateTo + 'T23:59:59')
    return orderNumMatch && emailMatch && fromMatch && toMatch
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  function handleQueryChange(setter: (v: string) => void, value: string) {
    setter(value)
    setCurrentPage(1)
  }

  function handleReset() {
    setOrderNumberQuery('')
    setEmailQuery('')
    setDateFrom('')
    setDateTo('')
    setCurrentPage(1)
  }

  function handleDetailClick(order: DummyOrder) {
    setDetailTarget(order)
    setDetailModalOpen(true)
  }

  function handleResetDownload(orderId: string, itemId: string) {
    setLocalOrders(prev =>
      prev.map(o =>
        o.id !== orderId
          ? o
          : {
              ...o,
              items: o.items.map(i =>
                i.id !== itemId ? i : { ...i, downloadCount: 0 }
              ),
            }
      )
    )
  }

  const pageNumbers = getPaginationNumbers(currentPage, totalPages)

  const hasFilter =
    orderNumberQuery || emailQuery || dateFrom || dateTo

  return (
    <div className="space-y-4">
      {/* 검색 바 */}
      <Card>
        <CardContent className="flex flex-wrap items-end gap-3 pt-4">
          <div className="min-w-[160px] flex-1 space-y-1">
            <label className="text-muted-foreground text-xs">주문번호</label>
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2" />
              <Input
                value={orderNumberQuery}
                onChange={e =>
                  handleQueryChange(setOrderNumberQuery, e.target.value)
                }
                placeholder="주문번호 검색"
                className="pl-8"
              />
            </div>
          </div>

          <div className="min-w-[160px] flex-1 space-y-1">
            <label className="text-muted-foreground text-xs">이메일</label>
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2" />
              <Input
                value={emailQuery}
                onChange={e =>
                  handleQueryChange(setEmailQuery, e.target.value)
                }
                placeholder="이메일 검색"
                className="pl-8"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-muted-foreground text-xs">시작일</label>
            <input
              type="date"
              value={dateFrom}
              onChange={e =>
                handleQueryChange(setDateFrom, e.target.value)
              }
              className="border-input bg-background text-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs focus-visible:ring-1 focus-visible:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-muted-foreground text-xs">종료일</label>
            <input
              type="date"
              value={dateTo}
              onChange={e =>
                handleQueryChange(setDateTo, e.target.value)
              }
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
      <p className="text-muted-foreground text-sm">
        총 {filtered.length}건
      </p>

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
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-muted-foreground py-12 text-center text-sm"
                  >
                    검색 결과가 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map(order => {
                  const email = getUserEmail(order.userId)
                  const totalDownloaded = order.items.reduce(
                    (sum, item) => sum + item.downloadCount,
                    0
                  )
                  const totalLimit = order.items.reduce(
                    (sum, item) => sum + item.downloadLimit,
                    0
                  )
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-xs">
                        {order.orderNumber}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {email || order.userId}
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium">
                        {order.totalAmount.toLocaleString('ko-KR')}원
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {order.createdAt.toLocaleDateString('ko-KR')}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={ORDER_STATUS_VARIANT[order.status]}
                        >
                          {ORDER_STATUS_LABEL[order.status]}
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
                          onClick={() => handleDetailClick(order)}
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
            onClick={() => setCurrentPage(prev => prev - 1)}
          >
            이전
          </Button>
          {pageNumbers.map((page, idx) =>
            page === null ? (
              <span
                key={`ellipsis-${idx}`}
                className="text-muted-foreground px-1 text-sm"
              >
                …
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
            onClick={() => setCurrentPage(prev => prev + 1)}
          >
            다음
          </Button>
        </div>
      )}

      {/* 주문 상세 모달 */}
      <OrderDetailModal
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        order={detailTarget}
        users={users}
        images={images}
        onResetDownload={handleResetDownload}
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
