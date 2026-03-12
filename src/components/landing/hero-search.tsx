'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ChevronDown, Image as ImageIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

const CATEGORIES = [
  { label: '모든 이미지', value: '' },
  { label: '자연/풍경', value: 'nature-landscape' },
  { label: '인물', value: 'people' },
  { label: '비즈니스', value: 'business' },
  { label: '음식', value: 'food' },
  { label: '건축', value: 'architecture' },
]

interface HeroSearchProps {
  className?: string
}

export function HeroSearch({ className }: HeroSearchProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [showDropdown, setShowDropdown] = useState(false)

  const handleSearch = () => {
    const trimmed = query.trim()
    const params = new URLSearchParams()
    if (trimmed) params.set('q', trimmed)
    if (category.value) params.set('category', category.value)
    router.push(`/search?${params.toString()}`)
  }

  return (
    <div className={cn('w-full max-w-3xl', className)}>
      <div className="flex h-14 items-stretch overflow-hidden rounded-lg bg-white shadow-2xl">
        {/* 카테고리 선택 */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowDropdown(prev => !prev)}
            className="flex h-full items-center gap-1.5 border-r border-gray-200 px-4 text-sm font-medium whitespace-nowrap text-gray-700 transition-colors hover:bg-gray-50"
          >
            <ImageIcon className="h-4 w-4 text-gray-500" />
            <span>{category.label}</span>
            <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
          </button>

          {showDropdown && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowDropdown(false)}
              />
              <div className="absolute top-full left-0 z-50 mt-1 w-44 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => {
                      setCategory(cat)
                      setShowDropdown(false)
                    }}
                    className={cn(
                      'w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-gray-50',
                      category.value === cat.value
                        ? 'bg-gray-50 font-medium text-gray-900'
                        : 'text-gray-600'
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* 검색 input */}
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') handleSearch()
          }}
          placeholder="이미지 검색..."
          className="min-w-0 flex-1 bg-transparent px-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
        />

        {/* 검색 버튼 */}
        <button
          type="button"
          onClick={handleSearch}
          className="flex h-full items-center gap-2 bg-[#c0392b] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#a93226] active:bg-[#922b21]"
        >
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">검색</span>
        </button>
      </div>
    </div>
  )
}
