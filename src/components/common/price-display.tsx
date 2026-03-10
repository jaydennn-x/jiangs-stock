import { cn } from '@/lib/utils'
import { calculatePrice, formatPrice } from '@/lib/price'
import type { ImageSize, LicenseType } from '@/types/enums'

interface PriceDisplayProps {
  basePrice: number
  size?: ImageSize
  licenseType?: LicenseType
  className?: string
}

export function PriceDisplay({
  basePrice,
  size,
  licenseType,
  className,
}: PriceDisplayProps) {
  const price =
    size && licenseType
      ? calculatePrice(basePrice, size, licenseType)
      : basePrice

  const isCalculated = size && licenseType

  return (
    <div className={cn('flex items-baseline gap-1', className)}>
      {!isCalculated && (
        <span className="text-muted-foreground text-xs">from</span>
      )}
      <span className="font-semibold">{formatPrice(price)}</span>
    </div>
  )
}
