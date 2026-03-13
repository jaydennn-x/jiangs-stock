'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const SLIDES = [
  {
    seed: 'editorial1',
    title: '에디터 추천 컬렉션',
    subtitle:
      '엄선된 고품질 이미지를 한눈에. 전문 에디터가 직접 고른 작품들을 만나보세요.',
    cta: '컬렉션 둘러보기',
    href: '/search?tag=editorial',
  },
  {
    seed: 'editorial2',
    title: '이번 달의 베스트',
    subtitle: '이번 달 가장 많이 선택된 프리미엄 스톡 이미지 모음.',
    cta: '베스트 보기',
    href: '/search?sort=best',
  },
  {
    seed: 'editorial3',
    title: '자연 & 풍경 특집',
    subtitle:
      '장엄한 자연 풍광부터 도심 속 고요한 순간까지, 모든 장면을 담았습니다.',
    cta: '자연 이미지 탐색',
    href: '/search?category=nature-landscape',
  },
]

export function EditorialSlider() {
  const [current, setCurrent] = useState(0)

  const prev = () => setCurrent(i => (i - 1 + SLIDES.length) % SLIDES.length)
  const next = () => setCurrent(i => (i + 1) % SLIDES.length)

  return (
    <section className="bg-white py-12 dark:bg-black">
      <div className="relative flex items-center">
        {/* 이전 버튼 */}
        <button
          type="button"
          onClick={prev}
          className="absolute left-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white shadow-md transition-shadow hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
          aria-label="이전 슬라이드"
        >
          <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-200" />
        </button>

        {/* 슬라이드 트랙 */}
        <div className="w-full overflow-hidden px-16">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${current * 100}%)` }}
          >
            {SLIDES.map((slide, i) => (
              <div key={slide.seed} className="min-w-full px-2">
                <div className="relative h-[340px] overflow-hidden rounded-xl md:h-[420px]">
                  {/* 배경 이미지 */}
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `url(https://picsum.photos/seed/${slide.seed}/1400/600)`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                  {/* 어두운 오버레이 */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/10" />

                  {/* 텍스트 콘텐츠 */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
                    <h2 className="text-2xl font-bold text-white drop-shadow md:text-4xl">
                      {slide.title}
                    </h2>
                    <p className="mt-3 max-w-xl text-sm text-white/80 md:text-base">
                      {slide.subtitle}
                    </p>
                    <Link
                      href={slide.href}
                      className="mt-6 inline-flex items-center rounded-full bg-white/90 px-6 py-2.5 text-sm font-semibold text-gray-900 shadow transition-colors hover:bg-white"
                    >
                      {slide.cta}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 다음 버튼 */}
        <button
          type="button"
          onClick={next}
          className="absolute right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white shadow-md transition-shadow hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
          aria-label="다음 슬라이드"
        >
          <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-200" />
        </button>
      </div>

      {/* 인디케이터 */}
      <div className="mt-5 flex items-center justify-center gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setCurrent(i)}
            className={cn(
              'h-1.5 rounded-full transition-all duration-300',
              i === current ? 'w-6 bg-gray-800 dark:bg-gray-200' : 'w-1.5 bg-gray-300 dark:bg-gray-600'
            )}
            aria-label={`슬라이드 ${i + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
