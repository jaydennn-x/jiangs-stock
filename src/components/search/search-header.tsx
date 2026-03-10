'use client'

import { useRouter, useSearchParams } from 'next/navigation'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MobileFilterSheet } from './search-filters'

const SORT_OPTIONS = [
  { value: 'relevant', label: '관련도순' },
  { value: 'newest', label: '최신순' },
  { value: 'popular', label: '인기순' },
]

interface SearchHeaderProps {
  query: string
  totalCount: number
  currentSort: string
  selectedCategories: string[]
  selectedOrientation: string
  minPrice: string
  maxPrice: string
}

export function SearchHeader({
  query,
  totalCount,
  currentSort,
  selectedCategories,
  selectedOrientation,
  minPrice,
  maxPrice,
}: SearchHeaderProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function handleSortChange(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'relevant') {
      params.set('sort', value)
    } else {
      params.delete('sort')
    }
    router.push('/search?' + params.toString())
  }

  const title = query
    ? `"${query}" 검색 결과 ${totalCount.toLocaleString()}개`
    : `전체 이미지 ${totalCount.toLocaleString()}개`

  return (
    <div className="mb-6 flex items-center justify-between border-b border-gray-100 py-4">
      <h1 className="text-base font-semibold text-gray-900">{title}</h1>

      <div className="flex items-center gap-3">
        {/* 모바일 필터 버튼 */}
        <div className="lg:hidden">
          <MobileFilterSheet
            selectedCategories={selectedCategories}
            selectedOrientation={selectedOrientation}
            minPrice={minPrice}
            maxPrice={maxPrice}
          />
        </div>

        {/* 정렬 */}
        <Select
          value={currentSort || 'relevant'}
          onValueChange={handleSortChange}
        >
          <SelectTrigger className="h-9 w-28 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
