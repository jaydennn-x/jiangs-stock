'use client'

import { useEffect, useRef } from 'react'
import { Loader2 } from 'lucide-react'
import { SearchX } from 'lucide-react'

import { useImageSearch } from '@/lib/hooks/use-image-search'
import { ImageGrid } from '@/components/common/image-grid'
import { EmptyState } from '@/components/common/empty-state'
import type { SearchParams } from '@/types/api'

interface SearchResultsClientProps {
  initialParams: SearchParams
}

export function SearchResultsClient({
  initialParams,
}: SearchResultsClientProps) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useImageSearch(initialParams)

  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="py-12 text-center text-sm text-gray-500">
        이미지를 불러오는 중 오류가 발생했습니다.
      </div>
    )
  }

  const images = data?.pages.flatMap(p => p.images) ?? []
  const totalCount = data?.pages[0]?.pagination.totalCount ?? 0

  if (images.length === 0) {
    return (
      <EmptyState
        icon={SearchX}
        title="검색 결과가 없습니다"
        description={
          initialParams.q
            ? `"${initialParams.q}"에 대한 이미지를 찾을 수 없습니다.`
            : '조건에 맞는 이미지가 없습니다.'
        }
        action={{ label: '전체 이미지 보기', href: '/search' }}
      />
    )
  }

  return (
    <div>
      <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
        {totalCount > 0 && `총 ${totalCount.toLocaleString()}개`}
      </p>

      <ImageGrid images={images} showWishlist={true} />

      {/* 무한스크롤 센티넬 */}
      <div ref={sentinelRef} className="h-8" />

      {isFetchingNextPage && (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      )}

      {!hasNextPage && images.length > 0 && (
        <p className="py-6 text-center text-xs text-gray-400">
          모든 이미지를 불러왔습니다.
        </p>
      )}
    </div>
  )
}
