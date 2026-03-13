'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/utils'

interface FeaturedImage {
  id: string
  name: string
  description: string | null
}

interface AuthLayoutProps {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const pathname = usePathname()
  const isLogin = pathname === '/login'
  const [featured, setFeatured] = useState<FeaturedImage | null>(null)

  useEffect(() => {
    fetch('/api/images/featured')
      .then((res) => res.json())
      .then((data) => {
        if (data) setFeatured(data)
      })
      .catch(() => {})
  }, [])

  return (
    <div className="flex h-screen">
      {/* 좌측: 히어로 이미지 - md 이상에서만 표시 */}
      <div className="relative hidden md:block md:w-3/5 xl:w-4/5">
        {featured ? (
          <Image
            src={`/api/images/preview/${featured.id}`}
            alt={featured.name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-neutral-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-black/40" />

        {/* 좌측 상단 로고 */}
        <div className="absolute top-6 left-8 z-10">
          <Link href="/" className="text-2xl font-bold text-white drop-shadow-lg">
            JiangsStock
          </Link>
        </div>

        {/* 좌측 하단 이미지 정보 */}
        <div className="absolute bottom-8 left-8 z-10">
          {featured ? (
            <Link
              href={`/images/${featured.id}`}
              className="group block"
            >
              <p className="text-lg font-semibold text-white drop-shadow-lg transition-colors group-hover:text-white/80 group-hover:underline">
                {featured.name}
              </p>
              {featured.description && (
                <p className="mt-1 text-sm text-white/70 drop-shadow transition-colors group-hover:text-white/60">
                  {featured.description}
                </p>
              )}
            </Link>
          ) : (
            <p className="text-sm text-white/70">
              프리미엄 스톡 이미지 플랫폼
            </p>
          )}
        </div>
      </div>

      {/* 우측: 인증 폼 */}
      <div className="flex w-full flex-col bg-white dark:bg-neutral-950 md:w-2/5 xl:w-1/5 xl:min-w-[360px]">
        {/* 모바일 로고 - md 미만에서만 */}
        <div className="flex justify-center pt-10 pb-4 md:hidden">
          <Link href="/" className="text-2xl font-bold">
            JiangsStock
          </Link>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex justify-center gap-8 border-b border-gray-200 dark:border-neutral-800">
          <Link
            href="/login"
            className={cn(
              'py-4 text-sm font-semibold uppercase tracking-wider transition-colors',
              isLogin
                ? 'border-b-2 border-gray-900 text-gray-900 dark:border-white dark:text-white'
                : 'text-gray-400 hover:text-gray-600 dark:text-neutral-500 dark:hover:text-neutral-300'
            )}
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className={cn(
              'py-4 text-sm font-semibold uppercase tracking-wider transition-colors',
              !isLogin
                ? 'border-b-2 border-gray-900 text-gray-900 dark:border-white dark:text-white'
                : 'text-gray-400 hover:text-gray-600 dark:text-neutral-500 dark:hover:text-neutral-300'
            )}
          >
            Register
          </Link>
        </div>

        {/* 폼 콘텐츠 */}
        <div className="flex flex-1 items-start justify-center overflow-y-auto px-6 py-8">
          <div className="w-full max-w-sm">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
