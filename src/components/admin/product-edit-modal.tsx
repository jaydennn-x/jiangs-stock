'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Image, Category } from '@/types/models'

interface ProductEditModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  image: Image | null
  categories: Category[]
}

export function ProductEditModal({
  open,
  onOpenChange,
  image,
  categories,
}: ProductEditModalProps) {
  const [name, setName] = useState(image?.name ?? '')
  const [description, setDescription] = useState(image?.description ?? '')
  const [categoryId, setCategoryId] = useState(image?.categoryId ?? '')
  const [basePrice, setBasePrice] = useState(
    image ? String(image.basePrice) : ''
  )
  const [tags, setTags] = useState<string[]>(image ? [...image.tags] : [])
  const [colorTags, setColorTags] = useState<string[]>(
    image ? [...image.colorTags] : []
  )
  const [tagInput, setTagInput] = useState('')
  const [colorTagInput, setColorTagInput] = useState('')

  function handleClose() {
    onOpenChange(false)
  }

  function handleSave() {
    onOpenChange(false)
  }

  function addTag() {
    const trimmed = tagInput.trim()
    if (trimmed && !tags.includes(trimmed)) {
      setTags(prev => [...prev, trimmed])
    }
    setTagInput('')
  }

  function removeTag(tag: string) {
    setTags(prev => prev.filter(t => t !== tag))
  }

  function addColorTag() {
    const trimmed = colorTagInput.trim()
    if (trimmed && !colorTags.includes(trimmed)) {
      setColorTags(prev => [...prev, trimmed])
    }
    setColorTagInput('')
  }

  function removeColorTag(tag: string) {
    setColorTags(prev => prev.filter(t => t !== tag))
  }

  if (!image) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            상품 수정{' '}
            <span className="text-muted-foreground text-sm font-normal">
              ({image.code})
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* 이름 */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-name">
              이름 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit-name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="상품 이름 입력"
            />
          </div>

          {/* 설명 */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-description">설명</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="상품 설명 입력"
              rows={3}
            />
          </div>

          {/* 카테고리 */}
          <div className="space-y-1.5">
            <Label>
              카테고리 <span className="text-destructive">*</span>
            </Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="카테고리 선택" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 태그 */}
          <div className="space-y-1.5">
            <Label>태그</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addTag()
                  }
                }}
                placeholder="태그 입력 후 Enter"
              />
              <Button type="button" variant="outline" onClick={addTag}>
                추가
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-foreground text-muted-foreground ml-0.5 rounded"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* 색상 태그 */}
          <div className="space-y-1.5">
            <Label>색상 태그</Label>
            <div className="flex gap-2">
              <Input
                value={colorTagInput}
                onChange={e => setColorTagInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addColorTag()
                  }
                }}
                placeholder="색상 태그 입력 후 Enter (예: red, blue)"
              />
              <Button type="button" variant="outline" onClick={addColorTag}>
                추가
              </Button>
            </div>
            {colorTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {colorTags.map(tag => (
                  <Badge key={tag} variant="outline" className="gap-1 pr-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeColorTag(tag)}
                      className="hover:text-foreground text-muted-foreground ml-0.5 rounded"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* 기준 가격 */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-price">
              기준 가격 (원) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit-price"
              type="number"
              min={0}
              value={basePrice}
              onChange={e => setBasePrice(e.target.value)}
              placeholder="예: 15000"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            취소
          </Button>
          <Button onClick={handleSave}>저장</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
