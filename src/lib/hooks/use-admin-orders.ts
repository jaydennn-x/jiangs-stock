'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  resendOrderEmail,
  resetDownload,
} from '@/lib/actions/admin-orders'

// --- Query Key Factory ---

export const adminOrderKeys = {
  all: ['admin', 'orders'] as const,
  list: (params: AdminOrderListParams) =>
    [...adminOrderKeys.all, params] as const,
  detail: (id: string | null) =>
    [...adminOrderKeys.all, 'detail', id] as const,
}

// --- Types ---

export interface AdminOrderListParams {
  page?: number
  limit?: number
  search?: string
  startDate?: string
  endDate?: string
  status?: string
}

export interface AdminOrderListResponse {
  orders: AdminOrderSummary[]
  total: number
  page: number
  totalPages: number
}

export interface AdminOrderSummary {
  id: string
  orderNumber: string
  totalAmount: number
  status: string
  paymentMethod: string
  paymentId: string | null
  paidAt: string | null
  createdAt: string
  updatedAt: string
  user: {
    id: string
    email: string
    name: string | null
  }
  orderItems: AdminOrderItemSummary[]
}

export interface AdminOrderItemSummary {
  id: string
  orderId: string
  imageId: string
  size: string
  licenseType: string
  price: number
  downloadToken: string
  downloadCount: number
  downloadLimit: number
  expiresAt: string
  image: {
    id: string
    name: string
    thumbnailUrl: string | null
  }
}

export interface AdminOrderDetailResponse {
  order: AdminOrderSummary & {
    transactionLogs: {
      id: string
      orderId: string
      timestamp: string
      action: string
      status: string
      details: Record<string, unknown>
      ipAddress: string | null
      userAgent: string | null
    }[]
  }
}

// --- Fetch Functions ---

async function fetchAdminOrders(
  params: AdminOrderListParams
): Promise<AdminOrderListResponse> {
  const searchParams = new URLSearchParams()

  if (params.page) searchParams.set('page', String(params.page))
  if (params.limit) searchParams.set('limit', String(params.limit))
  if (params.search) searchParams.set('search', params.search)
  if (params.startDate) searchParams.set('startDate', params.startDate)
  if (params.endDate) searchParams.set('endDate', params.endDate)
  if (params.status) searchParams.set('status', params.status)

  const res = await fetch(`/api/admin/orders?${searchParams.toString()}`)
  if (!res.ok) throw new Error('주문 목록 조회에 실패했습니다.')
  return res.json()
}

async function fetchAdminOrderDetail(
  orderId: string
): Promise<AdminOrderDetailResponse> {
  const res = await fetch(`/api/admin/orders/${orderId}`)
  if (!res.ok) throw new Error('주문 상세 조회에 실패했습니다.')
  return res.json()
}

// --- Query Hooks ---

export function useAdminOrders(params: AdminOrderListParams = {}) {
  return useQuery<AdminOrderListResponse, Error>({
    queryKey: adminOrderKeys.list(params),
    queryFn: () => fetchAdminOrders(params),
  })
}

export function useAdminOrderDetail(orderId: string | null) {
  return useQuery<AdminOrderDetailResponse, Error>({
    queryKey: adminOrderKeys.detail(orderId),
    queryFn: () => fetchAdminOrderDetail(orderId!),
    enabled: !!orderId,
  })
}

// --- Mutation Hooks ---

export function useResendEmail() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      orderId,
      orderItemId,
    }: {
      orderId: string
      orderItemId: string
    }) => resendOrderEmail(orderId, orderItemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminOrderKeys.all })
    },
  })
}

export function useResetDownload() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      orderId,
      orderItemId,
    }: {
      orderId: string
      orderItemId: string
    }) => resetDownload(orderId, orderItemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminOrderKeys.all })
    },
  })
}
