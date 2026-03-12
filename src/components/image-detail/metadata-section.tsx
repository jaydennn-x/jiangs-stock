import { Lock } from 'lucide-react'

import type { Image } from '@/types/models'
import type { ImageSize } from '@/types/enums'

const SIZES: ImageSize[] = ['XL', 'L', 'M', 'S']

const PLACEHOLDER_ROWS = [
  { label: '이미지 코드', value: 'JS-XXXX' },
  { label: '해상도', value: '0000 × 0000' },
  { label: '포맷', value: '----' },
  { label: '촬영 연월', value: '----' },
]

function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  return Math.round(bytes / 1024) + ' KB'
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <dt className="text-gray-500">{label}</dt>
      <dd className="font-medium text-gray-900">{value}</dd>
    </div>
  )
}

interface MetadataSectionProps {
  image: Image
  isPurchased: boolean
}

export function MetadataSection({ image, isPurchased }: MetadataSectionProps) {
  if (!isPurchased) {
    return (
      <div className="relative overflow-hidden rounded-lg border border-gray-200 p-5">
        {/* 블러 처리된 더미 플레이스홀더 — 실제 데이터 미포함 */}
        <div className="pointer-events-none space-y-3 blur-sm select-none">
          <p className="text-sm font-semibold text-gray-900">이미지 정보</p>
          <div className="divide-y divide-gray-100">
            {PLACEHOLDER_ROWS.map(row => (
              <MetaRow key={row.label} label={row.label} value={row.value} />
            ))}
          </div>
          <div className="grid grid-cols-4 gap-2 pt-1">
            {SIZES.map(s => (
              <div key={s} className="rounded-md bg-gray-50 p-2 text-center">
                <div className="text-xs font-semibold text-gray-700">{s}</div>
                <div className="mt-0.5 text-xs text-gray-500">-- MB</div>
              </div>
            ))}
          </div>
        </div>

        {/* 잠금 오버레이 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/85">
          <Lock className="mb-2 h-7 w-7 text-gray-400" />
          <p className="text-sm font-semibold text-gray-700">
            구매 후 확인 가능
          </p>
          <p className="mt-1 text-center text-xs text-gray-500">
            이 이미지를 구매하면 상세 정보를 확인할 수 있습니다
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5 rounded-lg border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-900">이미지 정보</h3>

      {/* 기본 메타데이터 */}
      <dl className="divide-y divide-gray-100">
        <MetaRow label="이미지 코드" value={image.code} />
        <MetaRow label="해상도" value={`${image.width} × ${image.height}`} />
        <MetaRow label="포맷" value={image.format.toUpperCase()} />
        {image.shootDate && (
          <MetaRow label="촬영 연월" value={image.shootDate} />
        )}
      </dl>

      {/* 크기별 파일 크기 */}
      <div>
        <p className="mb-2 text-xs font-medium text-gray-500">파일 크기</p>
        <div className="grid grid-cols-4 gap-2">
          {SIZES.map(s => (
            <div key={s} className="rounded-md bg-gray-50 p-2 text-center">
              <div className="text-xs font-semibold text-gray-700">{s}</div>
              <div className="mt-0.5 text-xs text-gray-500">
                {formatFileSize(image.fileSizesJson[s])}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 색상 태그 */}
      {image.colorTags.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium text-gray-500">색상 태그</p>
          <div className="flex flex-wrap gap-1.5">
            {image.colorTags.map(tag => (
              <span
                key={tag}
                className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
