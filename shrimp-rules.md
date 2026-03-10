# JiangsStock AI Agent 개발 규칙

## 프로젝트 개요

- **목적**: 스톡 이미지 크기별·라이선스별 판매 이커머스 플랫폼 (1인 개발)
- **스택**: Next.js 16.1.6 (App Router) + React 19 + TypeScript 5 + TailwindCSS v4 + shadcn/ui
- **작업 문서**: `docs/ROADMAP.md` (전체 계획), `docs/PRD.md` (기능 명세), `tasks/` (개별 작업 파일)

---

## 디렉토리 구조 규칙

```
src/
├── app/                    # Next.js App Router 페이지
│   ├── (buyer)/            # 구매자 라우트 그룹 (공통 레이아웃)
│   ├── admin/              # 관리자 라우트 (별도 레이아웃)
│   ├── api/                # API Routes
│   └── layout.tsx          # 루트 레이아웃
├── components/
│   ├── ui/                 # shadcn/ui 자동 생성 컴포넌트 (직접 수정 금지)
│   ├── layout/             # 헤더, 푸터, 컨테이너 등 레이아웃 컴포넌트
│   ├── navigation/         # 네비게이션 컴포넌트
│   ├── providers/          # Context Provider 컴포넌트
│   └── [feature]/          # 기능별 컴포넌트 (image-card/, cart/, admin/ 등)
├── lib/
│   ├── utils.ts            # cn() 유틸리티 (tailwind-merge + clsx)
│   └── env.ts              # 환경변수 Zod 검증
└── types/                  # TypeScript 타입 정의 (Task 002에서 생성)
tasks/                      # 작업 파일 디렉토리
docs/                       # PRD.md, ROADMAP.md
```

### 파일 네이밍

- 컴포넌트: `kebab-case.tsx` (예: `image-card.tsx`)
- 페이지: `page.tsx` (App Router 규칙)
- 레이아웃: `layout.tsx`
- 에러 바운더리: `error.tsx`
- 로딩: `loading.tsx`
- 404: `not-found.tsx`
- 유틸리티: `kebab-case.ts`
- 타입 파일: `kebab-case.ts` (예: `image.ts`, `order.ts`)

---

## 라우트 추가 규칙

### 새 페이지 추가 시 필수 파일

```
src/app/[route]/
├── page.tsx          # 필수
├── loading.tsx       # 권장 (스켈레톤 UI)
└── error.tsx         # 권장 (에러 바운더리)
```

### 라우트 그룹 구분

- **구매자 페이지**: `src/app/(buyer)/` 하위 — 구매자용 공통 레이아웃(헤더+푸터) 상속
- **관리자 페이지**: `src/app/admin/` 하위 — 관리자용 레이아웃(사이드바+헤더) 별도 적용
- **API Routes**: `src/app/api/` 하위 — `route.ts` 파일 사용
- **정적 페이지**: `src/app/(buyer)/terms/`, `privacy/`, `license/`

### 전체 라우트 목록 (PRD 기준)

**구매자**: `/`, `/search`, `/images/[id]`, `/cart`, `/checkout`, `/checkout/complete`, `/login`, `/signup`, `/wishlist`, `/mypage/orders`, `/mypage/profile`

**관리자**: `/admin`, `/admin/dashboard`, `/admin/products`, `/admin/orders`

**정적**: `/terms`, `/privacy`, `/license`

**API**: `/api/images/thumbnail/[imageId]`, `/api/images/preview/[imageId]`, `/api/downloads/[downloadToken]`, `/api/admin/images/[imageId]/original`, `/api/health`, `/api/webhooks/payment`

---

## 컴포넌트 패턴 규칙

### Server Component (기본값)

- 데이터 패칭, 정적 렌더링에 사용
- `async/await` 사용 가능
- `'use client'` 선언 없음

### Client Component

- 반드시 파일 상단에 `'use client'` 선언
- 사용 시: `useState`, `useEffect`, 이벤트 핸들러, 브라우저 API
- 가능한 한 컴포넌트 트리 하단에 배치

### 컴포넌트 Props 타입

