import { ImageIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getTopImages } from '@/lib/actions/admin-dashboard'

export async function DashboardTopImages() {
  const topImages = await getTopImages(10)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          인기 상품 TOP 10
        </CardTitle>
      </CardHeader>
      <CardContent>
        {topImages.length === 0 ? (
          <p className="text-muted-foreground py-4 text-center text-sm">
            판매 데이터가 없습니다.
          </p>
        ) : (
          <ol className="space-y-3">
            {topImages.map((image, index) => {
              const hasThumbnail =
                image.processingStatus === 'COMPLETED' && !!image.thumbnailUrl
              return (
                <li key={image.id} className="flex items-center gap-3">
                  <span className="text-muted-foreground w-5 shrink-0 text-center text-sm font-medium">
                    {index + 1}
                  </span>
                  <div className="bg-muted relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded">
                    {hasThumbnail ? (
                      <img
                        src={`/api/images/thumbnail/${image.id}`}
                        alt={image.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="text-muted-foreground h-5 w-5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {image.name}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {image.salesCount}건 ·{' '}
                      {image.basePrice.toLocaleString('ko-KR')}원
                    </p>
                  </div>
                </li>
              )
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  )
}
