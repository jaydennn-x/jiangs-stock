import Image from 'next/image'
import { Download } from 'lucide-react'

import { formatPrice, getSizeLabel } from '@/lib/price'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { OrderItem } from '@/types/models'
import type { Image as ImageType } from '@/types/models'

interface CompleteOrderItemProps {
  orderItem: OrderItem
  image: ImageType | undefined
  onDownload: (token: string) => void
}

export function CompleteOrderItem({
  orderItem,
  image,
  onDownload,
}: CompleteOrderItemProps) {
  const isExpired = new Date() > orderItem.expiresAt
  const isLimitReached = orderItem.downloadCount >= orderItem.downloadLimit
  const canDownload = !isExpired && !isLimitReached

  return (
    <div className="flex items-center gap-3 py-3">
      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border">
        {image ? (
          <Image
            src={image.thumbnailUrl}
            alt={image.name}
            fill
            className="object-cover"
            sizes="80px"
          />
        ) : (
          <div className="bg-muted h-full w-full" />
        )}
      </div>

      <div className="min-w-0 flex-1 space-y-1">
        <p className="truncate text-sm font-medium">
          {image?.name ?? '이미지 정보 없음'}
        </p>
        <p className="text-muted-foreground text-xs">
          {getSizeLabel(orderItem.size)} ·{' '}
          {orderItem.licenseType === 'STANDARD' ? '스탠다드' : '확장'} 라이선스
        </p>
        <p className="text-sm font-semibold">{formatPrice(orderItem.price)}</p>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-xs">
            다운로드 {orderItem.downloadCount}/{orderItem.downloadLimit}회
          </span>
          {isExpired && (
            <Badge variant="destructive" className="text-xs">
              만료됨
            </Badge>
          )}
          {isLimitReached && !isExpired && (
            <Badge variant="secondary" className="text-xs">
              한도 소진
            </Badge>
          )}
        </div>
      </div>

      <Button
        size="sm"
        variant={canDownload ? 'default' : 'secondary'}
        disabled={!canDownload}
        onClick={() => onDownload(orderItem.downloadToken)}
        className="flex-shrink-0"
      >
        <Download className="mr-1 h-3 w-3" />
        다운로드
      </Button>
    </div>
  )
}
