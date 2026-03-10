'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Heart } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { PriceDisplay } from './price-display'
import { ProtectedImage } from './protected-image'
import type { Image } from '@/types/models'

interface ImageCardProps {
  image: Image
  showWishlist?: boolean
  className?: string
}

export function ImageCard({
  image,
  showWishlist = false,
  className,
}: ImageCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false)

  return (
    <div className={cn('group relative overflow-hidden rounded-lg', className)}>
      <Link href={`/images/${image.id}`}>
        <div className="relative aspect-video overflow-hidden">
          <ProtectedImage
            src={image.thumbnailUrl}
            alt={image.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10" />
        </div>
      </Link>

      {showWishlist && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-white"
          onClick={e => {
            e.preventDefault()
            setIsWishlisted(prev => !prev)
          }}
          aria-label={
            isWishlisted ? '위시리스트에서 제거' : '위시리스트에 추가'
          }
        >
          <Heart
            className={cn(
              'h-4 w-4 transition-colors',
              isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'
            )}
          />
        </Button>
      )}

      <div className="p-2">
        <p className="line-clamp-1 text-sm leading-tight font-medium">
          {image.name}
        </p>
        <PriceDisplay basePrice={image.basePrice} className="mt-1 text-sm" />
      </div>
    </div>
  )
}
