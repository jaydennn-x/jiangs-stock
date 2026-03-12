import { Metadata } from 'next'
import { dummyImages, dummyCategories } from '@/lib/dummy'
import { AdminProductsClient } from '@/components/admin/admin-products-client'

export const metadata: Metadata = {
  title: '상품 관리 | JiangsStock 관리자',
}

export default function AdminProductsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">상품 관리</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          총 {dummyImages.length}개 상품
        </p>
      </div>
      <AdminProductsClient images={dummyImages} categories={dummyCategories} />
    </div>
  )
}
