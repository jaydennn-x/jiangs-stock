import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '대시보드 | JiangsStock 관리자',
}

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">대시보드</h1>
      <p className="text-muted-foreground mt-2">TODO: 대시보드 UI 구현 예정 (Task 015)</p>
    </div>
  )
}
