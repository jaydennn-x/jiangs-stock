import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '구매 내역 | JiangsStock',
}

export default function MyOrdersPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">구매 내역</h1>
      <p className="text-muted-foreground mt-2">TODO: 구매 내역 페이지 구현 예정 (Task 013)</p>
    </div>
  )
}
