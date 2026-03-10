import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '라이선스 안내 | JiangsStock',
}

export default function LicensePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">라이선스 안내</h1>
      <p className="text-muted-foreground mt-2">TODO: 라이선스 안내 내용 작성 예정 (Task 018)</p>
    </div>
  )
}
