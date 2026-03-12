import { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ShoppingBag } from 'lucide-react'

import { auth } from '@/auth'
import { getMyOrders } from '@/lib/actions/mypage'
import { OrderCard } from '@/components/mypage/order-card'
import { EmptyState } from '@/components/common/empty-state'
import { Separator } from '@/components/ui/separator'

export const metadata: Metadata = {
  title: '구매 내역 | JiangsStock',
}

export default async function MyOrdersPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login')
  }

  const result = await getMyOrders()
  const orders = result.success ? result.orders : []

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 마이페이지 탭 네비게이션 */}
      <nav className="mb-6 flex gap-1 border-b">
        <Link
          href="/mypage/orders"
          className="border-foreground border-b-2 px-4 pb-3 text-sm font-semibold"
        >
          구매 내역
        </Link>
        <Link
          href="/mypage/profile"
          className="text-muted-foreground hover:text-foreground px-4 pb-3 text-sm transition-colors"
        >
          내 정보
        </Link>
      </nav>

      <h1 className="mb-6 text-2xl font-bold">
        구매 내역 ({orders.length}건)
      </h1>

      {orders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="구매 내역이 없습니다"
          description="마음에 드는 이미지를 찾아 구매해보세요"
          action={{ label: '이미지 검색하기', href: '/search' }}
        />
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}

      <Separator className="mt-8" />
      <p className="text-muted-foreground mt-4 text-xs">
        결제 관련 문의는 고객센터로 연락해주세요.
      </p>
    </div>
  )
}
