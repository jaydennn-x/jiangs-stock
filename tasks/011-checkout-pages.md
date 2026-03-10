# Task 011: 결제 페이지 및 결제 완료 페이지 UI 구현

## 상태: 완료

## 설명

더미 수준으로 구현되어 있던 `/checkout`과 `/checkout/complete` 페이지를 Zustand CartStore와 더미 데이터를 활용하여 완성된 UI로 구현한다. 실제 PG 연동 없이 UI만 구현하며, 결제 실패 상태 UI도 포함한다.

## 관련 파일

- `src/app/(buyer)/checkout/page.tsx` — 전면 교체 (빈 껍데기 → 완성 UI)
- `src/app/(buyer)/checkout/complete/page.tsx` — 전면 교체 (빈 껍데기 → 완성 UI)
- `src/components/checkout/order-summary.tsx` — 새 파일: 주문 요약 컴포넌트
- `src/components/checkout/payment-method-placeholder.tsx` — 새 파일: PG 위젯 더미 UI
- `src/components/checkout/agree-section.tsx` — 새 파일: 구매 동의 체크박스 섹션
- `src/components/checkout/complete-order-item.tsx` — 새 파일: 결제 완료 페이지 개별 아이템 행

## 수락 기준

- [x] 결제 페이지: 주문 요약 (이미지 목록, 옵션, 개별 가격), 총 결제 금액, 결제 수단 선택 영역 (PG 위젯 placeholder), 구매 동의 체크박스, "결제하기" 버튼
- [x] 결제 완료 페이지: 성공 메시지 + 주문번호 표시, 구매 이미지 목록 (썸네일/이름/옵션), 이미지별 "다운로드" 버튼 (더미), 다운로드 안내 (3회 한도/7일 만료), 이메일 발송 완료 안내, "구매 내역으로 이동" 버튼, "홈으로" 버튼
- [x] 결제 실패 상태 UI: 에러 메시지 + 재시도 버튼
- [x] 빈 장바구니 시 EmptyState 표시
- [x] 동의 체크박스 미체크 시 결제하기 버튼 비활성화
- [x] TypeScript 타입 에러 없음
- [x] ESLint/Prettier 검사 통과
- [x] 빌드 성공

## 구현 단계

### 1단계: checkout 공통 컴포넌트 구현

- [x] `src/components/checkout/` 디렉토리 생성
- [x] `order-summary.tsx` — LocalCartItem 목록 + 총 결제 금액 Card
- [x] `payment-method-placeholder.tsx` — 점선 border + 카드/간편결제 더미 라디오
- [x] `agree-section.tsx` — AgreeState 타입 + 전체 동의 토글 + 개별 체크박스 3개
- [x] `complete-order-item.tsx` — 썸네일 + 크기/라이선스 + 다운로드 현황 + 버튼

### 2단계: 결제 페이지 구현

- [x] `checkout/page.tsx` Client Component 전환 (metadata 제거)
- [x] `useSyncExternalStore` 패턴으로 Hydration 안전 처리
- [x] `useSearchParams` → `?status=failed` 결제 실패 UI 분기
- [x] 빈 장바구니 분기: EmptyState (장바구니로 이동)
- [x] 2컬럼 레이아웃 (`lg:grid-cols-[1fr_360px]`)
- [x] 전체 동의 시 결제하기 버튼 활성화, 클릭 시 `/checkout/complete?orderId=dummy-order-001`

### 3단계: 결제 완료 페이지 구현

- [x] `checkout/complete/page.tsx` Client Component 전환 (metadata 제거)
- [x] `useSearchParams` → orderId로 dummyOrders 조회 (없으면 dummyOrders[0] fallback)
- [x] CheckCircle2 아이콘 + 주문번호 표시
- [x] 이메일 발송 완료 안내
- [x] CompleteOrderItem 목록 (dummyImages 이미지 정보 매칭)
- [x] 다운로드 안내 (DEFAULT_DOWNLOAD_LIMIT/EXPIRES_DAYS 상수 활용)
- [x] 구매 내역(`/mypage/orders`) + 홈(`/`) 버튼

## 변경 사항 요약

- **신규 생성**: `src/components/checkout/order-summary.tsx` — LocalCartItem 목록 + Separator + 총액 Card
- **신규 생성**: `src/components/checkout/payment-method-placeholder.tsx` — 점선 border + 더미 결제수단 UI
- **신규 생성**: `src/components/checkout/agree-section.tsx` — AgreeState 타입 export, 전체 동의 + 개별 체크박스 3개 (privacy/terms 링크 포함)
- **신규 생성**: `src/components/checkout/complete-order-item.tsx` — 썸네일(80x80), 다운로드 현황 badge, 다운로드 버튼 (만료/한도 disabled 처리)
- **전면 교체**: `src/app/(buyer)/checkout/page.tsx` — useSyncExternalStore Hydration + ?status=failed 실패 UI + AgreeSection 동의 체크 + 결제 카드
- **전면 교체**: `src/app/(buyer)/checkout/complete/page.tsx` — orderId searchParams + dummyOrders 조회 + 다운로드 안내 + 이동 버튼
- **신규 생성**: `tasks/011-checkout-pages.md`
