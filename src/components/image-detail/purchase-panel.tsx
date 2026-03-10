'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, ShoppingCart } from 'lucide-react'

import { cn } from '@/lib/utils'
import { calculatePrice, formatPrice } from '@/lib/price'
import { useCartStore } from '@/stores/cart-store'
import { SizeSelector } from '@/components/common/size-selector'
import { LicenseSelector } from '@/components/common/license-selector'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import type { Image } from '@/types/models'
import type { ImageSize, LicenseType } from '@/types/enums'

interface PurchasePanelProps {
  image: Image
}

export function PurchasePanel({ image }: PurchasePanelProps) {
  const router = useRouter()
  const addItem = useCartStore(s => s.addItem)

  const [selectedSize, setSelectedSize] = useState<ImageSize>('XL')
  const [selectedLicense, setSelectedLicense] =
    useState<LicenseType>('STANDARD')
  const [isWishlisted, setIsWishlisted] = useState(false)

  const price = calculatePrice(image.basePrice, selectedSize, selectedLicense)

  function handleAddToCart() {
    addItem({
      imageId: image.id,
      size: selectedSize,
      licenseType: selectedLicense,
      price,
      imageName: image.name,
      thumbnailUrl: image.thumbnailUrl,
    })
    router.push('/cart')
  }

  function handleBuyNow() {
    router.push('/checkout')
  }

  return (
    <div className="sticky top-6 space-y-5">
      {/* 이미지 이름 + 현재 선택 가격 */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 leading-snug">
          {image.name}
        </h1>
        <p className="mt-3 text-3xl font-bold text-gray-900">
          {formatPrice(price)}
        </p>
      </div>

      <Separator />

      {/* 크기 선택 */}
      <div>
        <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
          크기
        </p>
        <SizeSelector
          value={selectedSize}
          onChange={setSelectedSize}
          basePrice={image.basePrice}
        />
      </div>

      {/* 라이선스 선택 */}
      <div>
        <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
          라이선스
        </p>
        <LicenseSelector
          value={selectedLicense}
          onChange={setSelectedLicense}
          basePrice={image.basePrice}
          selectedSize={selectedSize}
        />
      </div>

      <Separator />

      {/* 액션 버튼 */}
      <div className="space-y-2.5">
        <Button className="w-full" size="lg" onClick={handleAddToCart}>
          <ShoppingCart className="mr-2 h-4 w-4" />
          장바구니 추가
        </Button>
        <Button
          className="w-full"
          size="lg"
          variant="outline"
          onClick={handleBuyNow}
        >
          즉시 결제
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-full"
          onClick={() => setIsWishlisted(prev => !prev)}
        >
          <Heart
            className={cn(
              'mr-2 h-4 w-4 transition-colors',
              isWishlisted ? 'fill-red-400 text-red-400' : 'text-gray-500'
            )}
          />
          {isWishlisted ? '위시리스트에서 제거' : '위시리스트에 추가'}
        </Button>
      </div>
    </div>
  )
}
