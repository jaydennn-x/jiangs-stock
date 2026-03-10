# Task 014: 관리자 레이아웃 및 로그인 페이지 UI 구현

## 상태: 완료

## 설명

관리자 영역 UI를 완성한다. Route Group 패턴으로 `/admin/login`을 사이드바/헤더 레이아웃에서 분리하고, 반응형 사이드바(모바일 Sheet), 개선된 헤더(관리자 이름/로그아웃), 독립적인 관리자 로그인 페이지를 구현한다.

## 관련 파일

- `src/app/admin/(protected)/layout.tsx` — 사이드바+헤더 레이아웃 (Route Group)
- `src/app/admin/(protected)/dashboard/page.tsx` — 대시보드 페이지
- `src/app/admin/(protected)/products/page.tsx` — 상품 관리 페이지
- `src/app/admin/(protected)/orders/page.tsx` — 주문 관리 페이지
- `src/app/admin/login/page.tsx` — 관리자 로그인 페이지 (독립, 레이아웃 없음)
- `src/components/admin/admin-sidebar.tsx` — 사이드바 (반응형)
- `src/components/admin/admin-header.tsx` — 헤더 (모바일 햄버거 + 관리자 정보)
- `src/components/admin/sidebar-nav.tsx` — 공통 네비게이션 컴포넌트
- `src/components/admin/admin-login-form.tsx` — 관리자 로그인 폼

## 수락 기준

- [x] 관리자 로그인 페이지: 이메일/비밀번호 입력, "관리자 로그인" 버튼 — 일반 로그인 페이지와 완전 분리 디자인 (다크 테마)
- [x] 관리자 로그인 페이지: React Hook Form + Zod 유효성 검사 적용
- [x] 관리자 로그인 페이지: `/admin/login` 접속 시 사이드바/헤더 없이 독립 렌더링
- [x] 관리자 공통 레이아웃: 사이드바 (대시보드/상품 관리/주문 관리/로그아웃)
- [x] 관리자 공통 레이아웃: 상단 헤더 (관리자 이름 표시 + 로그아웃 버튼)
- [x] 반응형: 데스크톱(768px+)에서 사이드바 항상 표시
- [x] 반응형: 모바일(<768px)에서 사이드바 숨김, 햄버거 버튼 클릭 시 Sheet 슬라이드
- [x] TypeScript 타입 에러 없음
- [x] ESLint/Prettier 검사 통과
- [x] 빌드 성공

## 구현 단계

### 1단계: Route Group 구조 재편 및 작업 파일 생성

- [x] `src/app/admin/(protected)/layout.tsx` 생성
- [x] `src/app/admin/(protected)/dashboard/page.tsx` 생성 (기존 이전)
- [x] `src/app/admin/(protected)/products/page.tsx` 생성 (기존 이전)
- [x] `src/app/admin/(protected)/orders/page.tsx` 생성 (기존 이전)
- [x] 기존 `admin/layout.tsx`, `dashboard/page.tsx`, `products/page.tsx`, `orders/page.tsx` 삭제
- [x] `tasks/014-admin-layout-login.md` 생성

### 2단계: AdminSidebar 반응형 개선 및 SidebarNav 분리

- [x] `src/components/admin/sidebar-nav.tsx` 생성 — NAV_ITEMS + 네비게이션 렌더링
- [x] `admin-sidebar.tsx` 수정 — `hidden md:flex` 적용, SidebarNav 재사용

### 3단계: AdminHeader 개선

- [x] `admin-header.tsx` — `use client` 전환
- [x] 모바일 햄버거 버튼 + Sheet (SidebarNav 포함)
- [x] 우측 관리자 이름 + 로그아웃 버튼

### 4단계: 관리자 로그인 페이지 구현

- [x] `src/components/admin/admin-login-form.tsx` — RHF+Zod 폼
- [x] `src/app/admin/login/page.tsx` — 다크 테마 독립 페이지

### 5단계: 빌드 검증

- [x] `npm run check-all` 통과
- [x] `npm run build` 성공
- [x] ROADMAP.md Task 014 완료 표시

## 변경 사항 요약

- **신규 생성**: `src/app/admin/(protected)/layout.tsx` — AdminSidebar + AdminHeader 조합 레이아웃 (Route Group)
- **신규 생성**: `src/app/admin/(protected)/dashboard/page.tsx` — 기존 dashboard 페이지 이전
- **신규 생성**: `src/app/admin/(protected)/products/page.tsx` — 기존 products 페이지 이전
- **신규 생성**: `src/app/admin/(protected)/orders/page.tsx` — 기존 orders 페이지 이전
- **신규 생성**: `src/app/admin/login/page.tsx` — slate-900 다크 테마, Shield 아이콘, 독립 레이아웃
- **신규 생성**: `src/components/admin/sidebar-nav.tsx` — NAV_ITEMS 상수 + SidebarNav 컴포넌트 (named export)
- **신규 생성**: `src/components/admin/admin-login-form.tsx` — Zod 스키마 + RHF + 다크 스타일 Input + 더미 submit
- **수정**: `src/components/admin/admin-sidebar.tsx` — hidden md:flex (데스크톱 전용), SidebarNav 재사용
- **수정**: `src/components/admin/admin-header.tsx` — use client, 모바일 Sheet + 햄버거 버튼, 관리자 이름/로그아웃
- **삭제**: `src/app/admin/layout.tsx` — (protected)/layout.tsx로 대체
- **삭제**: `src/app/admin/dashboard/page.tsx`, `products/page.tsx`, `orders/page.tsx` — (protected)/ 하위로 이전
