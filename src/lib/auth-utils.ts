import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import type { Session } from 'next-auth'

export async function getRequiredSession(): Promise<Session> {
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }
  return session
}

export async function getAdminSession(): Promise<Session> {
  const session = await auth()
  if (!session?.user) {
    redirect('/admin/login')
  }
  if (session.user.role !== 'ADMIN') {
    redirect('/')
  }
  return session
}
