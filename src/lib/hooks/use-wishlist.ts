import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toggleWishlist } from '@/lib/actions/wishlist'
import type { Image } from '@/types/models'

const STALE_TIME = 60 * 1000

async function fetchWishlist(): Promise<Image[]> {
  const res = await fetch('/api/wishlist')
  if (!res.ok) throw new Error('위시리스트 조회에 실패했습니다.')
  const json = await res.json()
  if (!json.success) throw new Error('위시리스트 조회에 실패했습니다.')
  return json.data.images as Image[]
}

export function useWishlist() {
  return useQuery<Image[], Error>({
    queryKey: ['wishlist'],
    queryFn: fetchWishlist,
    staleTime: STALE_TIME,
  })
}

export function useToggleWishlist() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (imageId: string) => toggleWishlist(imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] })
    },
  })
}

export function isWishlisted(images: Image[], imageId: string): boolean {
  return images.some(img => img.id === imageId)
}
