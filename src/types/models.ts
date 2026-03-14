import type {
  ImageSize,
  LicenseType,
  OrderStatus,
  Orientation,
  ProcessingStatus,
  UserRole,
} from './enums'

export interface User {
  id: string
  email: string
  passwordHash: string
  name?: string
  country?: string
  birthYear?: number
  role: UserRole
  agreedTermsAt: Date
  createdAt: Date
  updatedAt: Date
}

export interface SizeMetadata {
  path: string
  width: number
  height: number
}

export interface FileSizes {
  XL: number
  L: number
  M: number
  S: number
}

export interface Image {
  id: string
  code: string
  name: string
  description?: string
  orientation: Orientation
  width: number
  height: number
  format: string
  basePrice: number
  originalUrl: string
  watermarkUrl: string
  thumbnailUrl: string
  sizesJson: Record<ImageSize, SizeMetadata>
  fileSizesJson: FileSizes
  colorTags: string[]
  tags: string[]
  shootDate?: string
  processingStatus: ProcessingStatus
  isActive: boolean
  salesCount: number
  createdAt: Date
  updatedAt: Date
}

export interface Order {
  id: string
  orderNumber: string
  idempotencyKey: string
  userId: string
  totalAmount: number
  status: OrderStatus
  paymentMethod: string
  paymentId?: string
  paidAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface OrderItem {
  id: string
  orderId: string
  imageId: string
  size: ImageSize
  licenseType: LicenseType
  price: number
  downloadToken: string
  downloadCount: number
  downloadLimit: number
  expiresAt: Date
}

