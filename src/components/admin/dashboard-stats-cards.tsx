import { TrendingUp, Calendar, BarChart2, ShoppingBag } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getDashboardStats } from '@/lib/actions/admin-dashboard'

const STATS_CONFIG = [
  {
    key: 'todaySales' as const,
    label: '오늘 매출',
    icon: TrendingUp,
    format: (v: number) => `${v.toLocaleString('ko-KR')}원`,
  },
  {
    key: 'weekSales' as const,
    label: '이번 주 매출',
    icon: Calendar,
    format: (v: number) => `${v.toLocaleString('ko-KR')}원`,
  },
  {
    key: 'monthSales' as const,
    label: '이번 달 매출',
    icon: BarChart2,
    format: (v: number) => `${v.toLocaleString('ko-KR')}원`,
  },
  {
    key: 'totalCount' as const,
    label: '총 판매 건수',
    icon: ShoppingBag,
    format: (v: number) => `${v.toLocaleString('ko-KR')}건`,
  },
]

export async function DashboardStatsCards() {
  const stats = await getDashboardStats()

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {STATS_CONFIG.map(({ key, label, icon: Icon, format }) => (
        <Card key={key}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-muted-foreground text-sm font-medium">
                {label}
              </CardTitle>
              <Icon className="text-muted-foreground h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{format(stats[key])}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
