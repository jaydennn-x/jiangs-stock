'use client'

import { useQuery } from '@tanstack/react-query'

// --- Query Key Factory ---

export const adminDashboardKeys = {
  all: ['admin', 'dashboard'] as const,
  salesChart: (mode: 'daily' | 'monthly') =>
    [...adminDashboardKeys.all, 'sales-chart', mode] as const,
}

// --- Types ---

export interface SalesChartEntry {
  label: string
  amount: number
}

interface SalesChartResponse {
  data: SalesChartEntry[]
}

// --- Fetch Functions ---

async function fetchSalesChart(
  mode: 'daily' | 'monthly'
): Promise<SalesChartResponse> {
  const res = await fetch(
    `/api/admin/dashboard/sales-chart?mode=${mode}`
  )
  if (!res.ok) throw new Error('매출 추이 데이터 조회에 실패했습니다.')
  return res.json()
}

// --- Query Hooks ---

export function useSalesChart(mode: 'daily' | 'monthly') {
  return useQuery<SalesChartResponse, Error>({
    queryKey: adminDashboardKeys.salesChart(mode),
    queryFn: () => fetchSalesChart(mode),
    staleTime: 30_000,
  })
}
