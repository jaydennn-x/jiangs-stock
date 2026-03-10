import { Metadata } from 'next'
import { Shield } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AdminLoginForm } from '@/components/admin/admin-login-form'

export const metadata: Metadata = {
  title: '관리자 로그인 | JiangsStock',
}

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-700">
            <Shield className="h-7 w-7 text-slate-200" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">JiangsStock</h1>
            <p className="mt-1 text-sm text-slate-400">관리자 포털</p>
          </div>
        </div>

        <Card className="border-slate-700 bg-slate-800">
          <CardHeader className="space-y-1">
            <CardTitle className="text-center text-xl text-white">
              관리자 로그인
            </CardTitle>
            <CardDescription className="text-center text-slate-400">
              관리자 계정으로 로그인하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AdminLoginForm />
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} JiangsStock. All rights reserved.
        </p>
      </div>
    </div>
  )
}
