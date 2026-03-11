import { TrendingUp, Calendar, BarChart2, ShoppingBag } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { dummyOrders } from '@/lib/dummy'

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function isSameWeek(date: Date, now: Date) {
  const startOfWeek = new Date(now)
  startOfWeek.setDate(
    now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1)
  )
  startOfWeek.setHours(0, 0, 0, 0)
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  endOfWeek.setHours(23, 59, 59, 999)
  return date >= startOfWeek && date <= endOfWeek
}

function isSameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
}

function calcStats() {
  const now = new Date()
  const completed = dummyOrders.filter(
    o => o.status === 'COMPLETED' && o.paidAt != null
  )

  const todaySales = completed
    .filter(o => isSameDay(o.paidAt!, now))
    .reduce((sum, o) => sum + o.totalAmount, 0)

  const weekSales = completed
    .filter(o => isSameWeek(o.paidAt!, now))
    .reduce((sum, o) => sum + o.totalAmount, 0)

  const monthSales = completed
    .filter(o => isSameMonth(o.paidAt!, now))
    .reduce((sum, o) => sum + o.totalAmount, 0)

  const totalCount = completed.reduce((sum, o) => sum + o.items.length, 0)

  return { todaySales, weekSales, monthSales, totalCount }
}

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

export function DashboardStatsCards() {
  const stats = calcStats()

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
