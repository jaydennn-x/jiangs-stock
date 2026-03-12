export interface ImageProcessingJobData {
  imageId: string
  originalPath: string
  basePrice: number
}

export interface EmailJobData {
  to: string
  type: 'ORDER_CONFIRMATION' | 'ADMIN_LOGIN_ALERT'
  payload: Record<string, unknown>
}
