'use client'

import { useState } from 'react'
import { UploadCloud, X } from 'lucide-react'
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
import type { Category } from '@/types/models'

interface ProductUploadModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: Category[]
}

const INITIAL_STATE = {
  name: '',
  description: '',
  categoryId: '',
  basePrice: '',
  tags: [] as string[],
  colorTags: [] as string[],
  tagInput: '',
  colorTagInput: '',
  isDragOver: false,
}

export function ProductUploadModal({
  open,
  onOpenChange,
  categories,
}: ProductUploadModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [basePrice, setBasePrice] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [colorTags, setColorTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [colorTagInput, setColorTagInput] = useState('')
  const [isDragOver, setIsDragOver] = useState(false)

  function resetForm() {
    setName('')
    setDescription('')
    setCategoryId('')
    setBasePrice('')
    setTags([])
    setColorTags([])
    setTagInput('')
    setColorTagInput('')
    setIsDragOver(false)
  }

  function handleClose() {
    resetForm()
    onOpenChange(false)
  }

  function handleSubmit() {
    onOpenChange(false)
    resetForm()
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

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>신규 상품 등록</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* 드래그앤드롭 업로드 영역 */}
          <div
            className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
              isDragOver
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-muted-foreground'
            }`}
            onDragOver={e => {
              e.preventDefault()
              setIsDragOver(true)
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={e => {
              e.preventDefault()
              setIsDragOver(false)
            }}
          >
            <UploadCloud className="text-muted-foreground mb-2 h-8 w-8" />
            <p className="text-sm font-medium">
              이미지를 드래그하거나 클릭하여 업로드
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              JPG, PNG, TIFF 허용 · 최대 50MB
            </p>
          </div>

          {/* 이름 */}
          <div className="space-y-1.5">
            <Label htmlFor="upload-name">
              이름 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="upload-name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="상품 이름 입력"
            />
          </div>

          {/* 설명 */}
          <div className="space-y-1.5">
            <Label htmlFor="upload-description">설명</Label>
            <Textarea
              id="upload-description"
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
            <Label htmlFor="upload-price">
              기준 가격 (원) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="upload-price"
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
          <Button onClick={handleSubmit}>등록</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
