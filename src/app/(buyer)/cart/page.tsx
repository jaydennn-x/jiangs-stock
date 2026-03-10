import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '장바구니 | JiangsStock',
}

export default function CartPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">장바구니</h1>
      <p className="text-muted-foreground mt-2">TODO: 장바구니 페이지 구현 예정 (Task 009)</p>
    </div>
  )
}
