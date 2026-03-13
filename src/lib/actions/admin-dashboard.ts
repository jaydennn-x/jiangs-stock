import { prisma } from '@/lib/prisma'

// --- Types ---

export interface DashboardStats {
  todaySales: number
  weekSales: number
  monthSales: number
  totalCount: number
}

export interface RecentOrder {
  id: string
  orderNumber: string
  totalAmount: number
  status: string
  paidAt: string | null
  createdAt: string
  user: {
    email: string
    name: string | null
  }
}

export interface TopImage {
  id: string
  name: string
  thumbnailUrl: string
  salesCount: number
  basePrice: number
  processingStatus: string
}

export interface SalesChartEntry {
  label: string
  amount: number
}

// --- Helper: date boundaries ---

function getTodayStart(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

function getWeekStart(): Date {
  const now = new Date()
  const day = now.getDay()
  const diff = day === 0 ? -6 : 1 - day // Monday as start of week
  const d = new Date(now)
  d.setDate(now.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function getMonthStart(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1)
}

// --- 1. getDashboardStats ---

export async function getDashboardStats(): Promise<DashboardStats> {
  const todayStart = getTodayStart()
  const weekStart = getWeekStart()
  const monthStart = getMonthStart()

  const completedWhere = { status: 'COMPLETED' as const, paidAt: { not: null } }

  const [todayAgg, weekAgg, monthAgg, totalCount] = await Promise.all([
    prisma.order.aggregate({
      where: { ...completedWhere, paidAt: { gte: todayStart } },
      _sum: { totalAmount: true },
    }),
    prisma.order.aggregate({
      where: { ...completedWhere, paidAt: { gte: weekStart } },
      _sum: { totalAmount: true },
    }),
    prisma.order.aggregate({
      where: { ...completedWhere, paidAt: { gte: monthStart } },
      _sum: { totalAmount: true },
    }),
    prisma.orderItem.count({
      where: { order: { status: 'COMPLETED' } },
    }),
  ])

  return {
    todaySales: Number(todayAgg._sum.totalAmount ?? 0),
    weekSales: Number(weekAgg._sum.totalAmount ?? 0),
    monthSales: Number(monthAgg._sum.totalAmount ?? 0),
    totalCount,
  }
}

// --- 2. getRecentOrders ---

export async function getRecentOrders(
  limit = 10
): Promise<RecentOrder[]> {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      user: { select: { email: true, name: true } },
    },
  })

  return orders.map(order => ({
    id: order.id,
    orderNumber: order.orderNumber,
    totalAmount: Number(order.totalAmount),
    status: order.status,
    paidAt: order.paidAt?.toISOString() ?? null,
    createdAt: order.createdAt.toISOString(),
    user: order.user,
  }))
}

// --- 3. getTopImages ---

export async function getTopImages(limit = 10): Promise<TopImage[]> {
  const images = await prisma.image.findMany({
    where: { isActive: true },
    orderBy: { salesCount: 'desc' },
    take: limit,
    select: {
      id: true,
      name: true,
      thumbnailUrl: true,
      salesCount: true,
      basePrice: true,
      processingStatus: true,
    },
  })

  return images.map(img => ({
    ...img,
    basePrice: Number(img.basePrice),
  }))
}

// --- 4. getSalesChartData ---

export async function getSalesChartData(
  mode: 'daily' | 'monthly'
): Promise<SalesChartEntry[]> {
  if (mode === 'daily') {
    return getDailyChartData()
  }
  return getMonthlyChartData()
}

async function getDailyChartData(): Promise<SalesChartEntry[]> {
  const now = new Date()
  const startDate = new Date(now)
  startDate.setDate(now.getDate() - 6)
  startDate.setHours(0, 0, 0, 0)

  const orders = await prisma.order.findMany({
    where: {
      status: 'COMPLETED',
      paidAt: { gte: startDate },
    },
    select: { paidAt: true, totalAmount: true },
  })

  // Build 7-day slots
  const entries: SalesChartEntry[] = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    const label = `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`
    return { label, amount: 0 }
  })

  // Group orders into slots
  for (const order of orders) {
    if (!order.paidAt) continue
    const daysDiff = Math.floor(
      (order.paidAt.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    )
    if (daysDiff >= 0 && daysDiff < 7) {
      entries[daysDiff].amount += Number(order.totalAmount)
    }
  }

  return entries
}

async function getMonthlyChartData(): Promise<SalesChartEntry[]> {
  const now = new Date()
  const startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1)

  const orders = await prisma.order.findMany({
    where: {
      status: 'COMPLETED',
      paidAt: { gte: startDate },
    },
    select: { paidAt: true, totalAmount: true },
  })

  // Build 6-month slots
  const entries: SalesChartEntry[] = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    const label = `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}`
    return { label, amount: 0 }
  })

  // Group orders into slots
  for (const order of orders) {
    if (!order.paidAt) continue
    const monthIndex =
      (order.paidAt.getFullYear() - startDate.getFullYear()) * 12 +
      (order.paidAt.getMonth() - startDate.getMonth())
    if (monthIndex >= 0 && monthIndex < 6) {
      entries[monthIndex].amount += Number(order.totalAmount)
    }
  }

  return entries
}
