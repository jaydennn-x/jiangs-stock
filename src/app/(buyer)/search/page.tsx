import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '검색 | JiangsStock',
}

export default function SearchPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">검색 결과</h1>
      <p className="text-muted-foreground mt-2">
        TODO: 검색 결과 페이지 구현 예정 (Task 007)
      </p>
    </div>
  )
}
