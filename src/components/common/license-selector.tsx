'use client'

import { cn } from '@/lib/utils'
import { calculatePrice, formatPrice } from '@/lib/price'
import type { ImageSize, LicenseType } from '@/types/enums'

const LICENSE_OPTIONS: {
  value: LicenseType
  label: string
  description: string
}[] = [
  {
    value: 'STANDARD',
    label: '스탠다드 라이선스',
    description: '웹사이트, 블로그, SNS 등 디지털 용도',
  },
  {
    value: 'EXTENDED',
    label: '확장 라이선스',
    description: '상업적 인쇄물, 광고, 재판매 가능',
  },
]

interface LicenseSelectorProps {
  value: LicenseType
  onChange: (license: LicenseType) => void
  basePrice: number
  selectedSize: ImageSize
  className?: string
}

export function LicenseSelector({
  value,
  onChange,
  basePrice,
  selectedSize,
  className,
}: LicenseSelectorProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {LICENSE_OPTIONS.map(option => {
        const isSelected = value === option.value
        const price = calculatePrice(basePrice, selectedSize, option.value)

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
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
                <div className="font-medium">{option.label}</div>
                <div className="text-muted-foreground text-xs">
                  {option.description}
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
