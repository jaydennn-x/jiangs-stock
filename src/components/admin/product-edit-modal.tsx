'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { useUpdateProduct } from '@/lib/hooks/use-admin-products'
import type { ImageWithCategory } from '@/lib/validations/admin-product'
import type { Orientation } from '@/types/enums'

interface ProductEditModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  image: ImageWithCategory | null
}

interface FieldErrors {
  name?: string
  basePrice?: string
  server?: string
}

const ERR_STYLE = 'border-destructive/50 bg-destructive/5'

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-destructive text-[13px] mt-1">{message}</p>
}

export function ProductEditModal({
  open,
  onOpenChange,
  image,
}: ProductEditModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [orientation, setOrientation] = useState<Orientation>('LANDSCAPE')
  const [basePrice, setBasePrice] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [colorTags, setColorTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [colorTagInput, setColorTagInput] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})

  const updateMutation = useUpdateProduct()

  // Sync state when image changes
  useEffect(() => {
    if (image && open) {
      setName(image.name)
      setDescription(image.description ?? '')
      setOrientation(image.orientation)
      setBasePrice(String(image.basePrice))
      setTags([...image.tags])
      setColorTags([...image.colorTags])
      setTagInput('')
      setColorTagInput('')
      setErrors({})
    }
  }, [image, open])

  function handleClose() {
    if (updateMutation.isPending) return
    setErrors({})
    onOpenChange(false)
  }

  function clearField(field: keyof FieldErrors) {
    setErrors(prev => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  function validate(): FieldErrors {
    const errs: FieldErrors = {}
    if (!name.trim()) errs.name = '상품명은 필수 항목입니다'
    if (!basePrice || Number(basePrice) <= 0)
      errs.basePrice = '1원 이상의 가격을 입력해주세요'
    return errs
  }

  async function handleSave() {
    if (!image) return

    const fieldErrors = validate()
    setErrors(fieldErrors)
    if (Object.keys(fieldErrors).length > 0) return

    const formData = new FormData()
    formData.set(
      'metadata',
      JSON.stringify({
        imageId: image.id,
        name: name.trim(),
        description: description.trim() || undefined,
        orientation,
        basePrice: Number(basePrice),
        tags,
        colorTags,
      })
    )

    updateMutation.mutate(formData, {
      onSuccess: result => {
        if (result.success) {
          onOpenChange(false)
        } else {
          setErrors({ server: result.error ?? '알 수 없는 오류가 발생했습니다' })
        }
      },
      onError: () => {
        setErrors({ server: '서버와 연결할 수 없습니다. 네트워크를 확인해주세요.' })
      },
    })
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

  const hasThumbnail =
    image.processingStatus === 'COMPLETED' && !!image.thumbnailUrl

  const errorMessages = Object.entries(errors)
    .filter(([, v]) => !!v)
    .map(([, v]) => v!)

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[85vh] max-w-md overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">상품 수정</DialogTitle>
          <DialogDescription className="text-sm">
            {image.code} 상품의 정보를 수정합니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* 썸네일 미리보기 */}
          {hasThumbnail && (
            <div className="overflow-hidden rounded-lg border">
              <img
                src={`/api/images/thumbnail/${image.id}`}
                alt={image.name}
                className="w-full object-cover"
              />
            </div>
          )}

          {/* 상품 코드 (읽기 전용) */}
          <div className="space-y-1.5">
            <Label className="text-[13px]">상품 코드</Label>
            <Input
              value={image.code}
              disabled
              className="text-[14px] bg-muted/50"
            />
          </div>

          {/* 이름 */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-name" className="text-[13px]">
              이름 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit-name"
              value={name}
              onChange={e => {
                setName(e.target.value)
                clearField('name')
              }}
              placeholder="상품 이름 입력"
              className={`text-[14px] ${errors.name ? ERR_STYLE : ''}`}
            />
            <FieldError message={errors.name} />
          </div>

          {/* 설명 */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-description" className="text-[13px]">설명</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="상품 설명 입력"
              rows={3}
              className="text-[14px]"
            />
          </div>

          {/* 방향 */}
          <div className="space-y-1.5">
            <Label className="text-[13px]">방향</Label>
            <Select
              value={orientation}
              onValueChange={v => setOrientation(v as Orientation)}
            >
              <SelectTrigger className="text-[14px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LANDSCAPE">가로</SelectItem>
                <SelectItem value="PORTRAIT">세로</SelectItem>
                <SelectItem value="SQUARE">정사각</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 태그 */}
          <div className="space-y-1.5">
            <Label className="text-[13px]">태그</Label>
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
                className="text-[14px]"
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
            <Label className="text-[13px]">색상 태그</Label>
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
                className="text-[14px]"
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
            <Label htmlFor="edit-price" className="text-[13px]">
              기준 가격 (원) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit-price"
              type="number"
              min={0}
              value={basePrice}
              onChange={e => {
                setBasePrice(e.target.value)
                clearField('basePrice')
              }}
              placeholder="예: 15000"
              className={`text-[14px] ${errors.basePrice ? ERR_STYLE : ''}`}
            />
            <FieldError message={errors.basePrice} />
          </div>
        </div>

        <DialogFooter className="flex-col items-stretch gap-2 sm:flex-col">
          {errorMessages.length > 0 && (
            <p className="text-destructive text-center text-[13px]">
              {errors.server ?? `${errorMessages.length}개 항목을 확인해주세요`}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={updateMutation.isPending}
            >
              취소
            </Button>
            <Button
              onClick={handleSave}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? '저장 중...' : '저장'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
