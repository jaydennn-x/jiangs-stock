import type { Metadata } from 'next'
import { SearchX } from 'lucide-react'

import { dummyImages } from '@/lib/dummy/images'
import { dummyCategories } from '@/lib/dummy/categories'
import { ImageGrid } from '@/components/common/image-grid'
import { EmptyState } from '@/components/common/empty-state'
import { SearchFilters } from '@/components/search/search-filters'
import { SearchHeader } from '@/components/search/search-header'

type SearchParams = Promise<{
  q?: string
  category?: string | string[]
  orientation?: string
  sort?: string
  minPrice?: string
  maxPrice?: string
}>

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams
}): Promise<Metadata> {
  const params = await searchParams
  const q = params.q ?? ''
  return {
    title: q ? `"${q}" 검색 결과 | JiangsStock` : '이미지 검색 | JiangsStock',
  }
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const params = await searchParams

  const q = params.q ?? ''
  const categories = Array.isArray(params.category)
    ? params.category
    : params.category
      ? [params.category]
      : []
  const orientation = params.orientation ?? ''
  const sort = params.sort ?? 'relevant'
  const minPrice = params.minPrice ? Number(params.minPrice) : 0
  const maxPrice = params.maxPrice ? Number(params.maxPrice) : Infinity

  let filtered = dummyImages.filter(img => img.isActive)

  if (q) {
    const lq = q.toLowerCase()
    filtered = filtered.filter(
      img =>
        img.name.toLowerCase().includes(lq) ||
        img.tags.some(t => t.toLowerCase().includes(lq)) ||
        (img.description ?? '').toLowerCase().includes(lq)
    )
  }

  if (categories.length > 0) {
    const catIds = dummyCategories
      .filter(c => categories.includes(c.slug))
      .map(c => c.id)
    filtered = filtered.filter(img => catIds.includes(img.categoryId))
  }

  if (orientation) {
    filtered = filtered.filter(img => img.orientation === orientation)
  }

  if (minPrice > 0) {
    filtered = filtered.filter(img => img.basePrice >= minPrice)
  }
  if (maxPrice < Infinity) {
    filtered = filtered.filter(img => img.basePrice <= maxPrice)
  }

  if (sort === 'newest') {
    filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  } else {
    filtered.sort((a, b) => b.salesCount - a.salesCount)
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-screen-xl px-4 py-8 md:px-8">
        <div className="flex gap-8">
          <SearchFilters
            selectedCategories={categories}
            selectedOrientation={orientation}
            minPrice={params.minPrice ?? ''}
            maxPrice={params.maxPrice ?? ''}
          />
          <div className="min-w-0 flex-1">
            <SearchHeader
              query={q}
              totalCount={filtered.length}
              currentSort={sort}
              selectedCategories={categories}
              selectedOrientation={orientation}
              minPrice={params.minPrice ?? ''}
              maxPrice={params.maxPrice ?? ''}
            />
            {filtered.length > 0 ? (
              <ImageGrid images={filtered} showWishlist={true} />
            ) : (
              <EmptyState
                icon={SearchX}
                title="검색 결과가 없습니다"
                description={
                  q
                    ? `"${q}"에 대한 이미지를 찾을 수 없습니다.`
                    : '조건에 맞는 이미지가 없습니다.'
                }
                action={{ label: '전체 이미지 보기', href: '/search' }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
