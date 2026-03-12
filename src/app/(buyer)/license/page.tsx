import { Metadata } from 'next'
import { CheckCircle2, XCircle } from 'lucide-react'

import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export const metadata: Metadata = {
  title: '라이선스 안내 | JiangsStock',
}

const LICENSE_ROWS = [
  { feature: '웹사이트 / 블로그 사용', standard: true, extended: true },
  {
    feature: 'SNS 게시 (인스타그램, 페이스북 등)',
    standard: true,
    extended: true,
  },
  {
    feature: '인쇄물 (브로슈어, 포스터, 명함)',
    standard: true,
    extended: true,
  },
  { feature: '온라인 광고 (배너, 디스플레이)', standard: true, extended: true },
  {
    feature: '오프라인 광고 (옥외 광고, 현수막)',
    standard: false,
    extended: true,
  },
  {
    feature: '상업적 이용 (제품 홍보, 영리 목적)',
    standard: true,
    extended: true,
  },
  {
    feature: '최대 인쇄 부수',
    standard: false,
    extended: true,
    note: '스탠다드 500부 한도',
  },
  { feature: '무제한 복제 및 배포', standard: false, extended: true },
  { feature: '제품 재판매 (머천다이징, POD)', standard: false, extended: true },
  { feature: '방송 / 영상 콘텐츠 사용', standard: false, extended: true },
  { feature: '전자책 / 잡지 표지', standard: false, extended: true },
]

const SIZE_ROWS = [
  {
    size: 'XL',
    resolution: '최대 해상도 (원본 비율)',
    usage: '인쇄, 대형 출력물',
    ratio: '100%',
  },
  {
    size: 'L',
    resolution: '원본의 약 75%',
    usage: '웹 배너, A4 인쇄',
    ratio: '45%',
  },
  {
    size: 'M',
    resolution: '원본의 약 50%',
    usage: '웹 콘텐츠, SNS',
    ratio: '20%',
  },
  {
    size: 'S',
    resolution: '원본의 약 25%',
    usage: '썸네일, 아이콘',
    ratio: '7%',
  },
]

function Check() {
  return <CheckCircle2 className="mx-auto h-5 w-5 text-green-500" />
}

function X() {
  return <XCircle className="mx-auto h-5 w-5 text-red-400" />
}

export default function LicensePage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-bold">라이선스 안내</h1>
      <p className="text-muted-foreground mt-2 text-sm">
        최종 수정일: 2026년 1월 1일
      </p>

      <Separator className="my-6" />

      <p className="text-muted-foreground mb-8 leading-relaxed">
        JiangsStock의 모든 이미지는{' '}
        <strong className="text-foreground">스탠다드</strong> 또는{' '}
        <strong className="text-foreground">확장</strong> 라이선스로 제공됩니다.
        구매 시 선택한 라이선스 유형에 따라 이미지 사용 범위가 달라집니다. 아래
        비교표를 참고하여 적합한 라이선스를 선택하세요.
      </p>

      {/* 라이선스 비교 테이블 */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold">라이선스 유형 비교</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/2">허용 항목</TableHead>
              <TableHead className="w-1/4 text-center">스탠다드</TableHead>
              <TableHead className="w-1/4 text-center">확장</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {LICENSE_ROWS.map(row => (
              <TableRow key={row.feature}>
                <TableCell className="whitespace-normal">
                  {row.feature}
                  {row.note && (
                    <span className="text-muted-foreground ml-1 text-xs">
                      ({row.note})
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {row.standard ? <Check /> : <X />}
                </TableCell>
                <TableCell className="text-center">
                  {row.extended ? <Check /> : <X />}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <p className="text-muted-foreground mt-3 text-xs">
          * 스탠다드 라이선스 인쇄물은 500부까지 허용됩니다. 500부 초과 시 확장
          라이선스가 필요합니다.
        </p>
      </section>

      <Separator className="my-8" />

      {/* 이미지 크기 및 해상도 */}
      <section className="mb-10">
        <h2 className="mb-2 text-xl font-semibold">이미지 크기 및 해상도</h2>
        <p className="text-muted-foreground mb-4 text-sm">
          각 크기는 동일한 이미지의 다른 해상도 버전입니다. 기준 가격(XL)에서
          크기별 비율이 적용됩니다.
        </p>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>크기</TableHead>
              <TableHead>해상도</TableHead>
              <TableHead>주요 용도</TableHead>
              <TableHead className="text-right">가격 비율</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {SIZE_ROWS.map(row => (
              <TableRow key={row.size}>
                <TableCell className="font-semibold">{row.size}</TableCell>
                <TableCell className="text-muted-foreground">
                  {row.resolution}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {row.usage}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {row.ratio}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <p className="text-muted-foreground mt-3 text-xs">
          * 가격 비율은 XL 기준입니다. 라이선스 유형(스탠다드/확장)에 따라 추가
          배율이 적용됩니다.
        </p>
      </section>

      <Separator className="my-8" />

      {/* 공통 제한 사항 */}
      <section className="mb-10">
        <h2 className="mb-3 text-xl font-semibold">공통 제한 사항</h2>
        <ul className="text-muted-foreground list-inside list-disc space-y-2 leading-relaxed">
          <li>구매한 이미지를 제3자에게 재판매하거나 재배포할 수 없습니다.</li>
          <li>
            이미지에서 워터마크, 저작권 표시, 크레딧을 제거할 수 없습니다.
          </li>
          <li>음란물, 혐오 표현, 불법 콘텐츠에 사용할 수 없습니다.</li>
          <li>
            특정 개인을 비방하거나 명예를 훼손하는 용도로 사용할 수 없습니다.
          </li>
          <li>라이선스는 구매자 본인에게만 유효하며 양도할 수 없습니다.</li>
        </ul>
      </section>

      <Separator className="mt-10" />
      <p className="text-muted-foreground mt-4 text-sm">
        라이선스 관련 문의는{' '}
        <span className="font-medium">support@jiangsstock.com</span>으로
        연락해주세요.
      </p>
    </div>
  )
}
