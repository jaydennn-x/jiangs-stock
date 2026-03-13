import NextAuth from 'next-auth'
import { NextResponse } from 'next/server'
import { authConfig } from '@/auth.config'
import { isIpAllowed } from '@/lib/ip-whitelist'

const { auth } = NextAuth(authConfig)

const PROTECTED_PATHS = ['/mypage', '/wishlist', '/checkout']
const ADMIN_PATHS = ['/admin']
const AUTH_PATHS = ['/login', '/signup']

function getClientIp(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    '127.0.0.1'
  )
}

export default auth(req => {
  const { pathname } = req.nextUrl
  const session = req.auth

  const isAdminPath = ADMIN_PATHS.some(p => pathname.startsWith(p))

  // 관리자 경로 전체(로그인 페이지 포함) IP 체크
  if (isAdminPath) {
    const ip = getClientIp(req)
    if (!isIpAllowed(ip, process.env.ADMIN_ALLOWED_IPS)) {
      return NextResponse.redirect(new URL('/', req.url))
    }

    if (pathname !== '/admin/login') {
      if (!session?.user) {
        return NextResponse.redirect(new URL('/admin/login', req.url))
      }
      if (session.user.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/', req.url))
      }
    }
  }

  const isProtectedPath = PROTECTED_PATHS.some(p => pathname.startsWith(p))
  if (isProtectedPath && !session?.user) {
    const url = new URL('/login', req.url)
    url.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(url)
  }

  const isAuthPath = AUTH_PATHS.includes(pathname)
  if (isAuthPath && session?.user) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/mypage/:path*',
    '/wishlist/:path*',
    '/checkout/:path*',
    '/admin/:path*',
    '/login',
    '/signup',
  ],
}
