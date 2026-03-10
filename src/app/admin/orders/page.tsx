import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '주문 관리 | JiangsStock 관리자',
}

export default function AdminOrdersPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">주문 관리</h1>
      <p className="text-muted-foreground mt-2">TODO: 주문 관리 UI 구현 예정 (Task 017)</p>
    </div>
  )
}
