import Link from 'next/link'

import { prisma } from '@/lib/prisma'
import { HeroSearch } from '@/components/landing/hero-search'
import { EditorialSlider } from '@/components/landing/editorial-slider'
import type { Image } from '@/types/models'

export const dynamic = 'force-dynamic'

const TRENDING_TAGS = [
  '일몰',
  '자연',
  '비즈니스',
  '여행',
  '음식',
  '건축',
  '인물',
  '기술',
]

const HERO_TABS = ['이미지', '비디오', '에디토리얼']

const HERO_MOSAIC_SEEDS = [10, 20, 30, 40, 50, 60, 70, 80]

const GRID_ROW_HEIGHTS = [280, 380, 300]

function HeroSection() {
  return (
    <div className="relative flex min-h-[88vh] items-center justify-center overflow-hidden bg-black">
      <div className="absolute inset-0 grid grid-cols-4 grid-rows-2 gap-px opacity-60">
        {HERO_MOSAIC_SEEDS.map(seed => (
          <div
            key={seed}
            className="relative overflow-hidden"
            style={{
              backgroundImage: `url(https://picsum.photos/seed/${seed}/600/500)`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        ))}
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/55 to-black/75" />

      <div className="relative z-10 mx-auto w-full max-w-4xl px-4 text-center">
        <h1 className="text-4xl leading-tight font-bold tracking-tight text-white md:text-6xl">
          위대한 작품이 시작되는 곳
        </h1>
        <p className="mt-3 text-base text-white/65 md:text-lg">
          수백만 장의 프리미엄 스톡 이미지
        </p>

        <div className="mt-7 flex items-center justify-center gap-0">
          {HERO_TABS.map((tab, i) => (
            <button
              key={tab}
              type="button"
              className={
                i === 0
                  ? 'border-b-2 border-white px-5 pb-2 text-sm font-semibold text-white'
                  : 'px-5 pb-2 text-sm font-normal text-white/50 transition-colors hover:text-white/80'
              }
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="mt-3">
          <HeroSearch className="mx-auto" />
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1.5">
          <span className="text-xs text-white/45">트렌딩:</span>
          {TRENDING_TAGS.map(tag => (
            <Link
              key={tag}
              href={`/search?q=${encodeURIComponent(tag)}`}
              className="text-xs text-white/70 transition-colors hover:text-white"
            >
              {tag}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

function FullBleedGrid({ images }: { images: Image[] }) {
  return (
    <section className="border-t border-gray-100">
      <div className="flex items-center justify-between px-6 py-6 md:px-10">
        <h2 className="text-lg font-semibold tracking-tight text-gray-900">
          베스트셀러
        </h2>
        <Link
          href="/search?sort=popular"
          className="text-sm text-gray-500 transition-colors hover:text-gray-900"
        >
          전체 보기 →
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-px bg-gray-200 sm:grid-cols-2 lg:grid-cols-3">
        {images.slice(0, 9).map((image, i) => (
          <Link
            key={image.id}
            href={`/images/${image.id}`}
            className="group block"
          >
            <div
              className="relative overflow-hidden"
              style={{
                height:
                  GRID_ROW_HEIGHTS[Math.floor(i / 3) % GRID_ROW_HEIGHTS.length],
              }}
            >
              <div
                className="absolute inset-0 transition-transform duration-500 group-hover:scale-105"
                style={{
                  backgroundImage: `url(${image.thumbnailUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/25" />
              <div className="absolute inset-x-0 bottom-0 translate-y-2 p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                <p className="line-clamp-1 text-sm font-medium text-white drop-shadow">
                  {image.name}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="flex justify-center py-8">
        <Link
          href="/search"
          className="rounded-sm border border-gray-300 px-8 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-gray-800 hover:text-gray-900"
        >
          더 많은 이미지 보기
        </Link>
      </div>
    </section>
  )
}

function NewImagesGrid({ images }: { images: Image[] }) {
  return (
    <section className="border-t border-gray-100">
      <div className="flex items-center justify-between px-6 py-6 md:px-10">
        <h2 className="text-lg font-semibold tracking-tight text-gray-900">
          최신 이미지
        </h2>
        <Link
          href="/search?sort=latest"
          className="text-sm text-gray-500 transition-colors hover:text-gray-900"
        >
          전체 보기 →
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-px bg-gray-200 sm:grid-cols-2 lg:grid-cols-3">
        {images.slice(0, 9).map((image, i) => (
          <Link
            key={image.id}
            href={`/images/${image.id}`}
            className="group block"
          >
            <div
              className="relative overflow-hidden"
              style={{
                height:
                  GRID_ROW_HEIGHTS[Math.floor(i / 3) % GRID_ROW_HEIGHTS.length],
              }}
            >
              <div
                className="absolute inset-0 transition-transform duration-500 group-hover:scale-105"
                style={{
                  backgroundImage: `url(${image.thumbnailUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/25" />
              <div className="absolute inset-x-0 bottom-0 translate-y-2 p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                <p className="line-clamp-1 text-sm font-medium text-white drop-shadow">
                  {image.name}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="flex justify-center py-8">
        <Link
          href="/search"
          className="rounded-sm border border-gray-300 px-8 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-gray-800 hover:text-gray-900"
        >
          더 많은 이미지 보기
        </Link>
      </div>
    </section>
  )
}

async function fetchLandingImages() {
  try {
    const [newRaw, bestRaw] = await Promise.all([
      prisma.image.findMany({
        where: { isActive: true, processingStatus: 'COMPLETED' },
        orderBy: { createdAt: 'desc' },
        take: 9,
      }),
      prisma.image.findMany({
        where: { isActive: true, processingStatus: 'COMPLETED' },
        orderBy: { salesCount: 'desc' },
        take: 9,
      }),
    ])

    const toImage = (img: (typeof newRaw)[number]): Image => ({
      ...img,
      basePrice: Number(img.basePrice),
      description: img.description ?? undefined,
      shootDate: img.shootDate ?? undefined,
      sizesJson: img.sizesJson as unknown as Image['sizesJson'],
      fileSizesJson: img.fileSizesJson as unknown as Image['fileSizesJson'],
    })

    return {
      newImages: newRaw.map(toImage),
      bestImages: bestRaw.map(toImage),
    }
  } catch {
    return { newImages: [], bestImages: [] }
  }
}

export default async function HomePage() {
  const { newImages, bestImages } = await fetchLandingImages()

  return (
    <main className="bg-white">
      <HeroSection />
      <EditorialSlider />
      <NewImagesGrid images={newImages} />
      <FullBleedGrid images={bestImages} />
    </main>
  )
}
