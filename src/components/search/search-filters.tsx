'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { SlidersHorizontal } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

const CATEGORIES = [
  { id: 'cat-001', name: '자연/풍경', slug: 'nature-landscape' },
  { id: 'cat-002', name: '인물', slug: 'people' },
  { id: 'cat-003', name: '비즈니스', slug: 'business' },
  { id: 'cat-004', name: '음식', slug: 'food' },
  { id: 'cat-005', name: '건축', slug: 'architecture' },
  { id: 'cat-006', name: '기타', slug: 'other' },
]

const ORIENTATIONS = [
  { value: 'LANDSCAPE', label: '가로형' },
  { value: 'PORTRAIT', label: '세로형' },
  { value: 'SQUARE', label: '정사각형' },
]

interface SearchFiltersProps {
  selectedCategories: string[]
  selectedOrientation: string
  minPrice: string
  maxPrice: string
}

function FilterContent({
  selectedCategories,
  selectedOrientation,
  minPrice,
  maxPrice,
}: SearchFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function buildParams() {
    return new URLSearchParams(searchParams.toString())
  }

  function toggleCategory(slug: string) {
    const params = buildParams()
    const current = params.getAll('category')
    params.delete('category')
    if (current.includes(slug)) {
      current.filter(c => c !== slug).forEach(c => params.append('category', c))
    } else {
      ;[...current, slug].forEach(c => params.append('category', c))
    }
    router.push('/search?' + params.toString())
  }

  function setOrientation(value: string) {
    const params = buildParams()
    if (value) {
      params.set('orientation', value)
    } else {
      params.delete('orientation')
    }
    router.push('/search?' + params.toString())
  }

  function setPrice(key: 'minPrice' | 'maxPrice', value: string) {
    const params = buildParams()
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push('/search?' + params.toString())
  }

  function clearAllFilters() {
    const params = buildParams()
    const q = params.get('q')
    const fresh = new URLSearchParams()
    if (q) fresh.set('q', q)
    router.push('/search?' + fresh.toString())
  }

  return (
    <div className="w-full space-y-5">
      {/* 카테고리 */}
      <div>
        <p className="mb-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">
          카테고리
        </p>
        <div className="space-y-2.5">
          {CATEGORIES.map(cat => (
            <div key={cat.slug} className="flex items-center gap-2.5">
              <Checkbox
                id={`cat-${cat.slug}`}
                checked={selectedCategories.includes(cat.slug)}
                onCheckedChange={() => toggleCategory(cat.slug)}
              />
              <Label
                htmlFor={`cat-${cat.slug}`}
                className="cursor-pointer text-sm font-normal text-gray-700 dark:text-gray-300"
              >
                {cat.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* 방향 */}
      <div>
        <p className="mb-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">
          방향
        </p>
        <div className="space-y-2.5">
          {/* 전체 선택 */}
          <label className="flex cursor-pointer items-center gap-2.5">
            <input
              type="radio"
              name="orientation"
              value=""
              checked={!selectedOrientation}
              onChange={() => setOrientation('')}
              className="h-4 w-4 accent-gray-900"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">전체</span>
          </label>
          {ORIENTATIONS.map(ori => (
            <label
              key={ori.value}
              className="flex cursor-pointer items-center gap-2.5"
            >
              <input
                type="radio"
                name="orientation"
                value={ori.value}
                checked={selectedOrientation === ori.value}
                onChange={() => setOrientation(ori.value)}
                className="h-4 w-4 accent-gray-900"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{ori.label}</span>
            </label>
          ))}
        </div>
      </div>

      <Separator />

      {/* 가격 범위 */}
      <div>
        <p className="mb-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">
          가격 범위
        </p>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="최소"
            defaultValue={minPrice}
            min={0}
            step={1000}
            className="h-8 text-sm"
            onBlur={e => setPrice('minPrice', e.target.value)}
          />
          <span className="shrink-0 text-xs text-gray-400">~</span>
          <Input
            type="number"
            placeholder="최대"
            defaultValue={maxPrice}
            min={0}
            step={1000}
            className="h-8 text-sm"
            onBlur={e => setPrice('maxPrice', e.target.value)}
          />
        </div>
        <p className="mt-1.5 text-xs text-gray-400">단위: 원</p>
      </div>

      <Separator />

      {/* 초기화 */}
      <Button
        variant="outline"
        size="sm"
        className="w-full text-xs"
        onClick={clearAllFilters}
      >
        필터 초기화
      </Button>
    </div>
  )
}

export function SearchFilters(props: SearchFiltersProps) {
  return (
    <aside className="hidden w-56 shrink-0 lg:block">
      <div className="sticky top-6">
        <p className="mb-4 text-sm font-semibold text-gray-900 dark:text-gray-100">필터</p>
        <FilterContent {...props} />
      </div>
    </aside>
  )
}

export function MobileFilterSheet(props: SearchFiltersProps) {
  const activeCount =
    props.selectedCategories.length +
    (props.selectedOrientation ? 1 : 0) +
    (props.minPrice ? 1 : 0) +
    (props.maxPrice ? 1 : 0)

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 gap-2 text-sm">
          <SlidersHorizontal className="h-4 w-4" />
          필터
          {activeCount > 0 && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-gray-900 text-[10px] font-bold text-white">
              {activeCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>필터</SheetTitle>
        </SheetHeader>
        <FilterContent {...props} />
      </SheetContent>
    </Sheet>
  )
}
