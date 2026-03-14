'use client'

import { useState, useRef } from 'react'
import { UploadCloud, X } from 'lucide-react'
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
import { useCreateProduct } from '@/lib/hooks/use-admin-products'
import { IMAGE_UPLOAD_MAX_SIZE_MB } from '@/lib/constants'
import type { Orientation } from '@/types/enums'

interface ProductUploadModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface FieldErrors {
  file?: string
  name?: string
  code?: string
  basePrice?: string
  server?: string
}

const ERR_STYLE = 'border-destructive/50 bg-destructive/5'

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-destructive text-[13px] mt-1">{message}</p>
}

export function ProductUploadModal({
  open,
  onOpenChange,
}: ProductUploadModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [description, setDescription] = useState('')
  const [orientation, setOrientation] = useState<Orientation>('LANDSCAPE')
  const [basePrice, setBasePrice] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [colorTags, setColorTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [colorTagInput, setColorTagInput] = useState('')
  const [isDragOver, setIsDragOver] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  const createMutation = useCreateProduct()

  function resetForm() {
    setFile(null)
    setPreview(null)
    setName('')
    setCode('')
    setDescription('')
    setOrientation('LANDSCAPE')
    setBasePrice('')
    setTags([])
    setColorTags([])
    setTagInput('')
    setColorTagInput('')
    setErrors({})
  }

  function handleClose() {
    if (createMutation.isPending) return
    resetForm()
    onOpenChange(false)
  }

  function handleFileSelect(selectedFile: File) {
    if (preview) URL.revokeObjectURL(preview)
    setFile(selectedFile)
    setPreview(URL.createObjectURL(selectedFile))
    clearField('file')
  }

  function clearField(field: keyof FieldErrors) {
    setErrors(prev => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragOver(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) handleFileSelect(dropped)
  }

  function validate(): FieldErrors {
    const errs: FieldErrors = {}
    if (!file) errs.file = '이미지 파일을 선택해주세요'
    if (!name.trim()) errs.name = '상품명은 필수 항목입니다'
    if (!basePrice || Number(basePrice) <= 0)
      errs.basePrice = '1원 이상의 가격을 입력해주세요'
    return errs
  }

  async function handleSubmit() {
    const fieldErrors = validate()
    setErrors(fieldErrors)
    if (Object.keys(fieldErrors).length > 0) return

    const formData = new FormData()
    formData.set('file', file!)
    formData.set(
      'metadata',
      JSON.stringify({
        name: name.trim(),
        code: code.trim(),
        description: description.trim() || undefined,
        orientation,
        basePrice: Number(basePrice),
        tags,
        colorTags,
      })
    )

    createMutation.mutate(formData, {
      onSuccess: result => {
        if (result.success) {
          resetForm()
          onOpenChange(false)
        } else {
          // Server returned a specific field error
          if (result.field) {
            setErrors({ [result.field]: result.error })
          } else {
            setErrors({ server: result.error ?? '알 수 없는 오류가 발생했습니다' })
          }
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

  // Collect all error messages for summary
  const errorMessages = Object.entries(errors)
    .filter(([, v]) => !!v)
    .map(([, v]) => v!)

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[85vh] max-w-md overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">신규 상품 등록</DialogTitle>
          <DialogDescription className="text-sm">이미지 파일과 상품 정보를 입력하세요.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* 드래그앤드롭 업로드 영역 */}
          <div>
            <div
              className={`relative flex flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed transition-colors ${
                preview ? 'p-0' : 'cursor-pointer p-8'
              } ${
                errors.file
                  ? ERR_STYLE
                  : isDragOver
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-muted-foreground'
              }`}
              onDragOver={e => {
                e.preventDefault()
                setIsDragOver(true)
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={e => {
                if (!preview) {
                  e.stopPropagation()
                  fileInputRef.current?.click()
                }
              }}
            >
              {preview ? (
                <div className="relative w-full">
                  <img
                    src={preview}
                    alt="미리보기"
                    className="w-full rounded object-cover"
                  />
                  <button
                    type="button"
                    className="bg-background/80 hover:bg-background absolute right-2 top-2 rounded-full p-1 shadow"
                    onClick={e => {
                      e.stopPropagation()
                      if (preview) URL.revokeObjectURL(preview)
                      setFile(null)
                      setPreview(null)
                      if (fileInputRef.current) fileInputRef.current.value = ''
                    }}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <UploadCloud className="text-muted-foreground pointer-events-none mb-2 h-8 w-8" />
                  <p className="pointer-events-none text-sm font-medium">
                    이미지를 드래그하거나 클릭하여 업로드
                  </p>
                  <p className="text-muted-foreground pointer-events-none mt-1 text-xs">
                    JPG, PNG, TIFF 허용 · 최대 {IMAGE_UPLOAD_MAX_SIZE_MB}MB
                  </p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/tiff"
                className="hidden"
                onChange={e => {
                  const f = e.target.files?.[0]
                  if (f) handleFileSelect(f)
                  e.target.value = ''
                }}
              />
            </div>
            <FieldError message={errors.file} />
          </div>

          {/* 상품 코드 */}
          <div className="space-y-1.5">
            <Label htmlFor="upload-code" className="text-[13px]">상품 코드</Label>
            <Input
              id="upload-code"
              value={code}
              onChange={e => {
                setCode(e.target.value.replace(/\D/g, '').slice(0, 10))
                clearField('code')
              }}
              placeholder="숫자 10자리"
              className={`text-[14px] ${errors.code ? ERR_STYLE : ''}`}
            />
            {errors.code ? (
              <FieldError message={errors.code} />
            ) : (
              <p className="text-muted-foreground text-xs">
                비워두면 숫자 난수로 자동 생성됩니다
              </p>
            )}
          </div>

          {/* 이름 */}
          <div className="space-y-1.5">
            <Label htmlFor="upload-name" className="text-[13px]">
              이름 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="upload-name"
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
            <Label htmlFor="upload-description" className="text-[13px]">설명</Label>
            <Textarea
              id="upload-description"
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
            <Label htmlFor="upload-price" className="text-[13px]">
              기준 가격 (원) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="upload-price"
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
              disabled={createMutation.isPending}
            >
              취소
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? '등록 중...' : '등록'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
