'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Heart, ShoppingCart } from 'lucide-react'

import { cn } from '@/lib/utils'
import { formatPrice } from '@/lib/price'
import { useToggleWishlist } from '@/lib/hooks/use-wishlist'
import { Button } from '@/components/ui/button'
import { ProtectedImage } from '@/components/common/protected-image'
import { AddToCartModal } from './add-to-cart-modal'
import type { Image } from '@/types/models'

interface WishlistCardProps {
  image: Image
  className?: string
}

export function WishlistCard({ image, className }: WishlistCardProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const { mutate, isPending } = useToggleWishlist()

  return (
    <div className={cn('group relative overflow-hidden rounded-sm', className)}>
      <Link href={`/images/${image.id}`}>
        <div className="relative aspect-[4/3] overflow-hidden">
          <ProtectedImage
            src={`/api/images/thumbnail/${image.id}`}
            alt={image.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      </Link>

      {/* 하트 제거 버튼 - 항상 표시 */}
      <Button
        variant="ghost"
        size="icon"
        disabled={isPending}
        className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60"
        onClick={e => {
          e.preventDefault()
          mutate(image.id)
        }}
        aria-label="위시리스트에서 제거"
      >
        <Heart className="h-4 w-4 fill-red-400 text-red-400" />
      </Button>

      {/* 하단 정보 */}
      <div className="px-1 pt-2 pb-1">
        <p className="line-clamp-1 text-sm font-medium">{image.name}</p>
        <p className="text-muted-foreground mt-0.5 text-xs">
          from {formatPrice(image.basePrice)}
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-2 w-full"
          onClick={() => setModalOpen(true)}
        >
          <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
          장바구니 추가
        </Button>
      </div>

      <AddToCartModal
        image={image}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  )
}
