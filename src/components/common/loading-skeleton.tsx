import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

interface ImageGridSkeletonProps {
  count?: number
  className?: string
}

export function ImageCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-lg', className)}>
      <Skeleton className="aspect-video w-full rounded-lg" />
      <div className="mt-2 space-y-1 p-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
  )
}

export function ImageGridSkeleton({
  count = 12,
  className,
}: ImageGridSkeletonProps) {
  return (
    <div className={cn('columns-2 gap-4 md:columns-3 lg:columns-4', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="mb-4 break-inside-avoid">
          <ImageCardSkeleton />
        </div>
      ))}
    </div>
  )
}
