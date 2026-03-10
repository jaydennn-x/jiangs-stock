import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '이용약관 | JiangsStock',
}

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">이용약관</h1>
      <p className="text-muted-foreground mt-2">TODO: 이용약관 내용 작성 예정 (Task 018)</p>
    </div>
  )
}
