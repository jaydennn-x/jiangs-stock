'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Heart } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/price'
import { ProtectedImage } from './protected-image'
import type { Image } from '@/types/models'

const ASPECT_MAP: Record<string, string> = {
  LANDSCAPE: 'aspect-[4/3]',
  PORTRAIT: 'aspect-[3/4]',
  SQUARE: 'aspect-square',
}

interface ImageCardProps {
  image: Image
  showWishlist?: boolean
  className?: string
}

function resolveImageSrc(thumbnailUrl: string, imageId: string): string {
  try {
    new URL(thumbnailUrl)
    return thumbnailUrl
  } catch {
    return `/api/images/thumbnail/${imageId}`
  }
}

export function ImageCard({
  image,
  showWishlist = false,
  className,
}: ImageCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false)
  const aspectClass = ASPECT_MAP[image.orientation] ?? 'aspect-[4/3]'
  const src = resolveImageSrc(image.thumbnailUrl, image.id)

  return (
    <div className={cn('group relative overflow-hidden rounded-sm', className)}>
      <Link href={`/images/${image.id}`}>
        <div className={cn('relative overflow-hidden', aspectClass)}>
          <ProtectedImage
            src={src}
            alt={image.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* 호버 오버레이 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {/* 하단 텍스트 오버레이 */}
          <div className="absolute inset-x-0 bottom-0 translate-y-2 p-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <p className="line-clamp-1 text-sm font-medium text-white drop-shadow">
              {image.name}
            </p>
            <p className="mt-0.5 text-xs text-white/80">
              from {formatPrice(image.basePrice)}
            </p>
          </div>
        </div>
      </Link>

      {showWishlist && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/40 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-black/60"
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
              isWishlisted ? 'fill-red-400 text-red-400' : 'text-white'
            )}
          />
        </Button>
      )}
    </div>
  )
}
