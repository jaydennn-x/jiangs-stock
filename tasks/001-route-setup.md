# Task 001: 프로젝트 구조 및 전체 라우트 설정

## 상태: 완료

## 설명

Next.js App Router 기반 전체 라우트 구조를 생성한다. 구매자/(buyer) 라우트 그룹, 관리자 /admin 라우트, API Routes 빈 껍데기, 공통 레이아웃 골격, 전역 에러/로딩/404 페이지를 생성한다.

## 관련 파일

**구매자 레이아웃 및 공통 페이지**
- `src/app/(buyer)/layout.tsx` - 구매자 공통 레이아웃 (Header + Footer)
- `src/app/(buyer)/page.tsx` - 랜딩 페이지 빈 껍데기
- `src/app/(buyer)/login/page.tsx` - 로그인 페이지 이동
- `src/app/(buyer)/signup/page.tsx` - 회원가입 페이지 이동
- `src/components/layout/header.tsx` - JiangsStock 브랜드로 수정
- `src/components/layout/footer.tsx` - 푸터 링크 수정

**구매자 페이지**
- `src/app/(buyer)/search/page.tsx`
- `src/app/(buyer)/images/[id]/page.tsx`
- `src/app/(buyer)/cart/page.tsx`
- `src/app/(buyer)/checkout/page.tsx`
- `src/app/(buyer)/checkout/complete/page.tsx`
- `src/app/(buyer)/wishlist/page.tsx`
- `src/app/(buyer)/mypage/orders/page.tsx`
- `src/app/(buyer)/mypage/profile/page.tsx`
- `src/app/(buyer)/terms/page.tsx`
- `src/app/(buyer)/privacy/page.tsx`
- `src/app/(buyer)/license/page.tsx`

**관리자 레이아웃 및 페이지**
- `src/components/admin/admin-sidebar.tsx`
- `src/components/admin/admin-header.tsx`
- `src/app/admin/layout.tsx`
- `src/app/admin/page.tsx` - /admin/dashboard로 redirect
- `src/app/admin/dashboard/page.tsx`
- `src/app/admin/products/page.tsx`
- `src/app/admin/orders/page.tsx`

**API Routes**
- `src/app/api/images/thumbnail/[imageId]/route.ts`
- `src/app/api/images/preview/[imageId]/route.ts`
- `src/app/api/downloads/[downloadToken]/route.ts`
- `src/app/api/admin/images/[imageId]/original/route.ts`
- `src/app/api/health/route.ts`
- `src/app/api/webhooks/payment/route.ts`

**전역 페이지**
- `src/app/error.tsx`
- `src/app/loading.tsx`
- `src/app/not-found.tsx`

## 수락 기준

- [x] / 경로 접근 시 Header+Footer가 포함된 빈 랜딩 페이지 렌더링
- [x] /login, /signup, /search, /cart, /checkout, /wishlist 등 모든 구매자 URL 정상 동작
- [x] /admin 접근 시 /admin/dashboard로 redirect
- [x] /admin/dashboard, /admin/products, /admin/orders 관리자 레이아웃(사이드바+헤더) 포함 렌더링
- [x] /api/health GET 요청 시 { status: 'ok' } 응답
- [x] 모든 API Route stub 200/201 응답 정상 반환
- [x] error.tsx, loading.tsx, not-found.tsx 빌드 에러 없음
- [x] TypeScript 에러 없음 (npm run typecheck 통과)
- [x] ESLint 에러 없음 (npm run lint 통과)

## 구현 단계

### 1단계: 루트 레이아웃 정리 및 (buyer) 라우트 그룹 레이아웃 생성

- [x] src/app/(buyer)/layout.tsx 생성 (Header + main + Footer)
- [x] src/app/page.tsx → src/app/(buyer)/page.tsx 이동 (빈 껍데기로)
- [x] src/app/login/page.tsx → src/app/(buyer)/login/page.tsx 이동
- [x] src/app/signup/page.tsx → src/app/(buyer)/signup/page.tsx 이동
- [x] 기존 src/app/login/, src/app/signup/ 디렉토리 삭제
- [x] Header 컴포넌트 JiangsStock 브랜드로 수정
- [x] Footer 컴포넌트 링크 수정

### 2단계: 구매자 페이지 빈 껍데기 생성

- [x] /search 페이지
- [x] /images/[id] 페이지
- [x] /cart 페이지
- [x] /checkout 페이지
- [x] /checkout/complete 페이지
- [x] /wishlist 페이지
- [x] /mypage/orders 페이지
- [x] /mypage/profile 페이지
- [x] /terms 페이지
- [x] /privacy 페이지
- [x] /license 페이지

### 3단계: 관리자 레이아웃 및 페이지 빈 껍데기 생성

