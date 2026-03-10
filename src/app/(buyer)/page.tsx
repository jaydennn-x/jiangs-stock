import Link from 'next/link'

import { Container } from '@/components/layout/container'
import { ImageGrid } from '@/components/common/image-grid'
import { HeroSearch } from '@/components/landing/hero-search'
import { Button } from '@/components/ui/button'
import { dummyImages } from '@/lib/dummy/images'
import { dummyCategories } from '@/lib/dummy/categories'
import type { Category } from '@/types/models'
import type { Image } from '@/types/models'

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

const HERO_MOSAIC_SEEDS = [
  { seed: 10, col: 1, row: 1 },
  { seed: 20, col: 1, row: 1 },
  { seed: 30, col: 1, row: 2 },
  { seed: 40, col: 1, row: 1 },
  { seed: 50, col: 1, row: 1 },
  { seed: 60, col: 1, row: 2 },
  { seed: 70, col: 1, row: 1 },
  { seed: 80, col: 1, row: 1 },
]

const CATEGORY_SEEDS = [10, 20, 30, 40, 50, 60]

function HeroSection() {
  return (
    <div className="relative flex min-h-[88vh] items-center justify-center overflow-hidden bg-black">
      {/* 배경: 이미지 모자이크 그리드 */}
      <div className="absolute inset-0 grid grid-cols-4 grid-rows-2 gap-px opacity-60">
        {HERO_MOSAIC_SEEDS.map(({ seed }) => (
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

      {/* 어두운 오버레이 */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/55 to-black/75" />

      {/* 콘텐츠 */}
      <div className="relative z-10 mx-auto w-full max-w-4xl px-4 text-center">
        <h1 className="text-4xl leading-tight font-bold tracking-tight text-white md:text-6xl">
          위대한 작품이 시작되는 곳
        </h1>
        <p className="mt-3 text-base text-white/65 md:text-lg">
          수백만 장의 프리미엄 스톡 이미지
        </p>

        {/* 탭 */}
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

        {/* 검색바 */}
        <div className="mt-3">
          <HeroSearch className="mx-auto" />
        </div>

        {/* 트렌딩 태그 */}
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

function CategorySection({ categories }: { categories: Category[] }) {
  return (
    <section className="border-b border-gray-100 py-14">
      <Container>
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="text-xl font-semibold tracking-tight text-gray-900">
            카테고리 탐색
          </h2>
          <Link
            href="/search"
            className="text-sm text-gray-500 transition-colors hover:text-gray-900"
          >
            전체 보기 →
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-2 md:grid-cols-6">
          {categories.map((cat, i) => (
            <Link key={cat.id} href={`/search?category=${cat.slug}`}>
              <div className="group relative aspect-square overflow-hidden rounded-sm">
                <div
                  className="absolute inset-0 transition-transform duration-500 group-hover:scale-110"
                  style={{
                    backgroundImage: `url(https://picsum.photos/seed/${CATEGORY_SEEDS[i]}/400/400)`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
                <div className="absolute inset-0 bg-black/35 transition-colors duration-300 group-hover:bg-black/20" />
                <div className="absolute inset-0 flex items-end p-2.5">
                  <p className="text-xs font-semibold text-white drop-shadow">
                    {cat.name}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  )
}

function GallerySection({
  title,
  images,
  showWishlist = false,
}: {
  title: string
  images: Image[]
  showWishlist?: boolean
}) {
  return (
    <section className="border-b border-gray-100 py-14">
      <Container>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight text-gray-900">
            {title}
          </h2>
          <Link href="/search">
            <Button
              variant="outline"
              size="sm"
              className="rounded-sm text-xs"
            >
              더 보기
            </Button>
          </Link>
        </div>
        <ImageGrid images={images} showWishlist={showWishlist} />
      </Container>
    </section>
  )
}

function BannerSection() {
  return (
    <section className="py-14">
      <Container>
        <div className="relative overflow-hidden rounded-sm bg-gray-950 px-8 py-12 md:px-16">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'url(https://picsum.photos/seed/banner/1200/400)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <div className="relative z-10 max-w-lg">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              크리에이터를 위한
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white md:text-3xl">
              당신의 작품을 세계에 선보이세요
            </h2>
            <p className="mt-3 text-sm text-gray-400">
              전 세계 크리에이터들이 Jiangs에서 수익을 창출하고 있습니다.
            </p>
            <Link href="/seller">
              <Button
                size="sm"
                className="mt-6 rounded-sm bg-white text-gray-900 hover:bg-gray-100"
              >
                판매 시작하기
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  )
}

export default function HomePage() {
  const newImages = [...dummyImages]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 12)

  const bestImages = [...dummyImages]
    .sort((a, b) => b.salesCount - a.salesCount)
    .slice(0, 12)

  return (
    <main className="bg-white">
      <HeroSection />
      <CategorySection categories={dummyCategories} />
      <GallerySection title="최신 이미지" images={newImages} showWishlist />
      <GallerySection title="베스트셀러" images={bestImages} />
      <BannerSection />
    </main>
  )
}
