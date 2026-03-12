import type { ImageSize, LicenseType } from './enums'

export interface LocalCartItem {
  id: string
  serverId?: string
  imageId: string
  size: ImageSize
  licenseType: LicenseType
  price: number
  basePrice?: number
  imageName: string
  thumbnailUrl: string
  addedAt: number
}

export interface LocalCart {
  items: LocalCartItem[]
}

export interface PriceChangedItem {
  imageId: string
  oldPrice: number
  newPrice: number
}

export interface CartMergeResult {
  mergedItems: LocalCartItem[]
  priceChangedItems: PriceChangedItem[]
}
