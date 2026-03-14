import { Metadata } from 'next'
import { AdminProductsClient } from '@/components/admin/admin-products-client'

export const metadata: Metadata = {
  title: '상품 관리 | JiangsStock 관리자',
}

export default async function AdminProductsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">상품 관리</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          이미지 상품을 등록하고 관리합니다.
        </p>
      </div>
      <AdminProductsClient />
    </div>
  )
}