```tsx
// 항상 interface로 정의, Props 접미사 사용
interface ImageCardProps {
  id: string
  name: string
  basePrice: number
}
```

---

## shadcn/ui 사용 규칙

- `src/components/ui/` 파일은 **직접 수정 금지** (shadcn 재설치 시 덮어씀)
- 새 컴포넌트 추가: `npx shadcn@latest add [컴포넌트명]`
- style: `new-york`, baseColor는 프로젝트 기본값 사용
- shadcn 컴포넌트를 래핑할 경우 `src/components/[feature]/` 하위에 생성

---

## TailwindCSS 규칙

- TailwindCSS v4 사용 (설정 파일 없는 CSS 엔진)
- `tailwind.config.ts` 파일 생성 금지
- 클래스 병합: 반드시 `cn()` 유틸리티 사용 (`src/lib/utils.ts`)
- 반응형: `sm:`, `md:`, `lg:` 순서로 작성
- 들여쓰기 2칸 스페이스 준수

---

## 작업 파일 관리 규칙

### 작업 시작 전

1. `tasks/` 디렉토리에 `NNN-description.md` 파일 생성 (예: `001-route-setup.md`)
2. `000-sample.md` 템플릿 구조 따름
3. 구현 전 수락 기준과 구현 단계를 모두 작성

### 작업 진행 중

- 각 단계 완료 시 해당 체크박스 체크 (`- [x]`)
- 단계 완료 후 다음 단계 진행 전 사용자 확인 대기

### 작업 완료 후

- 작업 파일 "변경 사항 요약" 섹션에 실제 변경된 파일 목록 기록
- `docs/ROADMAP.md`에서 해당 작업을 완료 표시
- `npm run check-all` 통과 확인

### API/비즈니스 로직 작업

- 작업 파일에 "## 테스트 체크리스트" 섹션 필수 포함
- Playwright MCP로 E2E 테스트 수행

---

## ROADMAP.md 업데이트 규칙

- 작업 완료 시 ROADMAP.md의 해당 Task 앞에 완료 표시 추가
- 새 작업 추가 시 현재 Phase의 우선순위 다음 위치에 삽입
- ROADMAP.md 수정 시 PRD.md와 충돌 여부 확인

---

## 환경변수 규칙

- 모든 환경변수는 `src/lib/env.ts`에서 Zod 스키마로 검증
- 새 환경변수 추가 시 반드시 `env.ts`에도 추가
- 클라이언트 노출 변수: `NEXT_PUBLIC_` 접두사 필수
- 서버 전용 변수: `NEXT_PUBLIC_` 접두사 없음

---

## 금지 사항

- `src/components/ui/` 파일 직접 수정 금지
- `tailwind.config.ts` 파일 생성 금지
- `public/` 폴더에 이미지 파일 복사 금지 (이미지는 API Route로 서빙)
- `any` 타입 사용 금지 (불가피한 경우 `// eslint-disable-next-line @typescript-eslint/no-explicit-any` + 이유 주석)
- 매직 넘버 사용 금지 (상수로 정의)
- 30줄 초과 함수 작성 금지 (분리 필요)
- 작업 파일 없이 구현 시작 금지
- ROADMAP.md 확인 없이 새 기능 추가 금지
- 테스트 없이 API/비즈니스 로직 작업 완료 처리 금지

---

## 의사결정 기준

| 상황                              | 결정                                                            |
| --------------------------------- | --------------------------------------------------------------- |
| Server vs Client Component 불명확 | Server Component 기본, 인터랙션 필요 시 최소 단위로 Client 분리 |
| 새 shadcn 컴포넌트 필요           | `npx shadcn@latest add` 사용, 직접 구현 금지                    |
| 타입 정의 위치 불명확             | `src/types/` 하위 도메인별 파일 (image.ts, order.ts 등)         |
| 공통 유틸리티 추가                | `src/lib/` 하위에 기능별 파일 생성                              |
| 스타일 커스터마이징               | Tailwind 클래스 우선, CSS 변수 차선, 인라인 스타일 금지         |
