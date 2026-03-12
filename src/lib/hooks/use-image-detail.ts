import { useQuery } from '@tanstack/react-query'
import type { ImageDetailResponse } from '@/types/api'
import type { Image } from '@/types/models'

const STALE_TIME = 60 * 1000

async function fetchImageDetail(imageId: string): Promise<ImageDetailResponse> {
  const res = await fetch(`/api/images/${imageId}`)
  if (!res.ok) throw new Error('이미지 상세 조회에 실패했습니다.')
  const json = await res.json()
  if (!json.success)
    throw new Error(json.error?.message ?? '이미지 상세 조회에 실패했습니다.')
  return json.data as ImageDetailResponse
}

async function fetchRelatedImages(imageId: string): Promise<Image[]> {
  const res = await fetch(`/api/images/${imageId}/related`)
  if (!res.ok) throw new Error('관련 이미지 조회에 실패했습니다.')
  const json = await res.json()
  if (!json.success)
    throw new Error(json.error?.message ?? '관련 이미지 조회에 실패했습니다.')
  return json.data.images as Image[]
}

export function useImageDetail(imageId: string) {
  return useQuery<ImageDetailResponse, Error>({
    queryKey: ['images', 'detail', imageId],
    queryFn: () => fetchImageDetail(imageId),
    staleTime: STALE_TIME,
    enabled: !!imageId,
  })
}

export function useRelatedImages(imageId: string) {
  return useQuery<Image[], Error>({
    queryKey: ['images', 'related', imageId],
    queryFn: () => fetchRelatedImages(imageId),
    staleTime: STALE_TIME,
    enabled: !!imageId,
  })
}
