import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { ProtectedImage } from '@/components/common/protected-image'
import { ImageCard } from '@/components/common/image-card'
import { MetadataSection } from '@/components/image-detail/metadata-section'
import { PurchasePanel } from '@/components/image-detail/purchase-panel'
import type { Image } from '@/types/models'
import type { Orientation } from '@/types/enums'

const RELATED_IMAGES_LIMIT = 8

const ASPECT_MAP: Record<Orientation, string> = {
  LANDSCAPE: 'aspect-[16/9]',
  PORTRAIT: 'aspect-[3/4]',
  SQUARE: 'aspect-square',
}

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const image = await prisma.image.findFirst({
    where: { id, isActive: true, processingStatus: 'COMPLETED' },
    select: { name: true },
  })
  if (!image) return { title: '이미지를 찾을 수 없습니다 | JiangsStock' }
  return { title: `${image.name} | JiangsStock` }
}

export default async function ImageDetailPage({ params }: Props) {
  const { id } = await params

  const session = await auth()

  const rawImage = await prisma.image.findFirst({
    where: { id, isActive: true, processingStatus: 'COMPLETED' },
    include: { category: true },
  })

  if (!rawImage) notFound()

  const image: Image = {
    ...rawImage,
    description: rawImage.description ?? undefined,
    shootDate: rawImage.shootDate ?? undefined,
    basePrice: Number(rawImage.basePrice),
    sizesJson: rawImage.sizesJson as unknown as Image['sizesJson'],
    fileSizesJson: rawImage.fileSizesJson as unknown as Image['fileSizesJson'],
  }

  let isPurchased = false
  if (session?.user?.id) {
    const orderItem = await prisma.orderItem.findFirst({
      where: {
        imageId: id,
        order: { userId: session.user.id, status: 'COMPLETED' },
      },
      include: { order: true },
    })
    isPurchased = !!orderItem
  }

  const rawRelated = await prisma.image.findMany({
    where: {
      categoryId: rawImage.categoryId,
      id: { not: id },
      isActive: true,
      processingStatus: 'COMPLETED',
    },
    orderBy: { salesCount: 'desc' },
    take: RELATED_IMAGES_LIMIT,
  })

  const relatedImages: Image[] = rawRelated.map(img => ({
    ...img,
    description: img.description ?? undefined,
    shootDate: img.shootDate ?? undefined,
    basePrice: Number(img.basePrice),
    sizesJson: img.sizesJson as unknown as Image['sizesJson'],
    fileSizesJson: img.fileSizesJson as unknown as Image['fileSizesJson'],
  }))

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-10 md:px-8">
      {/* 2컬럼 메인 레이아웃 */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
        {/* 좌측: 프리뷰 + 메타데이터 + 태그 */}
        <div className="space-y-8">
          {/* 워터마크 프리뷰 (블러 백그라운드) */}
          <div
            className={`${ASPECT_MAP[image.orientation]} relative w-full overflow-hidden rounded-lg`}
          >
            {/* 블러 배경: 같은 이미지를 확대+블러 처리 */}
            <ProtectedImage
              src={`/api/images/preview/${id}`}
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, calc(100vw - 420px)"
              quality={30}
              className="object-cover scale-110 blur-2xl brightness-75"
            />
            {/* 실제 이미지: 잘리지 않게 contain */}
            <ProtectedImage
              src={`/api/images/preview/${id}`}
              alt={image.name}
              fill
              sizes="(max-width: 1024px) 100vw, calc(100vw - 420px)"
              quality={100}
              className="object-contain relative z-10"
            />
          </div>

          {/* 메타데이터 (구매자 전용) */}
          <MetadataSection image={image} isPurchased={isPurchased} />

          {/* 태그 목록 */}
          {image.tags.length > 0 && (
            <div>
              <p className="mb-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                태그
              </p>
              <div className="flex flex-wrap gap-2">
                {image.tags.map(tag => (
                  <Link
                    key={tag}
                    href={`/search?q=${encodeURIComponent(tag)}`}
                    className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 우측: 구매 옵션 패널 */}
        <PurchasePanel image={image} />
      </div>

      {/* 관련 이미지 갤러리 */}
      {relatedImages.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-lg font-semibold text-gray-900 dark:text-gray-100">
            관련 이미지
          </h2>
          <div className="columns-2 gap-2 md:columns-3 lg:columns-4">
            {relatedImages.map(img => (
              <div key={img.id} className="mb-2 break-inside-avoid">
                <ImageCard image={img} showWishlist={false} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
