'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Trash2 } from 'lucide-react'

import { formatPrice, getSizeLabel } from '@/lib/price'
import { dummyImages } from '@/lib/dummy/images'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import type { LocalCartItem } from '@/types/cart'
import type { ImageSize, LicenseType } from '@/types/enums'

interface CartItemRowProps {
  item: LocalCartItem
  onRemove: (id: string) => void
  onUpdate: (
    id: string,
    size: ImageSize,
    licenseType: LicenseType,
    basePrice: number
  ) => void
}

const SIZE_OPTIONS: { value: ImageSize; label: string }[] = [
  { value: 'XL', label: 'XL(원본)' },
  { value: 'L', label: 'L(대)' },
  { value: 'M', label: 'M(중)' },
  { value: 'S', label: 'S(소)' },
]

const LICENSE_OPTIONS: { value: LicenseType; label: string }[] = [
  { value: 'STANDARD', label: '스탠다드' },
  { value: 'EXTENDED', label: '확장 라이선스' },
]

export function CartItemRow({ item, onRemove, onUpdate }: CartItemRowProps) {
  const [deleteOpen, setDeleteOpen] = useState(false)

  function getBasePrice() {
    return dummyImages.find(i => i.id === item.imageId)?.basePrice ?? item.price
  }

  function handleSizeChange(newSize: ImageSize) {
    onUpdate(item.id, newSize, item.licenseType, getBasePrice())
  }

  function handleLicenseChange(newLicense: LicenseType) {
    onUpdate(item.id, item.size, newLicense, getBasePrice())
  }

  function handleDeleteConfirm() {
    onRemove(item.id)
    setDeleteOpen(false)
  }

  return (
    <>
      <div className="flex items-start gap-4 py-4">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded">
          <Image
            src={item.thumbnailUrl}
            alt={item.imageName}
            fill
            sizes="80px"
            className="object-cover"
          />
        </div>

        <div className="flex-1 space-y-2">
          <p className="text-sm font-medium leading-tight">{item.imageName}</p>
          <div className="flex flex-wrap gap-2">
            <Select
              value={item.size}
              onValueChange={val => handleSizeChange(val as ImageSize)}
            >
              <SelectTrigger className="h-8 w-32 text-xs">
                <SelectValue>{getSizeLabel(item.size)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {SIZE_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={item.licenseType}
              onValueChange={val => handleLicenseChange(val as LicenseType)}
            >
              <SelectTrigger className="h-8 w-40 text-xs">
                <SelectValue>
                  {item.licenseType === 'STANDARD' ? '스탠다드' : '확장 라이선스'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {LICENSE_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <span className="text-sm font-semibold">{formatPrice(item.price)}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="text-muted-foreground h-4 w-4" />
            <span className="sr-only">삭제</span>
          </Button>
        </div>
      </div>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent showCloseButton={false} className="max-w-sm">
          <DialogHeader>
            <DialogTitle>아이템 삭제</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">
            <span className="text-foreground font-medium">{item.imageName}</span>을(를)
            장바구니에서 삭제하시겠습니까?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              취소
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