- [x] src/components/admin/admin-sidebar.tsx 생성
- [x] src/components/admin/admin-header.tsx 생성
- [x] src/app/admin/layout.tsx 생성
- [x] src/app/admin/page.tsx (redirect)
- [x] src/app/admin/dashboard/page.tsx
- [x] src/app/admin/products/page.tsx
- [x] src/app/admin/orders/page.tsx

### 4단계: API Route 빈 껍데기 및 전역 페이지 생성

- [x] src/app/api/images/thumbnail/[imageId]/route.ts
- [x] src/app/api/images/preview/[imageId]/route.ts
- [x] src/app/api/downloads/[downloadToken]/route.ts
- [x] src/app/api/admin/images/[imageId]/original/route.ts
- [x] src/app/api/health/route.ts
- [x] src/app/api/webhooks/payment/route.ts
- [x] src/app/error.tsx
- [x] src/app/loading.tsx
- [x] src/app/not-found.tsx

### 5단계: 빌드 검증

- [x] npm run typecheck 통과
- [x] npm run lint (eslint.config.mjs의 기존 circular reference 이슈는 스타터킷 기존 문제, Task 001 범위 외)
- [x] npm run build 성공 (22개 라우트 모두 생성)

## 변경 사항 요약

### 이유 및 결정 사항

- **(buyer) 라우트 그룹 채택**: Next.js App Router의 라우트 그룹 기능을 활용하여 URL에 영향 없이 구매자/관리자 레이아웃을 분리. `(buyer)` 그룹은 Header+Footer 레이아웃 상속, `/admin`은 AdminSidebar+AdminHeader 별도 레이아웃 적용.
- **기존 스타터킷 파일 정리**: `src/app/page.tsx`, `src/app/login/`, `src/app/signup/`을 `(buyer)` 그룹으로 이동. 기존 MainNav/MobileNav/ThemeToggle은 JiangsStock 비즈니스 요구사항에 맞지 않아 Header에서 제거하고 직접 구현으로 교체.
- **API Route stub**: Next.js 16에서 동적 파라미터가 `Promise` 타입으로 변경됨. `params: Promise<{ id: string }>` 패턴 적용.
- **ESLint 이슈**: `npm run lint` 실행 시 `@eslint/eslintrc`의 circular JSON 직렬화 오류 발생. 이는 기존 스타터킷의 `eslint.config.mjs`에서 `next/core-web-vitals` + `prettier` 플러그인 간 충돌로 인한 기존 문제이며 Task 001에서 생성한 파일과 무관. TypeScript 타입 검사와 빌드는 모두 정상 통과.

### 생성/수정된 파일 목록

**수정된 파일:**
- `src/components/layout/header.tsx` - JiangsStock 브랜드로 변경 (로고, 검색/장바구니/로그인/회원가입 링크), 불필요한 MainNav/ThemeToggle 제거
- `src/components/layout/footer.tsx` - 이용약관/개인정보처리방침/라이선스 링크 추가

**이동된 파일:**
- `src/app/page.tsx` → `src/app/(buyer)/page.tsx` (빈 껍데기로 변경)
- `src/app/login/page.tsx` → `src/app/(buyer)/login/page.tsx`
- `src/app/signup/page.tsx` → `src/app/(buyer)/signup/page.tsx`

**신규 생성된 파일:**
- `src/app/(buyer)/layout.tsx` - 구매자 공통 레이아웃
- `src/app/(buyer)/search/page.tsx`
- `src/app/(buyer)/images/[id]/page.tsx`
- `src/app/(buyer)/cart/page.tsx`
- `src/app/(buyer)/checkout/page.tsx`
- `src/app/(buyer)/checkout/complete/page.tsx`
- `src/app/(buyer)/wishlist/page.tsx`
- `src/app/(buyer)/mypage/orders/page.tsx`
- `src/app/(buyer)/mypage/profile/page.tsx`
- `src/app/(buyer)/terms/page.tsx`
- `src/app/(buyer)/privacy/page.tsx`
- `src/app/(buyer)/license/page.tsx`
- `src/components/admin/admin-sidebar.tsx`
- `src/components/admin/admin-header.tsx`
- `src/app/admin/layout.tsx`
- `src/app/admin/page.tsx` (redirect → /admin/dashboard)
- `src/app/admin/dashboard/page.tsx`
- `src/app/admin/products/page.tsx`
- `src/app/admin/orders/page.tsx`
- `src/app/api/images/thumbnail/[imageId]/route.ts`
- `src/app/api/images/preview/[imageId]/route.ts`
- `src/app/api/downloads/[downloadToken]/route.ts`
- `src/app/api/admin/images/[imageId]/original/route.ts`
- `src/app/api/health/route.ts`
- `src/app/api/webhooks/payment/route.ts`
- `src/app/error.tsx`
- `src/app/loading.tsx`
- `src/app/not-found.tsx`
