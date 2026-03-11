import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { z } from 'zod'
import type { UserRole } from '@/types/enums'

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const authConfig: NextAuthConfig = {
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
      if (user && 'role' in user) {
        token.role = (user as { role: UserRole }).role
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as UserRole
      }
      return session
    },
    authorized({ auth: session }) {
      return !!session
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
