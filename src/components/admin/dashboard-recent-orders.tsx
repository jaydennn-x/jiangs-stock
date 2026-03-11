import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { dummyOrders, dummyUsers } from '@/lib/dummy'
import type { Order } from '@/types/models'

type OrderStatus = Order['status']

const STATUS_LABEL: Record<OrderStatus, string> = {
  COMPLETED: '완료',
  PENDING: '대기',
  FAILED: '실패',
  CANCELLED: '취소',
}

const STATUS_VARIANT: Record<
  OrderStatus,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  COMPLETED: 'default',
  PENDING: 'secondary',
  FAILED: 'destructive',
  CANCELLED: 'outline',
}

export function DashboardRecentOrders() {
  const recentOrders = [...dummyOrders]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 10)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">최근 주문</CardTitle>
          <Link
            href="/admin/orders"
            className="text-muted-foreground hover:text-foreground text-sm transition-colors"
          >
            주문 관리 →
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-muted-foreground pb-2 text-left font-medium">
                  주문번호
                </th>
                <th className="text-muted-foreground pb-2 text-left font-medium">
                  이메일
                </th>
                <th className="text-muted-foreground pb-2 text-right font-medium">
                  결제금액
                </th>
                <th className="text-muted-foreground pb-2 text-left font-medium">
                  주문일
                </th>
                <th className="text-muted-foreground pb-2 text-left font-medium">
                  상태
                </th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(order => {
                const user = dummyUsers.find(u => u.id === order.userId)
                return (
                  <tr key={order.id} className="border-b last:border-0">
                    <td className="py-2 font-mono text-xs">
                      {order.orderNumber}
                    </td>
                    <td className="text-muted-foreground py-2">
                      {user?.email ?? order.userId}
                    </td>
                    <td className="py-2 text-right font-medium">
                      {order.totalAmount.toLocaleString('ko-KR')}원
                    </td>
                    <td className="text-muted-foreground py-2">
                      {order.createdAt.toLocaleDateString('ko-KR')}
                    </td>
                    <td className="py-2">
                      <Badge variant={STATUS_VARIANT[order.status]}>
                        {STATUS_LABEL[order.status]}
                      </Badge>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
