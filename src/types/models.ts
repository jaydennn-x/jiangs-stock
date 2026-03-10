import type {
  ImageSize,
  LicenseType,
  OrderStatus,
  Orientation,
  ProcessingStatus,
  TransactionAction,
  TransactionStatus,
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
  categoryId: string
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

export interface Category {
  id: string
  name: string
  slug: string
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

export interface Wishlist {
  id: string
  userId: string
  imageId: string
  createdAt: Date
}

export interface Cart {
  id: string
  userId: string
  createdAt: Date
  updatedAt: Date
}

export interface CartItem {
  id: string
  cartId: string
  imageId: string
  size: ImageSize
  licenseType: LicenseType
  price: number
}

export interface PaymentTransactionDetails {
  pgTxId: string
  amount: number
  method: string
  approvedAt: string
}

export interface EmailTransactionDetails {
  recipient: string
  subject: string
}

export interface DownloadTransactionDetails {
  ip: string
  userAgent: string
}

export interface TransactionLog {
  id: string
  orderId: string
  timestamp: Date
  action: TransactionAction
  status: TransactionStatus
  details:
    | PaymentTransactionDetails
    | EmailTransactionDetails
    | DownloadTransactionDetails
}

export interface SystemConfig {
  key: string
  value: string
  description?: string
  updatedAt: Date
}
