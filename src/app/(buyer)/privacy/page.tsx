import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '개인정보처리방침 | JiangsStock',
}

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">개인정보처리방침</h1>
      <p className="text-muted-foreground mt-2">
        TODO: 개인정보처리방침 내용 작성 예정 (Task 018)
      </p>
    </div>
  )
}
