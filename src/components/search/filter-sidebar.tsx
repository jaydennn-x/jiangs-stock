'use client'

import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { dummyCategories } from '@/lib/dummy/categories'
import type { Orientation } from '@/types/enums'

const ORIENTATION_OPTIONS: { value: Orientation; label: string }[] = [
  { value: 'LANDSCAPE', label: '가로형' },
  { value: 'PORTRAIT', label: '세로형' },
  { value: 'SQUARE', label: '정방형' },
]

const COLOR_OPTIONS = [
  { value: 'red', label: '빨강', className: 'bg-red-500' },
  { value: 'orange', label: '주황', className: 'bg-orange-500' },
  { value: 'yellow', label: '노랑', className: 'bg-yellow-400' },
  { value: 'green', label: '초록', className: 'bg-green-500' },
  { value: 'blue', label: '파랑', className: 'bg-blue-500' },
  { value: 'pink', label: '분홍', className: 'bg-pink-400' },
  { value: 'brown', label: '갈색', className: 'bg-amber-700' },
  { value: 'gray', label: '회색', className: 'bg-gray-400' },
  { value: 'white', label: '흰색', className: 'bg-white border' },
  { value: 'black', label: '검정', className: 'bg-black' },
]

interface FilterSidebarProps {
  selectedCategories: string[]
  onCategoryChange: (categories: string[]) => void
  selectedOrientations: Orientation[]
  onOrientationChange: (orientations: Orientation[]) => void
  selectedColors: string[]
  onColorChange: (colors: string[]) => void
  className?: string
}

export function FilterSidebar({
  selectedCategories,
  onCategoryChange,
  selectedOrientations,
  onOrientationChange,
  selectedColors,
  onColorChange,
  className,
}: FilterSidebarProps) {
  const toggleCategory = (slug: string) => {
    if (selectedCategories.includes(slug)) {
      onCategoryChange(selectedCategories.filter(c => c !== slug))
    } else {
      onCategoryChange([...selectedCategories, slug])
    }
  }

  const toggleOrientation = (orientation: Orientation) => {
    if (selectedOrientations.includes(orientation)) {
      onOrientationChange(selectedOrientations.filter(o => o !== orientation))
    } else {
      onOrientationChange([...selectedOrientations, orientation])
    }
  }

  const toggleColor = (color: string) => {
    if (selectedColors.includes(color)) {
      onColorChange(selectedColors.filter(c => c !== color))
    } else {
      onColorChange([...selectedColors, color])
    }
  }

  return (
    <aside className={cn('flex flex-col gap-6', className)}>
      <div>
        <h3 className="mb-3 text-sm font-semibold">카테고리</h3>
        <div className="flex flex-col gap-2">
          {dummyCategories.map(category => (
            <label
              key={category.id}
              className="flex cursor-pointer items-center gap-2"
            >
              <Checkbox
                checked={selectedCategories.includes(category.slug)}
                onCheckedChange={() => toggleCategory(category.slug)}
              />
              <span className="text-sm">{category.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold">방향</h3>
        <div className="flex flex-col gap-2">
          {ORIENTATION_OPTIONS.map(option => (
            <label
              key={option.value}
              className="flex cursor-pointer items-center gap-2"
            >
              <Checkbox
                checked={selectedOrientations.includes(option.value)}
                onCheckedChange={() => toggleOrientation(option.value)}
              />
              <span className="text-sm">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold">색상</h3>
        <div className="flex flex-wrap gap-2">
          {COLOR_OPTIONS.map(color => (
            <button
              key={color.value}
              type="button"
              onClick={() => toggleColor(color.value)}
              title={color.label}
              className={cn(
                'h-7 w-7 rounded-full transition-all',
                color.className,
                selectedColors.includes(color.value)
                  ? 'ring-primary ring-2 ring-offset-2'
                  : 'hover:ring-muted-foreground hover:ring-2 hover:ring-offset-1'
              )}
              aria-label={color.label}
              aria-pressed={selectedColors.includes(color.value)}
            />
          ))}
        </div>
      </div>
    </aside>
  )
}
