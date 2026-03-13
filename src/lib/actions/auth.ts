'use server'

import { AuthError } from 'next-auth'
import { isRedirectError } from 'next/dist/client/components/redirect-error'
import bcryptjs from 'bcryptjs'
import { signIn, signOut } from '@/auth'
import { prisma } from '@/lib/prisma'
import { signupSchema, loginSchema } from '@/types/forms'
import type { SignupFormData, LoginFormData } from '@/types/forms'

const BCRYPT_SALT_ROUNDS = 12

export type ActionResult =
  | { success: true }
  | { success: false; error: string; field?: string }

export async function signupAction(
  formData: SignupFormData
): Promise<ActionResult> {
  const parsed = signupSchema.safeParse(formData)
  if (!parsed.success) {
    return { success: false, error: '입력값이 올바르지 않습니다' }
  }

  const { email, password, name, country, birthYear } = parsed.data

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return {
      success: false,
      error: '이미 사용 중인 이메일입니다',
      field: 'email',
    }
  }

  const passwordHash = await bcryptjs.hash(password, BCRYPT_SALT_ROUNDS)
  await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      country,
      birthYear,
      agreedTermsAt: new Date(),
    },
  })

  try {
    await signIn('credentials', { email, password, redirectTo: '/' })
  } catch (error) {
    if (isRedirectError(error)) throw error
    return { success: false, error: '회원가입 후 로그인에 실패했습니다' }
  }

  return { success: true }
}

export async function loginAction(
  formData: LoginFormData
): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(formData)
  if (!parsed.success) {
    return { success: false, error: '입력값이 올바르지 않습니다' }
  }

  const { email, password } = parsed.data

  // 관리자 계정은 일반 로그인 페이지에서 로그인 불가
  const user = await prisma.user.findUnique({
    where: { email },
    select: { role: true },
  })
  if (user?.role === 'ADMIN') {
    return {
      success: false,
      error: '이메일 또는 비밀번호가 올바르지 않습니다',
    }
  }

  try {
    await signIn('credentials', { email, password, redirect: false })
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        success: false,
        error: '이메일 또는 비밀번호가 올바르지 않습니다',
      }
    }
    return { success: false, error: '로그인 중 오류가 발생했습니다' }
  }

  return { success: true }
}

export async function logoutAction(): Promise<void> {
  await signOut({ redirectTo: '/' })
}
