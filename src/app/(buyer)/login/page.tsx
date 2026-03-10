import { Metadata } from 'next'
import { LoginForm } from '@/components/login-form'

export const metadata: Metadata = {
  title: '로그인 | JiangsStock',
  description: '계정에 로그인하여 서비스를 이용하세요',
}

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <LoginForm />
      </div>
    </div>
  )
}
