import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),
  STORAGE_ROOT: z.string().min(1),
  SHARP_CONCURRENCY: z.coerce.number().min(1).max(16).default(2),
  ADMIN_ALLOWED_IPS: z.string().optional(),
  AWS_SES_REGION: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_SES_FROM_EMAIL: z.string().email().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  VERCEL_URL: z.string().optional(),
})

export type Env = z.infer<typeof envSchema>

const skipValidation =
  process.env.SKIP_ENV_VALIDATION === 'true' || process.env.NODE_ENV === 'test'

export const env: Env = skipValidation
  ? (process.env as unknown as Env)
  : envSchema.parse({
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL,
      REDIS_URL: process.env.REDIS_URL,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      STORAGE_ROOT: process.env.STORAGE_ROOT,
      SHARP_CONCURRENCY: process.env.SHARP_CONCURRENCY,
      ADMIN_ALLOWED_IPS: process.env.ADMIN_ALLOWED_IPS,
      AWS_SES_REGION: process.env.AWS_SES_REGION,
      AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
      AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
      AWS_SES_FROM_EMAIL: process.env.AWS_SES_FROM_EMAIL,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      VERCEL_URL: process.env.VERCEL_URL,
    })
