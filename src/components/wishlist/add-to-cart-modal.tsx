'use client'

import { useState } from 'react'

import { calculatePrice } from '@/lib/price'
import { useCartStore } from '@/stores/cart-store'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { SizeSelector } from '@/components/common/size-selector'
import { LicenseSelector } from '@/components/common/license-selector'
import { ProtectedImage } from '@/components/common/protected-image'
import type { Image } from '@/types/models'
import type { ImageSize, LicenseType } from '@/types/enums'

interface AddToCartModalProps {
  image: Image
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddToCartModal({
  image,
  open,
  onOpenChange,
}: AddToCartModalProps) {
  const [selectedSize, setSelectedSize] = useState<ImageSize>('XL')
  const [selectedLicense, setSelectedLicense] =
    useState<LicenseType>('STANDARD')
  const addItem = useCartStore(s => s.addItem)

  function handleAddToCart() {
    addItem({
      imageId: image.id,
      size: selectedSize,
      licenseType: selectedLicense,
      price: calculatePrice(image.basePrice, selectedSize, selectedLicense),
      imageName: image.name,
      thumbnailUrl: `/api/images/thumbnail/${image.id}`,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="line-clamp-1">{image.name}</DialogTitle>
        </DialogHeader>

        <div className="relative h-32 w-full overflow-hidden rounded">
          <ProtectedImage
            src={`/api/images/thumbnail/${image.id}`}
            alt={image.name}
            fill
            sizes="(max-width: 768px) 100vw, 448px"
            className="object-cover"
          />
        </div>

        <div className="space-y-3">
          <SizeSelector
            value={selectedSize}
            onChange={setSelectedSize}
            basePrice={image.basePrice}
          />
          <LicenseSelector
            value={selectedLicense}
            onChange={setSelectedLicense}
            basePrice={image.basePrice}
            selectedSize={selectedSize}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={handleAddToCart}>장바구니 추가</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
