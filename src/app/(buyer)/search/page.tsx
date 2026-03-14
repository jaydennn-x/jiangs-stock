import type { Metadata } from 'next'
import type { Orientation } from '@/types/enums'
import { SearchFilters } from '@/components/search/search-filters'
import { SearchHeader } from '@/components/search/search-header'
import { SearchResultsClient } from '@/components/search/search-results-client'

type SearchPageParams = Promise<{
  q?: string
  orientation?: string
  sort?: string
  tag?: string
  colorTag?: string
  minPrice?: string
  maxPrice?: string
  limit?: string
}>

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchPageParams
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
  searchParams: SearchPageParams
}) {
  const params = await searchParams

  const q = params.q ?? ''
  const orientation = (params.orientation ?? '') as Orientation | ''
  const sort = params.sort ?? 'popular'
  const tag = params.tag ?? ''
  const colorTag = params.colorTag ?? ''
  const minPrice = params.minPrice ? Number(params.minPrice) : undefined
  const maxPrice = params.maxPrice ? Number(params.maxPrice) : undefined

  const initialParams = {
    q: q || undefined,
    orientation: orientation || undefined,
    sort: sort as 'latest' | 'popular' | 'price_asc' | 'price_desc',
    tag: tag || undefined,
    colorTag: colorTag || undefined,
    ...(minPrice !== undefined && { minPrice }),
    ...(maxPrice !== undefined && { maxPrice }),
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="mx-auto max-w-screen-xl px-4 py-8 md:px-8">
        <div className="flex gap-8">
          <SearchFilters
            selectedOrientation={orientation}
            minPrice={params.minPrice ?? ''}
            maxPrice={params.maxPrice ?? ''}
          />
          <div className="min-w-0 flex-1">
            <SearchHeader
              query={q}
              currentSort={sort}
              selectedOrientation={orientation}
              minPrice={params.minPrice ?? ''}
              maxPrice={params.maxPrice ?? ''}
            />
            <SearchResultsClient initialParams={initialParams} />
          </div>
        </div>
      </div>
    </div>
  )
}
