# Task 021: 이미지 검색 API 구현 (F001)

## 상태: 완료

## 설명

이미지 검색 API 엔드포인트를 구현하고, TanStack Query 기반 무한스크롤 훅을 생성하여 검색 결과 페이지와 랜딩 페이지의 더미 데이터를 실제 PostgreSQL DB 연동으로 교체한다.

## 관련 파일

- `src/app/api/images/search/route.ts` - GET 검색 API 엔드포인트
- `src/lib/hooks/use-image-search.ts` - useInfiniteQuery 기반 무한스크롤 훅
- `src/components/search/search-results-client.tsx` - 무한스크롤 검색 결과 Client Component
- `src/app/(buyer)/search/page.tsx` - 검색 결과 페이지 (실제 API 연동)
- `src/app/(buyer)/page.tsx` - 랜딩 페이지 (Prisma 직접 쿼리)
- `src/components/search/search-header.tsx` - sort 파라미터 통일

## 수락 기준

- [x] /api/images/search?q=자연 으로 키워드 검색이 동작한다
- [x] /api/images/search?category=nature-landscape 으로 카테고리 필터가 동작한다
- [x] /api/images/search?orientation=LANDSCAPE 으로 방향 필터가 동작한다
- [x] /api/images/search?colorTag=blue 으로 색상 필터가 동작한다
- [x] /api/images/search?sort=popular 으로 인기순 정렬이 동작한다
- [x] 커서 기반 페이지네이션이 동작한다 (limit, cursor 파라미터)
- [x] 검색 결과 페이지에서 실제 DB 데이터를 무한스크롤로 표시한다
- [x] 랜딩 페이지 갤러리가 실제 DB 데이터를 표시한다
- [x] TypeScript 타입 에러가 없다
- [x] npm run check-all 통과

## 구현 단계

### 1단계: 검색 API Route 구현

- [x] src/app/api/images/search/route.ts 생성
- [x] isActive/processingStatus 기본 필터 적용
- [x] 키워드(ILIKE + hasSome), 카테고리(slug), 태그, 색상태그, 방향, 가격범위 필터
- [x] 커서 기반 페이지네이션 (cursor + skip:1 + take:limit+1)
- [x] 정렬 (latest/popular/price_asc/price_desc)
- [x] Decimal → Number 변환
- [x] totalCount 첫 페이지 전용

### 2단계: TanStack Query 훅 구현

- [x] src/lib/hooks/use-image-search.ts 생성
- [x] useInfiniteQuery 제네릭 타입 명시
- [x] fetchImages 함수 (URLSearchParams 빌드 → API 호출)
- [x] getNextPageParam 커서 페이지네이션

### 3단계: 검색 결과 페이지 실제 API 연동

- [x] src/components/search/search-results-client.tsx 생성 (무한스크롤)
- [x] IntersectionObserver 센티넬 패턴
- [x] src/app/(buyer)/search/page.tsx 더미 데이터 제거
- [x] src/components/search/search-header.tsx sort 값 통일

### 4단계: 랜딩 페이지 실제 DB 쿼리

- [x] src/app/(buyer)/page.tsx 더미 데이터 제거
- [x] Prisma 직접 쿼리 (신규/베스트셀러 각 9건)
- [x] export const dynamic = 'force-dynamic'

### 5단계: 검증 및 완료

- [x] npm run check-all 통과
- [x] Playwright MCP E2E 테스트
- [x] ROADMAP.md Task 021 완료 표시

## 테스트 체크리스트

- [x] /search 페이지 접속 시 실제 DB 이미지 표시
- [x] 키워드 검색 동작 확인
- [x] 카테고리/방향 필터 동작 확인
- [x] 정렬 변경 동작 확인
- [x] 랜딩 페이지 신규/베스트셀러 이미지 표시

## 변경 사항 요약

**신규 생성 파일:**

- `src/app/api/images/search/route.ts` - GET 검색 API (필터, 정렬, 커서 페이지네이션)
- `src/lib/hooks/use-image-search.ts` - useInfiniteQuery 훅
- `src/components/search/search-results-client.tsx` - 무한스크롤 Client Component

**수정 파일:**

- `src/app/(buyer)/search/page.tsx` - 더미 데이터 제거, SearchResultsClient 사용
- `src/app/(buyer)/page.tsx` - 더미 데이터 제거, Prisma 직접 쿼리
- `src/components/search/search-header.tsx` - totalCount 제거, sort 값 통일 (popular/latest/price_asc/price_desc)
