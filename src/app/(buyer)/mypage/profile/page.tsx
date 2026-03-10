import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '내 정보 | JiangsStock',
}

export default function MyProfilePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">내 정보</h1>
      <p className="text-muted-foreground mt-2">TODO: 내 정보 페이지 구현 예정 (Task 013)</p>
    </div>
  )
}
