import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '위시리스트 | JiangsStock',
}

export default function WishlistPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">위시리스트</h1>
      <p className="text-muted-foreground mt-2">TODO: 위시리스트 페이지 구현 예정 (Task 012)</p>
    </div>
  )
}
