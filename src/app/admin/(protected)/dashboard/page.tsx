import { Metadata } from 'next'
import { DashboardStatsCards } from '@/components/admin/dashboard-stats-cards'
import { DashboardSalesChart } from '@/components/admin/dashboard-sales-chart'
import { DashboardRecentOrders } from '@/components/admin/dashboard-recent-orders'
import { DashboardTopImages } from '@/components/admin/dashboard-top-images'
import { DashboardQuickLinks } from '@/components/admin/dashboard-quick-links'

export const metadata: Metadata = {
  title: '대시보드 | JiangsStock 관리자',
}

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">대시보드</h1>

      <DashboardStatsCards />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DashboardSalesChart />
        </div>
        <div>
          <DashboardQuickLinks />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DashboardRecentOrders />
        </div>
        <div>
          <DashboardTopImages />
        </div>
      </div>
    </div>
  )
}
