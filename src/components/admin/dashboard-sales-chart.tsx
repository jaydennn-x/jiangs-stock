'use client'

import { useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { dummyOrders } from '@/lib/dummy'

type ChartMode = 'daily' | 'monthly'

interface ChartEntry {
  label: string
  amount: number
}

function getLast7DaysData(): ChartEntry[] {
  const now = new Date()
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now)
    date.setDate(now.getDate() - (6 - i))
    date.setHours(0, 0, 0, 0)

    const next = new Date(date)
    next.setDate(date.getDate() + 1)

    const amount = dummyOrders
      .filter(
        o =>
          o.status === 'COMPLETED' &&
          o.paidAt != null &&
          o.paidAt >= date &&
          o.paidAt < next
      )
      .reduce((sum, o) => sum + o.totalAmount, 0)

    const label = `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`
    return { label, amount }
  })
}

function getLast6MonthsData(): ChartEntry[] {
  const now = new Date()
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    const nextMonth = new Date(d.getFullYear(), d.getMonth() + 1, 1)

    const amount = dummyOrders
      .filter(
        o =>
          o.status === 'COMPLETED' &&
          o.paidAt != null &&
          o.paidAt >= d &&
          o.paidAt < nextMonth
      )
      .reduce((sum, o) => sum + o.totalAmount, 0)

    const label = `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}`
    return { label, amount }
  })
}

export function DashboardSalesChart() {
  const [mode, setMode] = useState<ChartMode>('daily')

  const data = mode === 'daily' ? getLast7DaysData() : getLast6MonthsData()

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">매출 추이</CardTitle>
          <div className="flex gap-1">
            <Button
              variant={mode === 'daily' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('daily')}
            >
              일별
            </Button>
            <Button
              variant={mode === 'monthly' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('monthly')}
            >
              월별
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{ top: 4, right: 8, left: 8, bottom: 4 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={v => (v === 0 ? '0' : `${(v / 1000).toFixed(0)}k`)}
            />
            <Tooltip
              formatter={value => [
                `${Number(value).toLocaleString('ko-KR')}원`,
                '매출',
              ]}
            />
            <Bar
              dataKey="amount"
              radius={[4, 4, 0, 0]}
              className="fill-primary"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
