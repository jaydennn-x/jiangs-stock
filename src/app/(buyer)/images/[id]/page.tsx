import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'

import { dummyImages } from '@/lib/dummy/images'
import { dummyOrders } from '@/lib/dummy/orders'
import { ProtectedImage } from '@/components/common/protected-image'
import { ImageCard } from '@/components/common/image-card'
import { MetadataSection } from '@/components/image-detail/metadata-section'
import { PurchasePanel } from '@/components/image-detail/purchase-panel'
import type { Orientation } from '@/types/enums'

// TODO: 실제 인증 구현 후 세션에서 userId를 가져오도록 교체
const DEMO_USER_ID = 'user-001'
const RELATED_IMAGES_LIMIT = 8

const ASPECT_MAP: Record<Orientation, string> = {
  LANDSCAPE: 'aspect-[4/3]',
  PORTRAIT: 'aspect-[3/4]',
  SQUARE: 'aspect-square',
}

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const image = dummyImages.find(img => img.id === id)
  if (!image) return { title: '이미지를 찾을 수 없습니다 | JiangsStock' }
  return { title: `${image.name} | JiangsStock` }
}

export default async function ImageDetailPage({ params }: Props) {
  const { id } = await params
  const image = dummyImages.find(img => img.id === id)
  if (!image) notFound()

  const isPurchased = dummyOrders.some(
    o =>
      o.userId === DEMO_USER_ID &&
      o.status === 'COMPLETED' &&
      o.items.some(i => i.imageId === id)
  )

  const relatedImages = dummyImages
    .filter(
      img =>
        img.categoryId === image.categoryId &&
        img.id !== id &&
        img.isActive
    )
    .slice(0, RELATED_IMAGES_LIMIT)

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-10 md:px-8">
      {/* 2컬럼 메인 레이아웃 */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
        {/* 좌측: 프리뷰 + 메타데이터 + 태그 */}
        <div className="space-y-8">
          {/* 워터마크 프리뷰 */}
          <div
            className={`${ASPECT_MAP[image.orientation]} relative w-full overflow-hidden rounded-lg bg-gray-100`}
          >
            <ProtectedImage
              src={image.watermarkUrl}
              alt={image.name}
              fill
              sizes="(max-width: 1024px) 100vw, calc(100vw - 420px)"
              className="object-cover"
            />
          </div>

          {/* 메타데이터 (구매자 전용) */}
          <MetadataSection image={image} isPurchased={isPurchased} />

          {/* 태그 목록 */}
          {image.tags.length > 0 && (
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                태그
              </p>
              <div className="flex flex-wrap gap-2">
                {image.tags.map(tag => (
                  <Link
                    key={tag}
                    href={`/search?q=${encodeURIComponent(tag)}`}
                    className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600 transition-colors hover:bg-gray-200"
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
          <h2 className="mb-6 text-lg font-semibold text-gray-900">
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
