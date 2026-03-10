# Task 004: 더미 데이터, 클라이언트 상태 관리, 공통 UI 컴포넌트 구현

## 상태: 완료

## 설명

Phase 2 첫 번째 작업. 모든 페이지 UI를 더미 데이터로 완성하여 전체 사용자 플로우를 체험할 수 있도록 하는 기반을 구축합니다.

- 더미 데이터 모듈: 이미지 30건, 카테고리 6종, 주문 5건, 사용자 3명
- Zustand 5.x 장바구니 스토어 (localStorage persist)
- 가격 계산 유틸리티
- TanStack Query v5 QueryClient Provider
- 공통 UI 컴포넌트: ImageCard, ImageGrid, PriceDisplay, SizeSelector, LicenseSelector, ProtectedImage
- 검색 컴포넌트: SearchInput, FilterSidebar, SortDropdown
- 상태 표시 컴포넌트: EmptyState, LoadingSkeleton, ErrorMessage, StatusBadge

## 관련 파일

- `src/lib/dummy/categories.ts` - 카테고리 6종 더미 데이터
- `src/lib/dummy/images.ts` - 이미지 30건 더미 데이터
- `src/lib/dummy/users.ts` - 사용자 3명 더미 데이터
- `src/lib/dummy/orders.ts` - 주문 5건 + OrderItem 더미 데이터
- `src/lib/dummy/index.ts` - 더미 데이터 re-export
- `src/lib/price.ts` - 가격 계산 및 포맷 유틸리티
- `src/stores/cart-store.ts` - Zustand 장바구니 스토어
- `src/components/providers/query-provider.tsx` - TanStack Query Provider
- `src/components/common/protected-image.tsx` - 이미지 보호 컴포넌트
- `src/components/common/price-display.tsx` - 가격 표시 컴포넌트
- `src/components/common/size-selector.tsx` - 크기 선택 컴포넌트
- `src/components/common/license-selector.tsx` - 라이선스 선택 컴포넌트
- `src/components/common/image-card.tsx` - 이미지 카드 컴포넌트
- `src/components/common/image-grid.tsx` - 이미지 그리드(Masonry) 컴포넌트
- `src/components/common/empty-state.tsx` - 빈 상태 컴포넌트
- `src/components/common/loading-skeleton.tsx` - 로딩 스켈레톤 컴포넌트
- `src/components/common/error-message.tsx` - 에러 메시지 컴포넌트
- `src/components/common/status-badge.tsx` - 처리 상태 배지 컴포넌트
- `src/components/search/search-input.tsx` - 검색 입력 컴포넌트
- `src/components/search/filter-sidebar.tsx` - 필터 사이드바 컴포넌트
- `src/components/search/sort-dropdown.tsx` - 정렬 드롭다운 컴포넌트
- `src/app/layout.tsx` - QueryProvider 통합
- `next.config.ts` - picsum.photos 이미지 도메인 허용
- `.prettierignore` - shrimp_data 디렉토리 제외 추가

## 수락 기준

- [x] 더미 데이터: dummyImages 30건, dummyCategories 6종, dummyUsers 3명, dummyOrders 5건
- [x] Zustand 장바구니 스토어 동작 (추가/삭제/옵션변경/localStorage persist)
- [x] 가격 계산 정확성: calculatePrice(10000, 'L', 'STANDARD') === 4500
- [x] TanStack Query Provider 루트 레이아웃에 통합
- [x] 공통 컴포넌트 전체 구현 및 TypeScript 타입 에러 없음
- [x] 검색/상태 표시 컴포넌트 전체 구현
- [x] `npm run check-all` 통과

## 구현 단계

### 1단계: 패키지 설치 및 작업 파일 생성

- [x] `zustand`, `@tanstack/react-query` 설치
- [x] `tasks/004-dummy-data-state-components.md` 작업 파일 생성
- [x] `docs/ROADMAP.md` Task 004 진행 중 표시

### 2단계: 더미 데이터 모듈 구현

