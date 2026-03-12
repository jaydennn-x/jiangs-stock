# Task 005: 구매자 헤더, 푸터, 네비게이션 UI 완성

## 상태: 완료

## 설명

Phase 2 두 번째 작업. 구매자용 공통 레이아웃 컴포넌트(헤더, 푸터)를 완전한 UI로 완성합니다.

- 헤더: 로고, 검색창, 카테고리 드롭다운(6종), 장바구니 아이콘(수량 배지), 인증 메뉴(로그인/회원가입 또는 사용자 드롭다운)
- 사용자 드롭다운: 위시리스트, 구매 내역, 내 정보, 로그아웃
- 모바일 반응형 네비게이션 (햄버거 메뉴 + Sheet)
- 푸터: 브랜드 설명, 이용약관/개인정보처리방침/라이선스 링크
- 헤더 검색창: Enter 또는 검색 버튼 클릭 시 `/search?q=키워드`로 이동

## 관련 파일

- `src/components/layout/header.tsx` - 헤더 컴포넌트 (수정)
- `src/components/layout/footer.tsx` - 푸터 컴포넌트 (수정)
- `src/components/ui/sheet.tsx` - Sheet 컴포넌트 (SheetHeader/SheetTitle 확인)
- `src/components/search/search-input.tsx` - 검색창 컴포넌트 (재사용)
- `src/stores/cart-store.ts` - 장바구니 스토어 (재사용)
- `src/lib/dummy/categories.ts` - 카테고리 더미 데이터 (재사용)
- `src/components/ui/navigation-menu.tsx` - NavigationMenu (재사용)
- `src/components/ui/dropdown-menu.tsx` - DropdownMenu (재사용)
- `src/components/ui/avatar.tsx` - Avatar (재사용)
- `src/components/ui/badge.tsx` - Badge (재사용)

## 수락 기준

- [x] 헤더에 검색창이 통합되어 Enter/버튼 클릭 시 `/search?q=키워드`로 이동
- [x] 카테고리 드롭다운이 동작하고 클릭 시 `/search?category=슬러그`로 이동
- [x] 장바구니 아이콘에 수량 배지가 표시됨 (0이면 숨김)
- [x] 로그인/비로그인 상태에 따른 인증 메뉴 전환 동작 (더미)
- [x] 사용자 드롭다운 메뉴: 위시리스트, 구매 내역, 내 정보, 로그아웃 항목
- [x] 모바일 햄버거 메뉴에 검색창과 카테고리 포함
- [x] 푸터에 브랜드 설명 및 이용약관, 개인정보처리방침, 라이선스 링크 유지
- [x] `npm run check-all` 통과

## 구현 단계

### 1단계: 작업 파일 생성

- [x] `tasks/005-buyer-header-footer-nav.md` 작업 파일 생성

### 2단계: 헤더 컴포넌트 UI 완성

- [x] CartButton 내부 함수 구현 (장바구니 수량 배지)
- [x] CategoryNav 내부 함수 구현 (카테고리 드롭다운)
- [x] AuthMenu 내부 함수 구현 (로그인/회원가입 vs 사용자 드롭다운)
- [x] MobileMenu 내부 함수 구현 (모바일 Sheet 개선)
- [x] Header 메인 컴포넌트 조합

### 3단계: 푸터 컴포넌트 디자인 개선

- [x] 브랜드 설명 텍스트 추가
- [x] 2단 레이아웃 적용 (상단: 브랜드, 하단: 저작권+링크)
- [x] 기존 링크 3개 유지

### 4단계: 최종 검증 및 완료 처리

- [x] Sheet 컴포넌트 SheetHeader/SheetTitle export 확인 (이미 존재)
- [x] `npm run check-all` 통과
- [x] `tasks/005-buyer-header-footer-nav.md` 완료 처리
- [x] `docs/ROADMAP.md` Task 005 완료 표시

## 변경 사항 요약

| 파일                                       | 변경                                                                          |
| ------------------------------------------ | ----------------------------------------------------------------------------- |
| `src/components/layout/header.tsx`         | 완전 재구현 - CartButton/CategoryNav/AuthMenu/MobileMenu 4개 내부 함수로 분리 |
| `src/components/layout/footer.tsx`         | 브랜드 설명 추가, 2단 레이아웃 개선                                           |
| `tasks/004-dummy-data-state-components.md` | Prettier 포맷 수정                                                            |
