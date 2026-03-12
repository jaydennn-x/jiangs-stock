# Task 022: 이미지 상세 조회 및 관련 이미지 API 구현 (F002, F003)

## 상태: 완료

## 설명

이미지 상세 조회 API와 관련 이미지 API를 구현하고, TanStack Query 훅을 생성하여 이미지 상세 페이지의 더미 데이터를 실제 PostgreSQL DB 연동으로 교체한다.

## 관련 파일

- `src/app/api/images/[imageId]/route.ts` - GET 이미지 상세 조회 API
- `src/app/api/images/[imageId]/related/route.ts` - GET 관련 이미지 API
- `src/lib/hooks/use-image-detail.ts` - useImageDetail, useRelatedImages TanStack Query 훅
- `src/types/api.ts` - ImageDetailResponse에 isPurchased 추가
- `src/app/(buyer)/images/[id]/page.tsx` - 더미 데이터 제거, Prisma 직접 쿼리

## 수락 기준

- [x] GET /api/images/[imageId] 가 이미지 상세 정보 + priceOptions(8개) + isPurchased를 반환한다
- [x] GET /api/images/[imageId]/related 가 관련 이미지 최대 8건을 반환한다
- [x] isActive=true, processingStatus=COMPLETED 필터가 적용된다
- [x] 비로그인 시 isPurchased: false, 구매 완료 사용자는 isPurchased: true
- [x] 이미지 상세 페이지에서 더미 데이터 없이 실제 DB 데이터를 표시한다
- [x] TypeScript 타입 에러가 없다
- [x] npm run check-all 통과

## 구현 단계

### 1단계: 이미지 상세 조회 API Route 구현

- [x] src/app/api/images/[imageId]/route.ts 생성
- [x] Prisma Image + category include 조회
- [x] isActive, processingStatus 필터 적용
- [x] auth()로 세션 확인, isPurchased 산출
- [x] SIZE_RATIOS × LICENSE_MULTIPLIERS 8가지 priceOptions 계산
- [x] Decimal → Number 변환, 404/500 에러 처리

### 2단계: 관련 이미지 API Route 구현

- [x] src/app/api/images/[imageId]/related/route.ts 생성
- [x] 동일 categoryId 기준 최대 8건 (현재 이미지 제외)
- [x] salesCount 내림차순 정렬
- [x] basePrice Decimal → Number 변환

### 3단계: 타입 정의 업데이트 및 TanStack Query 훅 구현

- [x] src/types/api.ts - ImageDetailResponse에 isPurchased: boolean 추가
- [x] src/lib/hooks/use-image-detail.ts 생성 (useImageDetail, useRelatedImages)
- [x] queryKey, staleTime 1분 설정

### 4단계: 이미지 상세 페이지 더미 데이터 교체

- [x] dummyImages, dummyOrders import 제거
- [x] DEMO_USER_ID 제거, auth() 실제 세션 사용
- [x] Prisma 직접 쿼리로 이미지/구매여부/관련이미지 조회
- [x] generateMetadata도 실제 DB 쿼리로 교체
- [x] description/shootDate null→undefined, Json 타입 캐스팅 처리

### 5단계: 검증 및 완료

- [x] npm run check-all 통과 (0 errors)
- [x] Playwright MCP E2E 테스트
- [x] ROADMAP.md Task 022 완료 표시

## 테스트 체크리스트

- [x] /images/[실제imageId] 접속 시 실제 DB 이미지 표시
- [x] 비로그인 시 MetadataSection 잠금 UI 표시
- [x] 태그 클릭 → /search?q=태그 이동
- [x] 관련 이미지 섹션 렌더링 확인
- [x] 존재하지 않는 ID → 404 페이지

## 변경 사항 요약

**신규 생성 파일:**

- `src/app/api/images/[imageId]/route.ts` - 이미지 상세 조회 API (priceOptions, isPurchased 포함)
- `src/app/api/images/[imageId]/related/route.ts` - 관련 이미지 API
- `src/lib/hooks/use-image-detail.ts` - useImageDetail, useRelatedImages 훅

**수정 파일:**

- `src/types/api.ts` - ImageDetailResponse에 isPurchased: boolean 추가
- `src/app/(buyer)/images/[id]/page.tsx` - 더미 데이터 제거, Prisma 직접 쿼리 교체