- [x] `src/lib/dummy/categories.ts` 생성 (6종)
- [x] `src/lib/dummy/images.ts` 생성 (30건)
- [x] `src/lib/dummy/users.ts` 생성 (3명)
- [x] `src/lib/dummy/orders.ts` 생성 (5건 + OrderItem)
- [x] `src/lib/dummy/index.ts` 생성 (re-export)

### 3단계: 가격 계산 유틸리티 및 Zustand 스토어

- [x] `src/lib/price.ts` 생성 (calculatePrice, formatPrice, getSizeLabel, getSizeResolution)
- [x] `src/stores/cart-store.ts` 생성 (Zustand + persist 미들웨어)

### 4단계: TanStack Query Provider 설정

- [x] `src/components/providers/query-provider.tsx` 생성
- [x] `src/app/layout.tsx` QueryProvider 통합

### 5단계: 공통 UI 컴포넌트 구현

- [x] `src/components/common/protected-image.tsx` 생성
- [x] `src/components/common/price-display.tsx` 생성
- [x] `src/components/common/size-selector.tsx` 생성
- [x] `src/components/common/license-selector.tsx` 생성
- [x] `src/components/common/image-card.tsx` 생성
- [x] `src/components/common/image-grid.tsx` 생성
- [x] `next.config.ts` picsum.photos 도메인 추가

### 6단계: 검색/상태 표시 컴포넌트 구현

- [x] `src/components/search/search-input.tsx` 생성
- [x] `src/components/search/filter-sidebar.tsx` 생성
- [x] `src/components/search/sort-dropdown.tsx` 생성
- [x] `src/components/common/empty-state.tsx` 생성
- [x] `src/components/common/loading-skeleton.tsx` 생성
- [x] `src/components/common/error-message.tsx` 생성
- [x] `src/components/common/status-badge.tsx` 생성

### 7단계: 최종 검증 및 완료 처리

- [x] `npm run check-all` 통과
- [x] `tasks/004-dummy-data-state-components.md` 완료 처리
- [x] `docs/ROADMAP.md` Task 004 완료 표시

## 변경 사항 요약

| 파일 | 변경 |
| ---- | ---- |
| `package.json` | zustand ^5.0.11, @tanstack/react-query ^5.90.21 추가 |
| `next.config.ts` | picsum.photos remotePatterns 추가 |
| `.prettierignore` | shrimp_data/ 제외 추가 |
| `src/app/layout.tsx` | QueryProvider 통합 |
| `src/lib/dummy/categories.ts` | 신규 생성 - 카테고리 6종 |
| `src/lib/dummy/images.ts` | 신규 생성 - 이미지 30건 |
| `src/lib/dummy/users.ts` | 신규 생성 - 사용자 3명 |
| `src/lib/dummy/orders.ts` | 신규 생성 - 주문 5건 + OrderItem |
| `src/lib/dummy/index.ts` | 신규 생성 - re-export |
| `src/lib/price.ts` | 신규 생성 - 가격 계산 유틸리티 |
| `src/stores/cart-store.ts` | 신규 생성 - Zustand 장바구니 스토어 |
| `src/components/providers/query-provider.tsx` | 신규 생성 - TanStack Query Provider |
| `src/components/common/protected-image.tsx` | 신규 생성 |
| `src/components/common/price-display.tsx` | 신규 생성 |
| `src/components/common/size-selector.tsx` | 신규 생성 |
| `src/components/common/license-selector.tsx` | 신규 생성 |
| `src/components/common/image-card.tsx` | 신규 생성 |
| `src/components/common/image-grid.tsx` | 신규 생성 |
| `src/components/common/empty-state.tsx` | 신규 생성 |
| `src/components/common/loading-skeleton.tsx` | 신규 생성 |
| `src/components/common/error-message.tsx` | 신규 생성 |
| `src/components/common/status-badge.tsx` | 신규 생성 |
| `src/components/search/search-input.tsx` | 신규 생성 |
| `src/components/search/filter-sidebar.tsx` | 신규 생성 |
| `src/components/search/sort-dropdown.tsx` | 신규 생성 |
