'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Heart, ShoppingCart } from 'lucide-react'

import { cn } from '@/lib/utils'
import { calculatePrice, formatPrice } from '@/lib/price'
import { useCartStore } from '@/stores/cart-store'
import { addToServerCart } from '@/lib/actions/cart'
import {
  useWishlist,
  useToggleWishlist,
  isWishlisted,
} from '@/lib/hooks/use-wishlist'
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
  const { data: session } = useSession()
  const addItem = useCartStore(s => s.addItem)

  const [selectedSize, setSelectedSize] = useState<ImageSize>('XL')
  const [selectedLicense, setSelectedLicense] =
    useState<LicenseType>('STANDARD')

  const { data: wishlistImages } = useWishlist()
  const { mutate: toggleMutate, isPending } = useToggleWishlist()

  const wishlisted = isWishlisted(wishlistImages ?? [], image.id)
  const price = calculatePrice(image.basePrice, selectedSize, selectedLicense)

  async function handleAddToCart() {
    addItem({
      imageId: image.id,
      size: selectedSize,
      licenseType: selectedLicense,
      price,
      basePrice: image.basePrice,
      imageName: image.name,
      thumbnailUrl: image.thumbnailUrl,
    })
    if (session?.user) {
      await addToServerCart(image.id, selectedSize, selectedLicense)
    }
    router.push('/cart')
  }

  function handleBuyNow() {
    router.push('/checkout')
  }

  return (
    <div className="sticky top-6 space-y-5">
      {/* 이미지 이름 + 현재 선택 가격 */}
      <div>
        <h1 className="text-xl leading-snug font-bold text-gray-900">
          {image.name}
        </h1>
        <p className="mt-3 text-3xl font-bold text-gray-900">
          {formatPrice(price)}
        </p>
      </div>

      <Separator />

      {/* 크기 선택 */}
      <div>
        <p className="mb-2.5 text-xs font-semibold tracking-wider text-gray-500 uppercase">
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
        <p className="mb-2.5 text-xs font-semibold tracking-wider text-gray-500 uppercase">
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
          disabled={isPending}
          className="w-full"
          onClick={() => toggleMutate(image.id)}
        >
          <Heart
            className={cn(
              'mr-2 h-4 w-4 transition-colors',
              wishlisted ? 'fill-red-400 text-red-400' : 'text-gray-500'
            )}
          />
          {wishlisted ? '위시리스트에서 제거' : '위시리스트에 추가'}
        </Button>
      </div>
    </div>
  )
}
