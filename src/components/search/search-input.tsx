'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface SearchInputProps {
  defaultValue?: string
  placeholder?: string
  className?: string
}

export function SearchInput({
  defaultValue = '',
  placeholder = '이미지 검색...',
  className,
}: SearchInputProps) {
  const router = useRouter()
  const [value, setValue] = useState(defaultValue)

  const handleSearch = () => {
    const trimmed = value.trim()
    if (trimmed) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`)
    }
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="relative flex-1">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <input
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') handleSearch()
          }}
          placeholder={placeholder}
          className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border py-2 pr-4 pl-9 text-sm focus-visible:ring-2 focus-visible:outline-none"
        />
      </div>
      <Button onClick={handleSearch} size="sm">
        검색
      </Button>
    </div>
  )
}
