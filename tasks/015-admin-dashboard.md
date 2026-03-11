# Task 015: 관리자 대시보드 UI 구현

## 상태: 완료

## 설명

관리자 대시보드 페이지 UI를 더미 데이터 기반으로 완성한다. 매출 요약 카드 4종, 일별/월별 매출 차트(Recharts), 최근 주문 테이블, 인기 상품 TOP 10, 빠른 이동 링크를 구현한다.

## 관련 파일

- `src/app/admin/(protected)/dashboard/page.tsx` — 대시보드 메인 페이지 (수정)
- `src/components/admin/dashboard-stats-cards.tsx` — 매출 통계 카드 4종 (신규)
- `src/components/admin/dashboard-sales-chart.tsx` — 매출 추이 차트 (신규, use client)
- `src/components/admin/dashboard-recent-orders.tsx` — 최근 주문 테이블 (신규)
- `src/components/admin/dashboard-top-images.tsx` — 인기 상품 TOP 10 (신규)
- `src/components/admin/dashboard-quick-links.tsx` — 빠른 이동 링크 (신규)
- `src/lib/dummy/orders.ts` — 주문 더미 데이터 (참조)
- `src/lib/dummy/images.ts` — 이미지 더미 데이터 (참조)

## 수락 기준

- [x] 매출 요약 카드 4종: 오늘 매출, 이번 주 매출, 이번 달 매출, 총 판매 건수
- [x] 최근 주문 목록 테이블 (최근 10건, 더미 데이터)
- [x] 인기 상품 TOP 10 리스트 (salesCount 기준 정렬)
- [x] 일별/월별 매출 추이 차트 (Recharts BarChart)
- [x] 빠른 이동 링크: 상품 관리, 주문 관리
- [x] 반응형 그리드 레이아웃 (모바일/태블릿/데스크톱)
- [x] TypeScript 타입 에러 없음
- [x] ESLint/Prettier 검사 통과
- [x] 빌드 성공

## 구현 단계

### 1단계: Recharts 설치 및 작업 파일 생성

- [x] `npm install recharts` 실행
- [x] `tasks/015-admin-dashboard.md` 생성

### 2단계: 컴포넌트 구현

- [x] `dashboard-stats-cards.tsx` — 매출 집계 로직 + 카드 4종
- [x] `dashboard-sales-chart.tsx` — Recharts BarChart (use client)
- [x] `dashboard-recent-orders.tsx` — 최근 주문 테이블
- [x] `dashboard-top-images.tsx` — 인기 상품 TOP 10
- [x] `dashboard-quick-links.tsx` — 빠른 이동 링크

### 3단계: 페이지 조합 및 검증

- [x] `dashboard/page.tsx` 반응형 그리드 레이아웃 완성
- [x] `npm run check-all` 통과
- [x] `npm run build` 성공
- [x] ROADMAP.md Task 015 완료 표시
