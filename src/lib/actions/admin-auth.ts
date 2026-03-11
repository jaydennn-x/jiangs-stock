'use server'

import { headers } from 'next/headers'
import { AuthError } from 'next-auth'
import { isRedirectError } from 'next/dist/client/components/redirect-error'
import { z } from 'zod'
import { signIn, signOut, auth } from '@/auth'
import { isIpAllowed } from '@/lib/ip-whitelist'
import { env } from '@/lib/env'
import type { ActionResult } from './auth'

const adminLoginSchema = z.object({
  email: z.string().email('올바른 이메일 형식을 입력하세요'),
  password: z.string().min(1, '비밀번호를 입력하세요'),
})

type AdminLoginFormData = z.infer<typeof adminLoginSchema>

async function getClientIp(): Promise<string> {
  const headersList = await headers()
  return (
    headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    headersList.get('x-real-ip') ??
    '127.0.0.1'
  )
}

export async function adminLoginAction(
  formData: AdminLoginFormData
): Promise<ActionResult> {
  const parsed = adminLoginSchema.safeParse(formData)
  if (!parsed.success) {
    return { success: false, error: '입력값이 올바르지 않습니다' }
  }

  const ip = await getClientIp()
  if (!isIpAllowed(ip, env.ADMIN_ALLOWED_IPS)) {
    return { success: false, error: '허용되지 않은 IP에서의 접근입니다' }
  }

  const { email, password } = parsed.data

  try {
    await signIn('credentials', { email, password, redirect: false })
  } catch (error) {
    if (isRedirectError(error)) throw error
    if (error instanceof AuthError) {
      return {
        success: false,
        error: '이메일 또는 비밀번호가 올바르지 않습니다',
      }
    }
    return { success: false, error: '로그인 중 오류가 발생했습니다' }
  }

  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    await signOut({ redirect: false })
    return { success: false, error: '관리자 권한이 없습니다' }
  }

  return { success: true }
}
