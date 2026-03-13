'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  Plus,
  ImageIcon,
  Loader2,
  Trash2,
  Check,
  X,
  Search,
  Eye,
  EyeOff,
  FolderEdit,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { ProductUploadModal } from '@/components/admin/product-upload-modal'
import { ProductEditModal } from '@/components/admin/product-edit-modal'
import {
  useAdminProducts,
  useUpdateProductField,
  useDeleteProduct,
  useToggleProductActive,
  useBulkDeleteProducts,
  useBulkUpdateProductsActive,
  useBulkUpdateProductsCategory,
} from '@/lib/hooks/use-admin-products'
import type { ImageWithCategory } from '@/lib/validations/admin-product'
import type { ProcessingStatus } from '@/types/enums'
import type { Category } from '@/types/models'

// --- Types ---

interface AdminProductsClientProps {
  categories: Category[]
}

interface EditingCell {
  rowId: string
  field: string
}

// --- Constants ---

const PROCESSING_STATUS_LABEL: Record<ProcessingStatus, string> = {
  PENDING: '대기',
  PROCESSING: '처리중',
  COMPLETED: '완료',
  FAILED: '실패',
}

const PROCESSING_STATUS_VARIANT: Record<
  ProcessingStatus,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  PENDING: 'secondary',
  PROCESSING: 'outline',
  COMPLETED: 'default',
  FAILED: 'destructive',
}

const ORIENTATION_LABEL: Record<string, string> = {
  LANDSCAPE: '가로',
  PORTRAIT: '세로',
  SQUARE: '정사각',
}

// --- Editable Cell Components ---

