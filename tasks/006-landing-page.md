# Task 006: 랜딩 페이지 UI 구현

## 상태: 완료

## 설명

구매자 홈(`/`) 랜딩 페이지를 완전한 UI로 구현한다.
Shutterstock/Getty Images 스타일의 히어로 섹션, 카테고리 퀵링크, 신규 이미지 갤러리, 베스트셀러 갤러리 4개 섹션으로 구성한다.

## 관련 파일

- `src/app/(buyer)/page.tsx`
- `src/components/landing/hero-search.tsx`
- `src/components/common/image-grid.tsx`
- `src/lib/dummy/images.ts`
- `src/lib/dummy/categories.ts`

## 수락 기준

- [x] 히어로 섹션: 배경 이미지 + 오버레이 + 중앙 검색창 + 트렌딩 태그 표시
- [x] 카테고리 퀵링크 섹션: 6개 카테고리 카드 (아이콘 + 이름, `/search?category=슬러그`)
- [x] 신규 이미지 갤러리: 최근 업로드 12장 그리드 (더미 데이터)
- [x] 베스트셀러 이미지 갤러리: 판매 건수 기준 상위 12장 그리드 (더미 데이터)
- [x] 인기 태그 퀵링크: 클릭 시 `/search?tag=태그`로 이동
- [x] 반응형 디자인 적용 (모바일/태블릿/데스크톱)
- [x] TypeScript 타입 에러 없음
- [x] ESLint/Prettier 검사 통과

## 구현 단계

### 1단계: HeroSearch 클라이언트 컴포넌트 생성

- [x] `src/components/landing/hero-search.tsx` 생성 (`use client` 래퍼)
- [x] SearchInput 컴포넌트를 서버 컴포넌트(page.tsx)에서 사용 가능하도록 분리

### 2단계: 랜딩 페이지 메인 구현

- [x] `src/app/(buyer)/page.tsx` 완전한 랜딩 페이지로 구현
- [x] 히어로 섹션 구현 (배경 이미지 오버레이 + 검색창 + 트렌딩 태그)
- [x] 카테고리 퀵링크 섹션 구현 (6개 카드)
- [x] 신규 이미지 갤러리 섹션 구현 (더미 데이터 12장)
- [x] 베스트셀러 갤러리 섹션 구현 (더미 데이터 12장)
- [x] 반응형 스타일링 적용

### 3단계: 최종 검증

- [x] `npm run check-all` 통과 확인
- [x] 빌드 성공 확인

## 변경 사항 요약

- `src/components/landing/hero-search.tsx` **신규 생성**: SearchInput의 `use client` 래퍼. 흰색 배경 + shadow-lg 스타일.
- `src/app/(buyer)/page.tsx` **전면 재구현**: 서버 컴포넌트 유지. HeroSection(picsum 배경 + 그라디언트 오버레이 + 트렌딩태그 8개), CategorySection(6개 카드 hover scale 애니메이션), GallerySection x2(createdAt 내림차순 12장 / salesCount 내림차순 12장).
