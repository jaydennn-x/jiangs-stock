import { Metadata } from 'next'
import { SignupForm } from '@/components/signup-form'

export const metadata: Metadata = {
  title: '회원가입 | JiangsStock',
  description: '새 계정을 만들고 스톡 이미지를 구매하세요',
}

export default function SignupPage() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center p-4">
      <div className="w-full max-w-md">
        <SignupForm />
      </div>
    </div>
  )
}
