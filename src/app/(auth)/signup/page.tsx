import { Metadata } from 'next'
import { SignupForm } from '@/components/signup-form'
import { AuthLayout } from '@/components/auth/auth-layout'

export const metadata: Metadata = {
  title: '회원가입 | JiangsStock',
  description: '새 계정을 만들고 스톡 이미지를 구매하세요',
}

export default function SignupPage() {
  return (
    <AuthLayout>
      <SignupForm />
    </AuthLayout>
  )
}
