import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcryptjs from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { authConfig } from '@/auth.config'
import type { UserRole } from '@/types/enums'

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

async function authorizeUser(credentials: Record<string, unknown>) {
  const parsed = credentialsSchema.safeParse(credentials)
  if (!parsed.success) return null

  const { email, password } = parsed.data
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return null

  const isValid = await bcryptjs.compare(password, user.passwordHash)
  if (!isValid) return null

  return {
    id: user.id,
    email: user.email,
    name: user.name ?? undefined,
    role: user.role as UserRole,
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      authorize: authorizeUser,
    }),
  ],
})
