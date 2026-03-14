'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  updateProduct,
  updateProductField,
  deleteProduct,
  toggleProductActive,
  bulkDeleteProducts,
  bulkUpdateProductsActive,
} from '@/lib/actions/admin-products'
import type {
  AdminProductListResponse,
  AdminProductStatusResponse,
} from '@/lib/validations/admin-product'

// --- Query Key Factory ---

export const adminProductKeys = {
  all: ['admin', 'products'] as const,
  list: (params: AdminProductListParams) =>
    [...adminProductKeys.all, params] as const,
  status: (ids: string[]) =>
    [...adminProductKeys.all, 'status', ids] as const,
}

// --- Types ---

export interface AdminProductListParams {
  page?: number
  limit?: number
  isActive?: boolean | undefined
  search?: string
  sort?: string
}

// --- Fetch Functions ---

async function fetchAdminProducts(
  params: AdminProductListParams
): Promise<AdminProductListResponse> {
  const searchParams = new URLSearchParams()

  if (params.page) searchParams.set('page', String(params.page))
  if (params.limit) searchParams.set('limit', String(params.limit))
  if (params.isActive !== undefined)
    searchParams.set('isActive', String(params.isActive))
  if (params.search) searchParams.set('search', params.search)
  if (params.sort) searchParams.set('sort', params.sort)

  const res = await fetch(`/api/admin/products?${searchParams.toString()}`)
  if (!res.ok) throw new Error('상품 목록 조회에 실패했습니다.')
  return res.json()
}

async function fetchProductStatuses(
  ids: string[]
): Promise<AdminProductStatusResponse> {
  const res = await fetch(
    `/api/admin/products/status?ids=${ids.join(',')}`
  )
  if (!res.ok) throw new Error('처리 상태 조회에 실패했습니다.')
  return res.json()
}

// --- Query Hooks ---

export function useAdminProducts(params: AdminProductListParams = {}) {
  return useQuery<AdminProductListResponse, Error>({
    queryKey: adminProductKeys.list(params),
    queryFn: () => fetchAdminProducts(params),
    refetchInterval: (query) => {
      const data = query.state.data
      if (!data) return false
      const hasPending = data.images.some(
        (img) =>
          img.processingStatus === 'PENDING' ||
          img.processingStatus === 'PROCESSING'
      )
      return hasPending ? 3000 : false
    },
  })
}

export function useProductStatusPolling(imageIds: string[]) {
  return useQuery<AdminProductStatusResponse, Error>({
    queryKey: adminProductKeys.status(imageIds),
    queryFn: () => fetchProductStatuses(imageIds),
    enabled: imageIds.length > 0,
    refetchInterval: 3000,
  })
}

// --- Mutation Hooks ---

export interface CreateProductResult {
  success?: boolean
  imageId?: string
  error?: string
  field?: string
}

export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (formData: FormData): Promise<CreateProductResult> => {
      const res = await fetch('/api/admin/products/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) {
        return { error: data.error, field: data.field }
      }
      return { success: true, imageId: data.imageId }
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: adminProductKeys.all })
      }
    },
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (formData: FormData) => updateProduct(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminProductKeys.all })
    },
  })
}

export function useUpdateProductField() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      imageId,
      field,
      value,
    }: {
      imageId: string
      field: string
      value: unknown
    }) => updateProductField(imageId, field as never, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminProductKeys.all })
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (imageId: string) => deleteProduct(imageId),
    onMutate: async (imageId) => {
      await queryClient.cancelQueries({ queryKey: adminProductKeys.all })
      const queries = queryClient.getQueriesData<AdminProductListResponse>({
        queryKey: adminProductKeys.all,
      })
      for (const [key, data] of queries) {
        if (!data) continue
        queryClient.setQueryData<AdminProductListResponse>(key, {
          ...data,
          images: data.images.filter(img => img.id !== imageId),
          total: data.total - 1,
        })
      }
      return { queries }
    },
    onError: (_err, _vars, context) => {
      if (context?.queries) {
        for (const [key, data] of context.queries) {
          queryClient.setQueryData(key, data)
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: adminProductKeys.all })
    },
  })
}

export function useToggleProductActive() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (imageId: string) => toggleProductActive(imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminProductKeys.all })
    },
  })
}

export function useBulkDeleteProducts() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (imageIds: string[]) => bulkDeleteProducts(imageIds),
    onMutate: async (imageIds) => {
      await queryClient.cancelQueries({ queryKey: adminProductKeys.all })
      const idSet = new Set(imageIds)
      const queries = queryClient.getQueriesData<AdminProductListResponse>({
        queryKey: adminProductKeys.all,
      })
      for (const [key, data] of queries) {
        if (!data) continue
        const remaining = data.images.filter(img => !idSet.has(img.id))
        queryClient.setQueryData<AdminProductListResponse>(key, {
          ...data,
          images: remaining,
          total: data.total - (data.images.length - remaining.length),
        })
      }
      return { queries }
    },
    onError: (_err, _vars, context) => {
      if (context?.queries) {
        for (const [key, data] of context.queries) {
          queryClient.setQueryData(key, data)
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: adminProductKeys.all })
    },
  })
}

export function useBulkUpdateProductsActive() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ imageIds, isActive }: { imageIds: string[]; isActive: boolean }) =>
      bulkUpdateProductsActive(imageIds, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminProductKeys.all })
    },
  })
}

