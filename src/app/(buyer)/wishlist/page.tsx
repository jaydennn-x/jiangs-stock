'use client'

import { Heart } from 'lucide-react'

import { useWishlist } from '@/lib/hooks/use-wishlist'
import { WishlistCard } from '@/components/wishlist/wishlist-card'
import { EmptyState } from '@/components/common/empty-state'
import { Skeleton } from '@/components/ui/skeleton'

export default function WishlistPage() {
  const { data: images, isLoading } = useWishlist()

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="mb-8 h-8 w-48" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-[4/3] w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const wishlistImages = images ?? []

  if (wishlistImages.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EmptyState
          icon={Heart}
          title="위시리스트가 비어 있습니다"
          description="마음에 드는 이미지를 찾아 위시리스트에 추가해보세요"
          action={{ label: '이미지 검색하기', href: '/search' }}
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">
        위시리스트 ({wishlistImages.length}건)
      </h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {wishlistImages.map(image => (
          <WishlistCard key={image.id} image={image} />
        ))}
      </div>
    </div>
  )
}
