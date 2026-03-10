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
    <div className={cn('columns-2 gap-4 md:columns-3 lg:columns-4', className)}>
      {images.map(image => (
        <div key={image.id} className="mb-4 break-inside-avoid">
          <ImageCard image={image} showWishlist={showWishlist} />
        </div>
      ))}
    </div>
  )
}
