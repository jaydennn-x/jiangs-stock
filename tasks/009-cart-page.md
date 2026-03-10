# Task 009: 장바구니 페이지 UI 구현

## 상태: 완료

## 설명

Zustand CartStore와 더미 데이터를 활용하여 장바구니 페이지 UI를 완성한다.
아이템 목록, 인라인 옵션 변경, 삭제 확인 다이얼로그, 주문 요약 패널로 구성된다.

## 관련 파일

- `src/app/(buyer)/cart/page.tsx` — 장바구니 페이지 (전면 구현 대상, 현재 빈 껍데기)
- `src/components/cart/cart-item-row.tsx` — 새 파일: 개별 아이템 행 컴포넌트
- `src/components/cart/cart-summary.tsx` — 새 파일: 주문 요약 / 결제 버튼 패널
- `src/stores/cart-store.ts` — CartStore (items, removeItem, updateItem, totalAmount)
- `src/lib/dummy/images.ts` — basePrice 조회용 더미 이미지 데이터
- `src/components/common/empty-state.tsx` — 빈 장바구니 상태 재사용
- `src/components/image-detail/purchase-panel.tsx` — useCartStore 사용 패턴 레퍼런스
- `src/lib/price.ts` — formatPrice, calculatePrice, getSizeLabel, getSizeResolution

## 수락 기준

- [x] 장바구니 아이템 목록이 썸네일, 이미지명, 크기/라이선스, 개별 가격과 함께 표시된다
- [x] 크기/라이선스 인라인 드롭다운으로 옵션 변경 시 가격이 즉시 재계산된다
- [x] 삭제 버튼 클릭 시 확인 다이얼로그가 표시되고, 확인 후 아이템이 제거된다
- [x] 총 결제 금액이 실시간으로 계산되어 표시된다
- [x] "쇼핑 계속하기" 링크가 검색 페이지로 이동한다
- [x] "결제하기" 버튼이 `/checkout`으로 이동한다
- [x] 빈 장바구니 상태에서 EmptyState 컴포넌트와 검색 페이지 링크가 표시된다
- [x] 모바일/데스크톱 반응형 레이아웃이 적용된다
- [x] TypeScript 타입 에러가 없다
- [x] ESLint/Prettier 검사를 통과한다

## 구현 단계

### 1단계: CartItemRow 컴포넌트 구현

- [x] `src/components/cart/` 디렉토리 생성
- [x] `cart-item-row.tsx` 파일 생성
- [x] 아이템 행 레이아웃: 썸네일(좌) + 정보/드롭다운(중) + 가격/삭제(우)
- [x] shadcn `Select`로 크기 드롭다운 (XL/L/M/S) 구현
- [x] shadcn `Select`로 라이선스 드롭다운 (스탠다드/확장) 구현
- [x] 옵션 변경 시 `dummyImages`에서 basePrice 조회 후 `updateItem` 호출
- [x] shadcn `Dialog`로 삭제 확인 다이얼로그 구현 (`Trash2` 아이콘 버튼)

### 2단계: CartSummary 컴포넌트 구현

- [x] `cart-summary.tsx` 파일 생성
- [x] 주문 요약 헤더 + 아이템별 요약 라인 (이미지명 + 가격)
- [x] Separator 구분선
- [x] 총 결제 금액 (formatPrice 적용, bold 강조)
- [x] "결제하기" 버튼 (→ `/checkout`, full-width)
- [x] "쇼핑 계속하기" 텍스트 링크 (→ `/search`)

### 3단계: 장바구니 페이지 구현

- [x] `cart/page.tsx` 전면 교체 (`'use client'`, metadata export 제거)
- [x] Hydration 안전 처리: `useSyncExternalStore`로 SSR/CSR 분기 처리
- [x] 빈 장바구니 분기: `items.length === 0` → `EmptyState` 표시
- [x] 아이템 있을 때: 2컬럼 레이아웃 (`lg:grid-cols-[1fr_340px]`)
- [x] 페이지 헤더: "장바구니 (N건)"

## 구현 참고사항

### 레이아웃 구조

```
<div class="container mx-auto px-4 py-8">
  <h1>장바구니 (N건)</h1>
  <div class="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
    <!-- 좌측: 아이템 목록 -->
    <div class="divide-y">
      {items.map(item => <CartItemRow />)}
    </div>
    <!-- 우측: 주문 요약 (sticky top-8) -->
    <CartSummary />
  </div>
</div>
```

### basePrice 조회 방법

```typescript
import { dummyImages } from '@/lib/dummy/images'

const basePrice = dummyImages.find(i => i.id === item.imageId)?.basePrice ?? item.price
updateItem(item.id, newSize, newLicenseType, basePrice)
```

### Hydration 처리

```typescript
const [mounted, setMounted] = useState(false)
useEffect(() => setMounted(true), [])
if (!mounted) return null  // 또는 스켈레톤 UI
```

## 변경 사항 요약

> 작업 완료 후 이 섹션에 실제 변경된 파일과 내용을 기록합니다.
