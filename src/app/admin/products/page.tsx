import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '상품 관리 | JiangsStock 관리자',
}

export default function AdminProductsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">상품 관리</h1>
      <p className="text-muted-foreground mt-2">TODO: 상품 관리 UI 구현 예정 (Task 016)</p>
    </div>
  )
}
