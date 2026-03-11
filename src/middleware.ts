import NextAuth from 'next-auth'
import { NextResponse } from 'next/server'
import { authConfig } from '@/auth.config'

const { auth } = NextAuth(authConfig)

const PROTECTED_PATHS = ['/mypage', '/wishlist', '/checkout']
const ADMIN_PATHS = ['/admin']
const AUTH_PATHS = ['/login', '/signup']

export default auth(req => {
  const { pathname } = req.nextUrl
  const session = req.auth

  const isAdminPath =
    ADMIN_PATHS.some(p => pathname.startsWith(p)) && pathname !== '/admin/login'

  if (isAdminPath) {
    if (!session?.user) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
    if (session.user.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', req.url))
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
