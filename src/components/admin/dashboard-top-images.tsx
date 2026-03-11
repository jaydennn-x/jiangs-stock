import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { dummyImages } from '@/lib/dummy'

export function DashboardTopImages() {
  const topImages = [...dummyImages]
    .sort((a, b) => b.salesCount - a.salesCount)
    .slice(0, 10)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          인기 상품 TOP 10
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="space-y-3">
          {topImages.map((image, index) => (
            <li key={image.id} className="flex items-center gap-3">
              <span className="text-muted-foreground w-5 shrink-0 text-center text-sm font-medium">
                {index + 1}
              </span>
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded">
                <Image
                  src={image.thumbnailUrl}
                  alt={image.name}
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{image.name}</p>
                <p className="text-muted-foreground text-xs">
                  {image.salesCount}건 ·{' '}
                  {image.basePrice.toLocaleString('ko-KR')}원
                </p>
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  )
}
