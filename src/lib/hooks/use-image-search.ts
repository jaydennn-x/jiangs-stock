import { useInfiniteQuery } from '@tanstack/react-query'
import type { InfiniteData } from '@tanstack/react-query'
import type { SearchParams, ImageListResponse } from '@/types/api'

async function fetchImages(
  params: SearchParams,
  cursor?: string
): Promise<ImageListResponse> {
  const searchParams = new URLSearchParams()

  if (params.q) searchParams.set('q', params.q)
  if (params.tag) searchParams.set('tag', params.tag)
  if (params.orientation) searchParams.set('orientation', params.orientation)
  if (params.colorTag) searchParams.set('colorTag', params.colorTag)
  if (params.sort) searchParams.set('sort', params.sort)
  if (params.limit) searchParams.set('limit', String(params.limit))
  if (cursor) searchParams.set('cursor', cursor)

  const res = await fetch(`/api/images/search?${searchParams.toString()}`)

  if (!res.ok) {
    throw new Error('이미지 검색에 실패했습니다.')
  }

  const json = await res.json()

  if (!json.success) {
    throw new Error(json.error?.message ?? '이미지 검색에 실패했습니다.')
  }

  return json.data as ImageListResponse
}

export function useImageSearch(params: SearchParams) {
  return useInfiniteQuery<
    ImageListResponse,
    Error,
    InfiniteData<ImageListResponse>,
    (string | SearchParams)[],
    string | undefined
  >({
    queryKey: ['images', 'search', params],
    queryFn: ({ pageParam }) => fetchImages(params, pageParam),
    getNextPageParam: lastPage =>
      lastPage.pagination.hasNextPage
        ? lastPage.pagination.nextCursor
        : undefined,
    initialPageParam: undefined,
  })
}
