declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test'
    DATABASE_URL: string
    REDIS_URL: string
    NEXTAUTH_SECRET: string
    NEXTAUTH_URL: string
    STORAGE_ROOT: string
    SHARP_CONCURRENCY?: string
    ADMIN_ALLOWED_IPS?: string
    AWS_SES_REGION?: string
    AWS_ACCESS_KEY_ID?: string
    AWS_SECRET_ACCESS_KEY?: string
    AWS_SES_FROM_EMAIL?: string
    NEXT_PUBLIC_APP_URL?: string
    VERCEL_URL?: string
  }
}
