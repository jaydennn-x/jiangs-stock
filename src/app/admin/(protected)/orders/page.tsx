import { Metadata } from 'next'
import { AdminOrdersClient } from '@/components/admin/admin-orders-client'

export const metadata: Metadata = {
  title: '주문 관리 | JiangsStock 관리자',
}

export default function AdminOrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">주문 관리</h1>
      </div>
      <AdminOrdersClient />
    </div>
  )
}
