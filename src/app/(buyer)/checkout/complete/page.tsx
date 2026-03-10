import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '결제 완료 | JiangsStock',
}

export default function CheckoutCompletePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">결제 완료</h1>
      <p className="text-muted-foreground mt-2">TODO: 결제 완료 페이지 구현 예정 (Task 011)</p>
    </div>
  )
}
