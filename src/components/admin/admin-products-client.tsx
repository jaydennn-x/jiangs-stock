'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
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
import { ProductUploadModal } from '@/components/admin/product-upload-modal'
import { ProductEditModal } from '@/components/admin/product-edit-modal'
import type { Image as ImageType, Category } from '@/types/models'
import type { ProcessingStatus } from '@/types/enums'

interface AdminProductsClientProps {
  images: ImageType[]
  categories: Category[]
}

const ITEMS_PER_PAGE = 10

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

export function AdminProductsClient({
  images,
  categories,
}: AdminProductsClientProps) {
  const [localImages, setLocalImages] = useState<ImageType[]>(() => [...images])
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [activeFilter, setActiveFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<ImageType | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ImageType | null>(null)

  const filtered = localImages.filter(img => {
    const categoryMatch =
      categoryFilter === 'all' || img.categoryId === categoryFilter
    const activeMatch =
      activeFilter === 'all' ||
      (activeFilter === 'active' && img.isActive) ||
      (activeFilter === 'inactive' && !img.isActive)
    return categoryMatch && activeMatch
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  function handleCategoryFilter(value: string) {
    setCategoryFilter(value)
    setCurrentPage(1)
  }

  function handleActiveFilter(value: string) {
    setActiveFilter(value)
    setCurrentPage(1)
  }

  function handleToggleActive(imageId: string, checked: boolean) {
    setLocalImages(prev =>
      prev.map(img =>
        img.id === imageId ? { ...img, isActive: checked } : img
      )
    )
  }

  function handleEditClick(image: ImageType) {
    setEditTarget(image)
    setEditModalOpen(true)
  }

  function handleDeleteClick(image: ImageType) {
    setDeleteTarget(image)
  }

  function handleDeleteConfirm() {
    if (deleteTarget) {
      setLocalImages(prev => prev.filter(img => img.id !== deleteTarget.id))
      setDeleteTarget(null)
      if (paginated.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1)
      }
    }
  }

  function getCategoryName(categoryId: string) {
    return categories.find(c => c.id === categoryId)?.name ?? '-'
  }

  const pageNumbers = getPaginationNumbers(currentPage, totalPages)

  return (
    <div className="space-y-4">
      {/* 필터 + 신규 등록 버튼 */}
      <div className="flex flex-wrap items-center gap-2">
        <Select value={categoryFilter} onValueChange={handleCategoryFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="카테고리" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 카테고리</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={activeFilter} onValueChange={handleActiveFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="활성화 여부" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="active">활성</SelectItem>
            <SelectItem value="inactive">비활성</SelectItem>
          </SelectContent>
        </Select>

        <span className="text-muted-foreground ml-auto text-sm">
          총 {filtered.length}개
        </span>

        <Button onClick={() => setUploadModalOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" />
          신규 등록
        </Button>
      </div>

      {/* 상품 목록 테이블 */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14">썸네일</TableHead>
                <TableHead>이름 / 코드</TableHead>
                <TableHead>카테고리</TableHead>
                <TableHead className="text-right">기준 가격</TableHead>
                <TableHead>등록일</TableHead>
                <TableHead>처리 상태</TableHead>
                <TableHead>활성화</TableHead>
                <TableHead className="text-right">액션</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-muted-foreground py-12 text-center text-sm"
                  >
                    표시할 상품이 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map(img => (
                  <TableRow key={img.id}>
                    {/* 썸네일 */}
                    <TableCell>
                      <div className="relative h-10 w-10 overflow-hidden rounded">
                        <Image
                          src={img.thumbnailUrl}
                          alt={img.name}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      </div>
                    </TableCell>

                    {/* 이름 / 코드 */}
                    <TableCell>
                      <p className="max-w-[180px] truncate text-sm font-medium">
                        {img.name}
                      </p>
                      <p className="text-muted-foreground font-mono text-xs">
                        {img.code}
                      </p>
                    </TableCell>

                    {/* 카테고리 */}
                    <TableCell className="text-muted-foreground text-sm">
                      {getCategoryName(img.categoryId)}
                    </TableCell>

                    {/* 기준 가격 */}
                    <TableCell className="text-right text-sm font-medium">
                      {img.basePrice.toLocaleString('ko-KR')}원
                    </TableCell>

                    {/* 등록일 */}
                    <TableCell className="text-muted-foreground text-sm">
                      {img.createdAt.toLocaleDateString('ko-KR')}
                    </TableCell>

                    {/* 처리 상태 배지 */}
                    <TableCell>
                      <Badge
                        variant={
                          PROCESSING_STATUS_VARIANT[img.processingStatus]
                        }
                      >
                        {PROCESSING_STATUS_LABEL[img.processingStatus]}
                      </Badge>
                    </TableCell>

                    {/* 활성화 토글 */}
                    <TableCell>
                      <Switch
                        checked={img.isActive}
                        onCheckedChange={checked =>
                          handleToggleActive(img.id, checked)
                        }
                      />
                    </TableCell>

                    {/* 액션 버튼 */}
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditClick(img)}
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">수정</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteClick(img)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">삭제</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 페이지네이션 */}
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
                …
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

      {/* 신규 등록 모달 */}
      <ProductUploadModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        categories={categories}
      />

      {/* 수정 모달 */}
      <ProductEditModal
        key={editTarget?.id}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        image={editTarget}
        categories={categories}
      />

      {/* 삭제 확인 AlertDialog */}
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
              <strong>{deleteTarget?.name}</strong> 상품이 소프트 삭제됩니다.
              삭제 후 복구할 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

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
