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
import { Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useSalesChart } from '@/lib/hooks/use-admin-dashboard'

type ChartMode = 'daily' | 'monthly'

export function DashboardSalesChart() {
  const [mode, setMode] = useState<ChartMode>('daily')
  const { data, isLoading, isError } = useSalesChart(mode)

  const chartData = data?.data ?? []

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
        {isLoading ? (
          <div className="flex h-[300px] items-center justify-center">
            <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
          </div>
        ) : isError ? (
          <div className="flex h-[300px] items-center justify-center">
            <p className="text-destructive text-sm">
              매출 데이터를 불러오는 데 실패했습니다.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={chartData}
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
                tickFormatter={v =>
                  v === 0 ? '0' : `${(v / 1000).toFixed(0)}k`
                }
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
        )}
      </CardContent>
    </Card>
  )
}