function EditableTextCell({
  value,
  imageId,
  field,
  editingCell,
  onStartEdit,
  onSave,
  onCancel,
  className = '',
}: {
  value: string
  imageId: string
  field: string
  editingCell: EditingCell | null
  onStartEdit: (rowId: string, field: string) => void
  onSave: (imageId: string, field: string, value: string) => void
  onCancel: () => void
  className?: string
}) {
  const isEditing =
    editingCell?.rowId === imageId && editingCell?.field === field
  const inputRef = useRef<HTMLInputElement>(null)
  const [localValue, setLocalValue] = useState(value)

  useEffect(() => {
    if (isEditing) {
      setLocalValue(value)
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [isEditing, value])

  if (!isEditing) {
    return (
      <div
        className={`cursor-pointer rounded px-1.5 py-0.5 hover:bg-muted/50 ${className}`}
        onClick={() => onStartEdit(imageId, field)}
        title="클릭하여 편집"
      >
        {value || <span className="text-muted-foreground italic">-</span>}
      </div>
    )
  }

  return (
    <Input
      ref={inputRef}
      value={localValue}
      onChange={e => setLocalValue(e.target.value)}
      onBlur={() => {
        if (localValue.trim() !== value) {
          onSave(imageId, field, localValue.trim())
        } else {
          onCancel()
        }
      }}
      onKeyDown={e => {
        if (e.key === 'Enter') {
          e.currentTarget.blur()
        }
        if (e.key === 'Escape') {
          setLocalValue(value)
          onCancel()
        }
      }}
      className="h-7 text-sm"
    />
  )
}

function EditablePriceCell({
  value,
  imageId,
  editingCell,
  onStartEdit,
  onSave,
  onCancel,
}: {
  value: number
  imageId: string
  editingCell: EditingCell | null
  onStartEdit: (rowId: string, field: string) => void
  onSave: (imageId: string, field: string, value: number) => void
  onCancel: () => void
}) {
  const isEditing =
    editingCell?.rowId === imageId && editingCell?.field === 'basePrice'
  const inputRef = useRef<HTMLInputElement>(null)
  const [localValue, setLocalValue] = useState(String(value))

  useEffect(() => {
    if (isEditing) {
      setLocalValue(String(value))
      setTimeout(() => {
        inputRef.current?.focus()
        inputRef.current?.select()
      }, 0)
    }
  }, [isEditing, value])

  if (!isEditing) {
    return (
      <div
        className="cursor-pointer rounded px-1.5 py-0.5 text-right hover:bg-muted/50"
        onClick={() => onStartEdit(imageId, 'basePrice')}
        title="클릭하여 편집"
      >
        {value.toLocaleString('ko-KR')}원
      </div>
    )
  }

  return (
    <Input
      ref={inputRef}
      type="number"
      min={0}
      value={localValue}
      onChange={e => setLocalValue(e.target.value)}
      onBlur={() => {
        const num = Number(localValue)
        if (!isNaN(num) && num > 0 && num !== value) {
          onSave(imageId, 'basePrice', num)
        } else {
          onCancel()
        }
      }}
      onKeyDown={e => {
        if (e.key === 'Enter') {
          e.currentTarget.blur()
        }
        if (e.key === 'Escape') {
          setLocalValue(String(value))
          onCancel()
        }
      }}
      className="h-7 w-28 text-right text-sm"
    />
  )
}

function EditableSelectCell({
  value,
  imageId,
  field,
  options,
  editingCell,
  onStartEdit,
  onSave,
  onCancel,
}: {
  value: string
  imageId: string
  field: string
  options: { value: string; label: string }[]
  editingCell: EditingCell | null
  onStartEdit: (rowId: string, field: string) => void
  onSave: (imageId: string, field: string, value: string) => void
  onCancel: () => void
}) {
  const isEditing =
    editingCell?.rowId === imageId && editingCell?.field === field
  const displayLabel =
    options.find(o => o.value === value)?.label ?? value

  if (!isEditing) {
    return (
      <div
        className="cursor-pointer rounded px-1.5 py-0.5 hover:bg-muted/50"
        onClick={() => onStartEdit(imageId, field)}
        title="클릭하여 편집"
      >
        {displayLabel}
      </div>
    )
  }

  return (
    <Select
      defaultOpen
      value={value}
      onValueChange={newValue => {
        if (newValue !== value) {
          onSave(imageId, field, newValue)
        } else {
          onCancel()
        }
      }}
    >
      <SelectTrigger className="h-7 text-sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent
        onPointerDownOutside={() => onCancel()}
      >
        {options.map(opt => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function EditableTagsCell({
  tags,
  imageId,
  field,
  editingCell,
  onStartEdit,
  onSave,
  onCancel,
  variant = 'secondary',
}: {
  tags: string[]
  imageId: string
  field: string
  editingCell: EditingCell | null
  onStartEdit: (rowId: string, field: string) => void
  onSave: (imageId: string, field: string, value: string[]) => void
  onCancel: () => void
  variant?: 'secondary' | 'outline'
}) {
  const isEditing =
    editingCell?.rowId === imageId && editingCell?.field === field
  const [localTags, setLocalTags] = useState<string[]>(tags)
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing) {
      setLocalTags([...tags])
      setInputValue('')
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [isEditing, tags])

  if (!isEditing) {
    return (
      <div
        className="flex min-h-[28px] max-h-[56px] cursor-pointer flex-wrap gap-1 overflow-hidden rounded px-1 py-0.5 hover:bg-muted/50"
        onClick={() => onStartEdit(imageId, field)}
        title="클릭하여 편집"
      >
        {tags.length > 0 ? (
          tags.map(tag => (
            <Badge
              key={tag}
              variant={variant}
              className="text-xs"
            >
              {tag}
            </Badge>
          ))
        ) : (
          <span className="text-muted-foreground text-xs">태그 추가</span>
        )}
      </div>
    )
  }

  function addTag() {
    const trimmed = inputValue.trim()
    if (trimmed && !localTags.includes(trimmed)) {
      setLocalTags(prev => [...prev, trimmed])
    }
    setInputValue('')
  }

  function removeTag(tag: string) {
    setLocalTags(prev => prev.filter(t => t !== tag))
  }

  function handleSave() {
    const changed =
      localTags.length !== tags.length ||
      localTags.some((t, i) => t !== tags[i])
    if (changed) {
      onSave(imageId, field, localTags)
    } else {
      onCancel()
    }
  }

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addTag()
            }
            if (e.key === 'Escape') {
              onCancel()
            }
          }}
          placeholder="Enter로 추가"
          className="h-7 text-xs"
        />
      </div>
      {localTags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {localTags.map(tag => (
            <Badge
              key={tag}
              variant={variant}
              className="gap-0.5 pr-0.5 text-xs"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="hover:text-foreground text-muted-foreground ml-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      <div className="flex gap-1">
        <Button
          size="sm"
          variant="ghost"
          className="h-6 px-2 text-xs"
          onClick={handleSave}
        >
          <Check className="mr-0.5 h-3 w-3" />
          확인
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 px-2 text-xs"
          onClick={onCancel}
        >
          취소
        </Button>
      </div>
    </div>
  )
}

// --- Main Component ---

const columnHelper = createColumnHelper<ImageWithCategory>()

export function AdminProductsClient({
  categories,
}: AdminProductsClientProps) {
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<ImageWithCategory | null>(
    null
  )
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null)
  const [savingCell, setSavingCell] = useState<EditingCell | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [bulkCategoryOpen, setBulkCategoryOpen] = useState(false)
  const [bulkCategoryId, setBulkCategoryId] = useState('')
  const [editTarget, setEditTarget] = useState<ImageWithCategory | null>(null)

  const searchTimerRef = useRef<ReturnType<typeof setTimeout>>(null)

  const queryParams = {
    page: currentPage,
    limit: 20,
    categoryId: categoryFilter !== 'all' ? categoryFilter : undefined,
    isActive:
      activeFilter === 'active'
        ? true
        : activeFilter === 'inactive'
          ? false
          : undefined,
    search: searchQuery || undefined,
  }

  const { data, isLoading, isError } = useAdminProducts(queryParams)
  const updateFieldMutation = useUpdateProductField()
  const deleteMutation = useDeleteProduct()
  const toggleMutation = useToggleProductActive()
  const bulkDeleteMutation = useBulkDeleteProducts()
  const bulkActiveMutation = useBulkUpdateProductsActive()
  const bulkCategoryMutation = useBulkUpdateProductsCategory()

  const images = data?.images ?? []
  const totalPages = data?.totalPages ?? 1
  const total = data?.total ?? 0

  // --- Handlers ---

  function handleSearchInput(value: string) {
    setSearchInput(value)
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    searchTimerRef.current = setTimeout(() => {
      setSearchQuery(value)
      setCurrentPage(1)
    }, 300)
  }

  function handleCategoryFilter(value: string) {
    setCategoryFilter(value)
    setCurrentPage(1)
  }

  function handleActiveFilter(value: string) {
    setActiveFilter(value)
    setCurrentPage(1)
  }

  function handleStartEdit(rowId: string, field: string) {
    setEditingCell({ rowId, field })
  }

  const handleCancelEdit = useCallback(() => {
    setEditingCell(null)
  }, [])

  const handleSaveField = useCallback(
    (imageId: string, field: string, value: unknown) => {
      setEditingCell(null)
      setSavingCell({ rowId: imageId, field })
      updateFieldMutation.mutate(
        { imageId, field, value },
        {
          onSettled: () => setSavingCell(null),
        }
      )
    },
    [updateFieldMutation]
  )

  function handleToggleActive(imageId: string) {
    toggleMutation.mutate(imageId)
  }

  function handleDeleteConfirm() {
    if (deleteTarget) {
      const name = deleteTarget.name
      setDeleteTarget(null)
      deleteMutation.mutate(deleteTarget.id, {
        onSuccess: () => toast.success(`"${name}" 상품이 삭제되었습니다`),
        onError: () => toast.error('상품 삭제에 실패했습니다'),
      })
    }
  }

  // --- Selection Handlers ---

  function handleToggleSelect(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleToggleSelectAll() {
    if (selectedIds.size === images.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(images.map(img => img.id)))
    }
  }

  function clearSelection() {
    setSelectedIds(new Set())
  }

  const selectedArray = Array.from(selectedIds)
  const isBulkPending =
    bulkDeleteMutation.isPending ||
    bulkActiveMutation.isPending ||
    bulkCategoryMutation.isPending

  function handleBulkDelete() {
    const ids = [...selectedArray]
    const count = ids.length
    setBulkDeleteOpen(false)
    clearSelection()
    bulkDeleteMutation.mutate(ids, {
      onSuccess: () => toast.success(`${count}개 상품이 삭제되었습니다`),
      onError: () => toast.error('일괄 삭제에 실패했습니다'),
    })
  }

  function handleBulkActive(isActive: boolean) {
    const count = selectedArray.length
    bulkActiveMutation.mutate(
      { imageIds: selectedArray, isActive },
      {
        onSuccess: () => {
          toast.success(`${count}개 상품이 ${isActive ? '활성화' : '비활성화'}되었습니다`)
          clearSelection()
        },
        onError: () => {
          toast.error('상태 변경에 실패했습니다')
        },
      }
    )
  }

  function handleBulkCategoryConfirm() {
    if (!bulkCategoryId) return
    const count = selectedArray.length
    const catName = categories.find(c => c.id === bulkCategoryId)?.name
    bulkCategoryMutation.mutate(
      { imageIds: selectedArray, categoryId: bulkCategoryId },
      {
        onSuccess: () => {
          toast.success(`${count}개 상품의 카테고리가 "${catName}"(으)로 변경되었습니다`)
          clearSelection()
          setBulkCategoryOpen(false)
          setBulkCategoryId('')
        },
        onError: () => {
          toast.error('카테고리 변경에 실패했습니다')
        },
        onSettled: () => setBulkCategoryOpen(false),
      }
    )
  }

  // --- Category options ---
  const categoryOptions = categories.map(cat => ({
    value: cat.id,
    label: cat.name,
  }))

  const orientationOptions = [
    { value: 'LANDSCAPE', label: '가로' },
    { value: 'PORTRAIT', label: '세로' },
    { value: 'SQUARE', label: '정사각' },
  ]

  // --- Table Columns ---

  const columns = [
    columnHelper.display({
      id: 'select',
      header: () => (
        <Checkbox
          checked={images.length > 0 && selectedIds.size === images.length}
          onCheckedChange={handleToggleSelectAll}
          aria-label="전체 선택"
        />
      ),
      size: 40,
      cell: ({ row }) => (
        <Checkbox
          checked={selectedIds.has(row.original.id)}
          onCheckedChange={() => handleToggleSelect(row.original.id)}
          aria-label={`${row.original.name} 선택`}
        />
      ),
    }),

    columnHelper.display({
      id: 'thumbnail',
      header: () => <span className="text-xs">썸네일</span>,
      size: 72,
      cell: ({ row }) => {
        const img = row.original
        const hasThumbnail =
          img.processingStatus === 'COMPLETED' && !!img.thumbnailUrl
        return (
          <div className="bg-muted relative flex h-14 w-14 items-center justify-center overflow-hidden rounded">
            {hasThumbnail ? (
              <img
                src={`/api/images/thumbnail/${img.id}`}
                alt={img.name}
                className="h-full w-full object-cover"
              />
            ) : img.processingStatus === 'PROCESSING' ? (
              <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
            ) : (
              <ImageIcon className="text-muted-foreground h-5 w-5" />
            )}
          </div>
        )
      },
    }),

    columnHelper.accessor('code', {
      header: () => <span className="text-xs">코드</span>,
      size: 120,
      cell: ({ row }) => (
        <button
          className="text-muted-foreground hover:text-foreground font-mono text-xs underline-offset-2 hover:underline cursor-pointer"
          onClick={() => setEditTarget(row.original)}
        >
          {row.original.code}
        </button>
      ),
    }),

    columnHelper.accessor('name', {
      header: () => <span className="text-xs">이름</span>,
      size: 200,
      cell: ({ row }) => {
        const img = row.original
        const isSaving =
          savingCell?.rowId === img.id && savingCell?.field === 'name'
        return (
          <div className="relative">
            <EditableTextCell
              value={img.name}
              imageId={img.id}
              field="name"
              editingCell={editingCell}
              onStartEdit={handleStartEdit}
              onSave={handleSaveField}
              onCancel={handleCancelEdit}
              className="max-w-[200px] truncate text-sm font-medium"
            />
            {isSaving && (
              <Loader2 className="text-muted-foreground absolute -right-1 top-0.5 h-3 w-3 animate-spin" />
            )}
          </div>
        )
      },
    }),

    columnHelper.accessor('categoryId', {
      header: () => <span className="text-xs">카테고리</span>,
      size: 120,
      cell: ({ row }) => {
        const img = row.original
        return (
          <EditableSelectCell
            value={img.categoryId}
            imageId={img.id}
            field="categoryId"
            options={categoryOptions}
            editingCell={editingCell}
            onStartEdit={handleStartEdit}
            onSave={handleSaveField}
            onCancel={handleCancelEdit}
          />
        )
      },
    }),

    columnHelper.accessor('orientation', {
      header: () => <span className="text-xs">방향</span>,
      size: 90,
      cell: ({ row }) => {
        const img = row.original
        return (
          <EditableSelectCell
            value={img.orientation}
            imageId={img.id}
            field="orientation"
            options={orientationOptions}
            editingCell={editingCell}
            onStartEdit={handleStartEdit}
            onSave={handleSaveField}
            onCancel={handleCancelEdit}
          />
        )
      },
    }),

    columnHelper.accessor('basePrice', {
      header: () => <span className="text-xs">가격</span>,
      size: 120,
      cell: ({ row }) => {
        const img = row.original
        return (
          <EditablePriceCell
            value={Number(img.basePrice)}
            imageId={img.id}
            editingCell={editingCell}
            onStartEdit={handleStartEdit}
            onSave={handleSaveField}
            onCancel={handleCancelEdit}
          />
        )
      },
    }),

    columnHelper.accessor('tags', {
      header: () => <span className="text-xs">태그</span>,
      size: 200,
      cell: ({ row }) => {
        const img = row.original
        return (
          <EditableTagsCell
            tags={img.tags}
            imageId={img.id}
            field="tags"
            editingCell={editingCell}
            onStartEdit={handleStartEdit}
            onSave={handleSaveField}
            onCancel={handleCancelEdit}
            variant="secondary"
          />
        )
      },
    }),

    columnHelper.accessor('processingStatus', {
      header: () => <span className="text-xs">상태</span>,
      size: 80,
      cell: ({ getValue }) => {
        const status = getValue()
        return (
          <Badge variant={PROCESSING_STATUS_VARIANT[status]}>
            {PROCESSING_STATUS_LABEL[status]}
          </Badge>
        )
      },
    }),

    columnHelper.accessor('isActive', {
      header: () => <span className="text-xs">활성</span>,
      size: 60,
      cell: ({ row }) => {
        const img = row.original
        return (
          <Switch
            checked={img.isActive}
            onCheckedChange={() => handleToggleActive(img.id)}
            disabled={toggleMutation.isPending}
          />
        )
      },
    }),

    columnHelper.display({
      id: 'dimensions',
      header: () => <span className="text-xs">크기</span>,
      size: 100,
      cell: ({ row }) => {
        const img = row.original
        return (
          <span className="text-muted-foreground text-xs">
            {img.width}x{img.height}
          </span>
        )
      },
    }),

    columnHelper.accessor('createdAt', {
      header: () => <span className="text-xs">등록일</span>,
      size: 100,
      cell: ({ getValue }) => (
        <span className="text-muted-foreground text-xs">
          {new Date(getValue()).toLocaleDateString('ko-KR')}
        </span>
      ),
    }),

    columnHelper.display({
      id: 'actions',
      header: () => <span className="text-xs">삭제</span>,
      size: 50,
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive h-7 w-7 p-0"
          onClick={() => setDeleteTarget(row.original)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    }),
  ]

  // --- Table Instance ---

  const table = useReactTable({
    data: images,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  // --- Pagination ---

  const pageNumbers = getPaginationNumbers(currentPage, totalPages)

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="text-muted-foreground absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2" />
          <Input
            value={searchInput}
            onChange={e => handleSearchInput(e.target.value)}
            placeholder="이름, 코드 검색..."
            className="h-9 w-52 pl-8"
          />
        </div>

        <Select value={categoryFilter} onValueChange={handleCategoryFilter}>
          <SelectTrigger className="h-9 w-36">
            <SelectValue placeholder="카테고리" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={activeFilter} onValueChange={handleActiveFilter}>
          <SelectTrigger className="h-9 w-28">
            <SelectValue placeholder="활성 여부" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="active">활성</SelectItem>
            <SelectItem value="inactive">비활성</SelectItem>
          </SelectContent>
        </Select>

        <span className="text-muted-foreground ml-auto text-sm">
          총 {total}개
        </span>

        <Button onClick={() => setUploadModalOpen(true)} className="h-9">
          <Plus className="mr-1.5 h-4 w-4" />
          신규 등록
        </Button>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="bg-muted/50 flex flex-wrap items-center gap-2 rounded-lg border px-4 py-2">
          <span className="text-sm font-medium">
            {selectedIds.size}개 선택됨
          </span>
          <div className="bg-border mx-1 h-4 w-px" />
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5"
            disabled={isBulkPending}
            onClick={() => handleBulkActive(true)}
          >
            <Eye className="h-3.5 w-3.5" />
            활성화
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5"
            disabled={isBulkPending}
            onClick={() => handleBulkActive(false)}
          >
            <EyeOff className="h-3.5 w-3.5" />
            비활성화
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5"
            disabled={isBulkPending}
            onClick={() => {
              setBulkCategoryId('')
              setBulkCategoryOpen(true)
            }}
          >
            <FolderEdit className="h-3.5 w-3.5" />
            카테고리 변경
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive h-8 gap-1.5"
            disabled={isBulkPending}
            onClick={() => setBulkDeleteOpen(true)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            일괄 삭제
          </Button>
          <div className="bg-border mx-1 h-4 w-px" />
          <Button
            variant="ghost"
            size="sm"
            className="h-8"
            onClick={clearSelection}
          >
            선택 해제
          </Button>
        </div>
      )}

      {/* Data Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
            </div>
          ) : isError ? (
            <div className="text-destructive py-12 text-center text-sm">
              상품 목록을 불러오는 데 실패했습니다.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="table-fixed" style={{ minWidth: 1200 }}>
                <TableHeader>
                  {table.getHeaderGroups().map(headerGroup => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map(header => (
                        <TableHead
                          key={header.id}
                          style={{ width: header.getSize() }}
                          className="whitespace-nowrap px-2"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="text-muted-foreground py-12 text-center text-sm"
                      >
                        표시할 상품이 없습니다.
                      </TableCell>
                    </TableRow>
                  ) : (
                    table.getRowModel().rows.map(row => (
                      <TableRow
                        key={row.id}
                        className={
                          !row.original.isActive
                            ? 'bg-muted/30 opacity-60'
                            : undefined
                        }
                      >
                        {row.getVisibleCells().map(cell => (
                          <TableCell
                            key={cell.id}
                            className="overflow-hidden px-2 py-2"
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
          >
            이전
          </Button>
          {pageNumbers.map((page, idx) =>
            page === null ? (
              <span
                key={`ellipsis-${idx}`}
                className="text-muted-foreground px-1 text-sm"
              >
                ...
              </span>
            ) : (
              <Button
                key={page}
                variant={currentPage === page ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            )
          )}
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
          >
            다음
          </Button>
        </div>
      )}

      {/* Upload Modal */}
      <ProductUploadModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        categories={categories}
      />

      {/* Edit Modal */}
      <ProductEditModal
        open={editTarget !== null}
        onOpenChange={open => {
          if (!open) setEditTarget(null)
        }}
        image={editTarget}
        categories={categories}
      />

      {/* Delete Confirmation */}
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={open => {
          if (!open) setDeleteTarget(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>상품을 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deleteTarget?.name}</strong> 상품이 비활성화됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? '삭제 중...' : '삭제'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation */}
      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedIds.size}개 상품을 일괄 삭제하시겠습니까?
            </AlertDialogTitle>
            <AlertDialogDescription>
              선택된 상품들이 비활성화됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={bulkDeleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {bulkDeleteMutation.isPending ? '삭제 중...' : '일괄 삭제'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Category Change */}
      <AlertDialog open={bulkCategoryOpen} onOpenChange={setBulkCategoryOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedIds.size}개 상품의 카테고리를 변경합니다
            </AlertDialogTitle>
            <AlertDialogDescription>
              선택된 상품들의 카테고리가 일괄 변경됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Select value={bulkCategoryId} onValueChange={setBulkCategoryId}>
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
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkCategoryConfirm}
              disabled={!bulkCategoryId || bulkCategoryMutation.isPending}
            >
              {bulkCategoryMutation.isPending ? '변경 중...' : '변경'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// --- Helpers ---

function getPaginationNumbers(
  currentPage: number,
  totalPages: number
): (number | null)[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const pages: (number | null)[] = []

  if (currentPage <= 3) {
    pages.push(1, 2, 3, 4, null, totalPages)
  } else if (currentPage >= totalPages - 2) {
    pages.push(
      1,
      null,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages
    )
  } else {
    pages.push(
      1,
      null,
      currentPage - 1,
      currentPage,
      currentPage + 1,
      null,
      totalPages
    )
  }

  return pages
}
