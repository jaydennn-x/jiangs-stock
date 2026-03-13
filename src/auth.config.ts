import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { z } from 'zod'
import type { UserRole } from '@/types/enums'

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const authConfig: NextAuthConfig = {
  trustHost: true,
  providers: [
    Credentials({
      authorize: async credentials => {
        const parsed = credentialsSchema.safeParse(credentials)
        if (!parsed.success) return null
        // 실제 DB 검증은 auth.ts의 authorize에서 처리
        // 여기서는 형식만 확인 (Edge 호환용)
        return { email: parsed.data.email } as {
          email: string
          role: UserRole
        }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        if ('role' in user && user.role) token.role = (user as { role: UserRole }).role
        if (user.id) token.sub = user.id
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as UserRole
        if (token.sub) session.user.id = token.sub
      }
      return session
    },
    authorized() {
      // 인증 체크는 middleware.ts에서 직접 처리
      return true
    },
  },
  cookies: {
    sessionToken: {
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      },
    },
  },
  pages: {
    signIn: '/login',
  },
}
