import { Metadata } from 'next'
import { LoginForm } from '@/components/login-form'
import { AuthLayout } from '@/components/auth/auth-layout'

export const metadata: Metadata = {
  title: '로그인 | JiangsStock',
  description: '계정에 로그인하여 서비스를 이용하세요',
}

export default function LoginPage() {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  )
}
