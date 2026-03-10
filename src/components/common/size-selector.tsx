'use client'

import { cn } from '@/lib/utils'
import {
  calculatePrice,
  formatPrice,
  getSizeLabel,
  getSizeResolution,
} from '@/lib/price'
import type { ImageSize } from '@/types/enums'

const IMAGE_SIZES: ImageSize[] = ['XL', 'L', 'M', 'S']

interface SizeSelectorProps {
  value: ImageSize
  onChange: (size: ImageSize) => void
  basePrice: number
  className?: string
}

export function SizeSelector({
  value,
  onChange,
  basePrice,
  className,
}: SizeSelectorProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {IMAGE_SIZES.map(size => {
        const isSelected = value === size
        const price = calculatePrice(basePrice, size, 'STANDARD')

        return (
          <button
            key={size}
            type="button"
            onClick={() => onChange(size)}
            className={cn(
              'flex items-center justify-between rounded-lg border px-4 py-3 text-sm transition-colors',
              isSelected
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-border hover:border-primary/50 hover:bg-muted/50'
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'flex h-4 w-4 items-center justify-center rounded-full border-2',
                  isSelected ? 'border-primary' : 'border-muted-foreground'
                )}
              >
                {isSelected && (
                  <div className="bg-primary h-2 w-2 rounded-full" />
                )}
              </div>
              <div className="text-left">
                <div className="font-medium">{getSizeLabel(size)}</div>
                <div className="text-muted-foreground text-xs">
                  {getSizeResolution(size)}
                </div>
              </div>
            </div>
            <div className="font-semibold">{formatPrice(price)}</div>
          </button>
        )
      })}
    </div>
  )
}
