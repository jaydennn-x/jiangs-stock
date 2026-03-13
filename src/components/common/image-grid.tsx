import { cn } from '@/lib/utils'
import { ImageCard } from './image-card'
import type { Image } from '@/types/models'

interface ImageGridProps {
  images: Image[]
  showWishlist?: boolean
  className?: string
}

export function ImageGrid({
  images,
  showWishlist = false,
  className,
}: ImageGridProps) {
  return (
    <div className={cn('grid grid-cols-2 gap-1 md:grid-cols-3 lg:grid-cols-3', className)}>
      {images.map(image => (
        <div key={image.id}>
          <ImageCard image={image} showWishlist={showWishlist} />
        </div>
      ))}
    </div>
  )
}
