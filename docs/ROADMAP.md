# JiangsStock 개발 로드맵

스톡 이미지를 크기별/라이선스별로 판매하고, 구매자에게 보안 다운로드 링크로 디지털 파일을 안전하게 전달하는 1인 개발 이커머스 플랫폼

## 개요

JiangsStock은 블로그/웹사이트/마케팅 자료용 고품질 이미지를 구매하는 개인/기업, 그리고 이미지 업로드/가격 설정/주문 관리를 수행하는 1인 운영자(관리자)를 위한 스톡 이미지 판매 플랫폼으로 다음 기능을 제공합니다:

- **이미지 검색 및 탐색**: 키워드, 태그, 카테고리, 색상, 방향 기반 검색과 무한스크롤
- **크기/라이선스 기반 판매**: XL/L/M/S 크기와 스탠다드/확장 라이선스 조합 가격 체계
- **보안 디지털 파일 전달**: UUID 토큰 기반 보안 다운로드 링크 (3회/7일 만료)
- **자동 이미지 처리**: Sharp + BullMQ 기반 비동기 리사이징/워터마크 합성
- **결제 시스템**: 포트원 v2 또는 토스페이먼츠 연동 카드 결제
- **관리자 대시보드**: 상품 관리, 주문 관리, 판매 통계

## 개발 워크플로우

1. **작업 계획**
   - 기존 코드베이스를 학습하고 현재 상태를 파악
   - 새로운 작업을 포함하도록 `ROADMAP.md` 업데이트
   - 우선순위 작업은 마지막 완료된 작업 다음에 삽입

2. **작업 생성**
   - 기존 코드베이스를 학습하고 현재 상태를 파악
   - `/tasks` 디렉토리에 새 작업 파일 생성
   - 명명 형식: `XXX-description.md` (예: `001-setup.md`)
   - 고수준 명세서, 관련 파일, 수락 기준, 구현 단계 포함
   - API/비즈니스 로직 작업 시 "## 테스트 체크리스트" 섹션 필수 포함 (Playwright MCP 테스트 시나리오 작성)
   - 예시를 위해 `/tasks` 디렉토리의 마지막 완료된 작업 참조. 예를 들어, 현재 작업이 `012`라면 `011`과 `010`을 예시로 참조.
   - 이러한 예시들은 완료된 작업이므로 내용이 완료된 작업의 최종 상태를 반영함 (체크된 박스와 변경 사항 요약). 새 작업의 경우, 문서에는 빈 박스와 변경 사항 요약이 없어야 함. 초기 상태의 샘플로 `000-sample.md` 참조.

3. **작업 구현**
   - 작업 파일의 명세서를 따름
   - 기능과 기능성 구현
   - API 연동 및 비즈니스 로직 구현 시 Playwright MCP로 테스트 수행 필수
   - 각 단계 후 작업 파일 내 단계 진행 상황 업데이트
   - 구현 완료 후 Playwright MCP를 사용한 E2E 테스트 실행
   - 테스트 통과 확인 후 다음 단계로 진행
   - 각 단계 완료 후 중단하고 추가 지시를 기다림

4. **로드맵 업데이트**
   - 로드맵에서 완료된 작업을 완료로 표시

---

## 개발 단계

### Phase 1: 애플리케이션 골격 구축

> 전체 라우트 구조, 빈 페이지 껍데기, 공통 레이아웃, 타입 정의를 먼저 완성하여 전체 앱의 뼈대를 잡는다.

- [x] **Task 001: 프로젝트 구조 및 전체 라우트 설정** - 완료
  - [x] Next.js App Router 기반 전체 라우트 구조 생성 (구매자 + 관리자)
  - [x] 구매자 페이지 빈 껍데기 생성: `/`, `/search`, `/images/[id]`, `/cart`, `/checkout`, `/checkout/complete`, `/login`, `/signup`, `/wishlist`, `/mypage/orders`, `/mypage/profile`
  - [x] 관리자 페이지 빈 껍데기 생성: `/admin`, `/admin/dashboard`, `/admin/products`, `/admin/orders`
  - [x] 정적 페이지 빈 껍데기 생성: `/terms`, `/privacy`, `/license`
  - [x] API Route 빈 껍데기 생성: `/api/images/thumbnail/[imageId]`, `/api/images/preview/[imageId]`, `/api/downloads/[downloadToken]`, `/api/admin/images/[imageId]/original`, `/api/health`, `/api/webhooks/payment`
  - [x] 구매자용 공통 레이아웃 (헤더, 푸터, 네비게이션) 골격 구현
  - [x] 관리자용 공통 레이아웃 (사이드바, 헤더) 골격 구현
  - [x] 전역 에러 바운더리 (`error.tsx`), 로딩 상태 (`loading.tsx`), not-found 페이지 (`not-found.tsx`) 생성

- [x] **Task 002: TypeScript 타입 정의 및 인터페이스 설계** - 완료
  - [x] 데이터 모델 타입 정의: User, Image, Category, Order, OrderItem, Wishlist, Cart, CartItem, TransactionLog, SystemConfig
  - [x] Enum 타입 정의: UserRole, Orientation, ImageSize, LicenseType, OrderStatus, ProcessingStatus, TransactionAction, TransactionStatus
  - [x] API 요청/응답 타입 정의: 검색 파라미터, 페이지네이션, 에러 응답
  - [x] 폼 스키마 타입 정의: 회원가입, 로그인, 상품 등록/수정, 비밀번호 변경
  - [x] 가격 계산 관련 상수 정의: 크기별 비율 (L=0.45, M=0.20, S=0.07), 확장 라이선스 기본 배율
  - [x] 환경변수 타입 정의 (`env.d.ts`)
  - [x] 환경변수 Zod 스키마 검증 유틸리티: 서버 시작 시 필수 환경변수 누락 검증 (`src/lib/env.ts`)

- [x] **Task 003: Prisma 스키마 설계, 마이그레이션, Seed 실행** - 완료
  - [x] Prisma ORM 7.x 설치 및 설정 (prisma.config.ts 방식)
  - [x] 전체 데이터 모델 스키마 작성 (User, Image, Category, Order, OrderItem, Wishlist, Cart, CartItem, TransactionLog, SystemConfig)
  - [x] 인덱스 설계: tags/colorTags GIN 인덱스, name+description tsvector GIN 인덱스, categoryId+isActive B-tree 복합 인덱스
  - [x] 복합 유니크 제약조건: Wishlist(userId+imageId), CartItem(cartId+imageId+size+licenseType)
  - [x] PostgreSQL 16 + Redis 7 로컬 개발 환경 설정 (Docker Compose)
  - [x] Prisma 마이그레이션 실행 (init + add_search_indexes)
  - [x] PostgreSQL 확장 설치: pg_trgm (trigram 검색)
  - [x] tsvector 컬럼 및 GIN 인덱스 생성, 자동 업데이트 트리거 (Raw SQL 마이그레이션)
  - [x] Seed 스크립트 작성 및 실행: 기본 카테고리 6종, SystemConfig 기본값 7종, 관리자 계정 1개
  - [x] 개발용 더미 데이터 Seed: 이미지 30건, 사용자 3명, 주문/주문아이템 5건

---

### Phase 2: UI/UX 완성 (더미 데이터 활용)

> 모든 페이지 UI를 더미 데이터로 완성하여 전체 사용자 플로우를 체험할 수 있도록 한다.

- [x] **Task 004: 더미 데이터, 클라이언트 상태 관리, 공통 UI 컴포넌트 구현** - 완료
  - [x] 더미 데이터 모듈 작성: 이미지 30건, 카테고리 6종, 주문 5건, 사용자 3명
  - [x] Zustand 5.x 설치 및 장바구니 스토어 생성 (localStorage persist 미들웨어 적용)
  - [x] 장바구니 액션: 추가, 삭제, 옵션 변경 (크기/라이선스), 수량 표시
  - [x] 가격 계산 유틸리티: basePrice × 크기별 비율 × 라이선스 배율
  - [x] TanStack Query v5 설치 및 기본 설정 (QueryClient Provider)
  - [x] 공통 컴포넌트 구현: ImageCard (썸네일+가격+위시리스트 아이콘), ImageGrid (Masonry 레이아웃), PriceDisplay (가격 포맷), SizeSelector (XL/L/M/S 라디오), LicenseSelector (스탠다드/확장 라디오)
  - [x] 검색 관련 컴포넌트: SearchInput (헤더 검색창), FilterSidebar (카테고리/방향/색상 필터), SortDropdown (정렬 옵션)
  - [x] 상태 표시 컴포넌트: EmptyState, LoadingSkeleton, ErrorMessage, StatusBadge (처리 상태 배지)
  - [x] 이미지 보호 컴포넌트: ProtectedImage (우클릭/드래그 방지 래퍼, F017)

- [x] **Task 005: 구매자 헤더, 푸터, 네비게이션 UI 완성** - 완료
  - [x] 헤더: 로고, 검색창, 카테고리 드롭다운 (6종), 장바구니 아이콘 (수량 배지), 인증 메뉴 (로그인/회원가입 또는 사용자 드롭다운)
  - [x] 사용자 드롭다운 메뉴: 위시리스트, 구매 내역, 내 정보, 로그아웃
  - [x] 모바일 반응형 네비게이션 (햄버거 메뉴)
  - [x] 푸터: 이용약관, 개인정보처리방침, 라이선스 안내 링크
  - [x] 헤더 검색창 동작: Enter 또는 검색 버튼 클릭 시 `/search?q=키워드`로 이동

- [x] **Task 006: 랜딩 페이지 UI 구현** - 완료
  - [x] 히어로 섹션: 배경 이미지 + 중앙 검색창 (플레이스홀더 텍스트 포함)
  - [x] 인기 태그 퀵링크 섹션: 더미 태그 8~10개 (클릭 시 `/search?tag=태그`)
  - [x] 카테고리 퀵링크 섹션: 6개 카테고리 카드 (아이콘 + 이름, 클릭 시 `/search?category=슬러그`)
  - [x] 신규 이미지 갤러리: 최근 업로드 12장 그리드 (더미 데이터)
  - [x] 베스트셀러 이미지 갤러리: 판매 건수 기준 상위 12장 그리드 (더미 데이터)

- [x] **Task 007: 검색 결과 페이지 UI 구현** - 완료
  - [x] 검색 결과 헤더: 검색 키워드 표시, 총 결과 건수
  - [x] 필터 사이드바: 카테고리 체크박스, 방향 선택 (가로/세로/정방형), 가격 범위 필터
  - [x] 정렬 드롭다운: 관련도순, 최신순, 인기순
  - [x] 이미지 그리드: ImageCard 컴포넌트 활용, 위시리스트 버튼 포함
  - [x] 결과 없을 때 EmptyState 표시
  - [x] 모바일: 필터 사이드바를 Sheet 슬라이드 모달로 전환 (활성 필터 카운트 뱃지)

- [x] **Task 008: 이미지 상세 페이지 UI 구현** - 완료
  - [x] 워터마크 적용 대형 프리뷰 영역 (ProtectedImage 컴포넌트, 우클릭/드래그 방지)
  - [x] 메타데이터 표시 **(구매자 전용)**: 이미지 코드, 해상도, 파일 크기, 촬영 연월, 색상 태그 — 미구매자는 잠금 UI 표시 (F002)
  - [x] 크기 옵션 선택 UI (라디오): XL/L/M/S + 각 해상도/가격 표시 (F003)
  - [x] 라이선스 옵션 선택 UI (라디오): 스탠다드/확장 + 조건 요약 텍스트 (F003)
  - [x] 태그 목록: 클릭 시 `/search?q=태그`로 이동
  - [x] 관련 이미지 갤러리: 하단 동일 카테고리 기준 이미지 최대 8장
  - [x] 위시리스트 토글 버튼 (하트 아이콘, F008)
  - [x] "장바구니 추가" 버튼 (F004) + "즉시 결제" 버튼 (F005)
  - [x] 가격 계산 로직 UI 반영: basePrice 기준 크기별 비율 적용, 확장 라이선스 배율 적용

- [x] **Task 009: 장바구니 페이지 UI 구현** - 완료
  - [x] 장바구니 아이템 목록: 썸네일, 이미지명, 선택한 크기/라이선스, 개별 가격
  - [x] 크기/라이선스 옵션 인라인 변경 드롭다운
  - [x] 개별 아이템 삭제 버튼 (확인 다이얼로그)
  - [x] 총 결제 금액 계산 및 표시
  - [x] "쇼핑 계속하기" 링크 (검색 페이지)
  - [x] "결제하기" 버튼
  - [x] 빈 장바구니 상태: 안내 메시지 + 검색 페이지 링크

- **Task 010: 인증 페이지 UI 구현 (회원가입/로그인)**
  - 회원가입 폼: 이메일, 비밀번호, 비밀번호 확인, 이름(선택), 국가(선택), 출생연도(선택), 약관 동의 체크박스 2개
  - 비밀번호 강도 표시 UI (Progress 바 + 텍스트)
  - 이메일 중복 확인 인라인 피드백 (더미)
  - 로그인 폼: 이메일, 비밀번호, 로그인 상태 유지 체크박스
  - 회원가입/로그인 페이지 간 전환 링크
  - Zod 4.x 기반 폼 유효성 검사 스키마 작성 (React Hook Form 연동)
  - 비밀번호 정책 표시: 최소 8자, 영문+숫자+특수문자

- **Task 011: 결제 페이지 및 결제 완료 페이지 UI 구현**
  - 결제 페이지: 주문 요약 (이미지 목록, 옵션, 개별 가격), 총 결제 금액, 결제 수단 선택 영역 (PG 위젯 placeholder), 구매 동의 체크박스, "결제하기" 버튼
  - 결제 완료 페이지: 성공 메시지 + 주문번호 표시, 구매 이미지 목록 (썸네일/이름/옵션), 이미지별 "다운로드" 버튼 (더미), 다운로드 안내 (3회 한도/7일 만료), 이메일 발송 완료 안내, "구매 내역으로 이동" 버튼, "홈으로" 버튼
  - 결제 실패 상태 UI: 에러 메시지 + 재시도 버튼

- **Task 012: 위시리스트 페이지 UI 구현**
  - 위시리스트 이미지 그리드: 썸네일, 이름, 기준 가격
  - 개별 제거 버튼 (하트 토글)
  - "장바구니 추가" 버튼 (옵션 선택 모달: 크기/라이선스 선택 후 추가)
  - 빈 위시리스트 상태: 안내 메시지 + 검색 페이지 링크

- **Task 013: 마이페이지 UI 구현 (구매 내역/내 정보)**
  - 마이페이지 탭 네비게이션 또는 사이드 메뉴: 구매 내역, 내 정보
  - 구매 내역 페이지: 주문 목록 (날짜/주문번호/결제 금액/상태), 주문 상세 아코디언 펼치기 (구매 이미지/옵션/가격), 이미지별 "다운로드" 버튼 (남은 횟수/만료일 표시), 만료 또는 한도 소진 시 "다운로드 불가" 표시
  - 내 정보 페이지: 이메일 표시 (수정 불가), 비밀번호 변경 폼 (현재 비밀번호 + 새 비밀번호 + 확인), 선택 정보 수정 (이름/국가/출생연도), "저장" 버튼

- **Task 014: 관리자 레이아웃 및 로그인 페이지 UI 구현**
  - 관리자 로그인 페이지: 이메일/비밀번호 입력, "관리자 로그인" 버튼 (일반 로그인 페이지와 완전 분리 디자인)
  - 관리자 공통 레이아웃: 사이드바 (대시보드/상품 관리/주문 관리/로그아웃), 상단 헤더 (관리자 이름/로그아웃)
  - 관리자 레이아웃 반응형: 모바일에서 사이드바 접힘 처리

- **Task 015: 관리자 대시보드 UI 구현**
  - 매출 요약 카드 4종: 오늘 매출, 이번 주 매출, 이번 달 매출, 총 판매 건수
  - 최근 주문 목록 테이블 (최근 10건, 더미 데이터)
  - 인기 상품 TOP 10 리스트 (판매 건수 기준, 더미 데이터)
  - 일별/월별 매출 추이 차트 (Recharts, 더미 데이터)
  - 빠른 이동 링크: 상품 관리, 주문 관리

- **Task 016: 관리자 상품 관리 페이지 UI 구현**
  - 상품 목록 테이블: 썸네일, 이름, 카테고리, 기준 가격, 등록일, 활성화 상태, 이미지 처리 상태 배지 (PENDING/PROCESSING/COMPLETED/FAILED)
  - 검색/필터: 카테고리 필터, 활성화 여부 필터
  - "신규 등록" 버튼 -> 업로드 모달/폼: 원본 이미지 파일 드래그앤드롭, 이름, 설명, 카테고리 선택, 다중 태그 입력, 색상 태그 입력, 기준 가격
  - 수정 버튼 -> 수정 모달/폼: 메타데이터만 수정 (이미지 파일 제외)
  - 삭제 버튼 (확인 다이얼로그, "소프트 삭제됩니다" 안내)
  - 활성화/비활성화 토글 스위치
  - 페이지네이션

- **Task 017: 관리자 주문 관리 페이지 UI 구현**
  - 주문 목록 테이블: 주문번호, 이메일, 결제 금액, 주문일, 상태, 다운로드 현황
  - 검색: 주문번호, 이메일, 날짜 범위 (DatePicker)
  - 주문 상세 모달: 구매 이미지/옵션/결제 정보/거래 로그
  - "이메일 재발송" 버튼 (더미)
  - 다운로드 횟수/만료 초기화 버튼 (더미)
  - 페이지네이션

- **Task 018: 약관/정책 정적 페이지 UI 구현**
  - 이용약관 페이지 (정적 콘텐츠 마크다운 렌더링)
  - 개인정보처리방침 페이지
  - 라이선스 안내 페이지: 스탠다드/확장 라이선스 조건 비교 테이블

---

### Phase 3: 인증 시스템 구현

> NextAuth.js 인증 시스템을 구현하여 실제 로그인/회원가입 기반 동작을 완성한다.

- **Task 019: NextAuth.js v5 인증 시스템 구현** - 우선순위
  - NextAuth.js v5 (Auth.js) 설치 및 설정
  - @auth/prisma-adapter 연동
  - Credentials Provider 구현: 이메일/비밀번호 인증 (bcryptjs saltRounds 12)
  - JWT 세션 전략 설정 (httpOnly + secure + sameSite=strict 쿠키)
  - 구매자 회원가입 Server Action 구현 (Zod 스키마 검증)
  - 구매자 로그인/로그아웃 Server Action 구현
  - 관리자 인증 분리: /admin 경로 전용 인증 로직 (ADMIN 역할 검증)
  - 관리자 IP 화이트리스트: ADMIN_ALLOWED_IPS 환경변수 기반 CIDR 검증
  - 미들웨어 인증 설정: 보호 경로 (/mypage, /wishlist, /checkout, /admin) 리디렉션
  - 다중 레이어 인증: Server Action/API Route 내부에서도 세션/권한 재검증
  - Playwright MCP를 활용한 인증 플로우 E2E 테스트

---

### Phase 4: 핵심 API 및 비즈니스 로직 구현

> 더미 데이터를 실제 API 호출로 교체하고, 핵심 비즈니스 로직을 완성한다.

- **Task 020: BullMQ 및 Redis 초기 설정**
  - BullMQ 설치 및 Redis 연결 설정 (Docker Compose의 Redis 인스턴스 활용)
  - 큐 생성 유틸리티: 이미지 처리 큐, 이메일 발송 큐
  - 워커 기본 구조: 큐별 워커 팩토리, Graceful Shutdown 공통 로직
  - 재시도 전략 공통 설정: 최대 3회, 지수 백오프, Dead Letter Queue 구조
  - BullMQ Dashboard (Bull Board) 개발 환경 설정 (선택)

- **Task 021: 이미지 검색 API 구현 (F001)** - 우선순위
  - 검색 API 엔드포인트: 키워드 (PostgreSQL Full-Text Search + trigram), 태그 필터, 카테고리 필터, 색상 필터, 방향 필터
  - 정렬: 최신순 (createdAt), 인기순 (salesCount), 가격 낮은순/높은순 (basePrice)
  - 커서 기반 무한스크롤 페이지네이션 (limit + cursor)
  - 검색 결과 건수 반환
  - isActive=true, processingStatus=COMPLETED 필터 적용
  - TanStack Query로 검색 결과 캐싱 및 무한 쿼리 연동
  - 더미 데이터를 실제 API 호출로 교체 (검색 결과 페이지, 랜딩 페이지 갤러리)
  - Playwright MCP를 활용한 검색 기능 E2E 테스트

- **Task 022: 이미지 상세 조회 및 관련 이미지 API 구현 (F002, F003)**
  - 이미지 상세 조회 API: 메타데이터, 크기별 해상도/파일크기/가격, 라이선스 옵션
  - 관련 이미지 API: 동일 카테고리/태그 기준 8건 추천
  - 가격 계산 서버 로직: SystemConfig 기반 크기별 비율/라이선스 배율 적용
  - 이미지 상세 페이지 더미 데이터를 실제 API로 교체
  - Playwright MCP를 활용한 이미지 상세 페이지 E2E 테스트

- **Task 023: 이미지 서빙 API Route 구현 (F017)**
  - 썸네일 API Route: `/api/images/thumbnail/[imageId]` (인증 불필요, Cache-Control: public, max-age=86400, immutable)
  - 워터마크 프리뷰 API Route: `/api/images/preview/[imageId]` (인증 불필요, Cache-Control: public, max-age=3600)
  - 원본 파일 API Route: `/api/admin/images/[imageId]/original` (세션 + ADMIN 역할 검증)
  - Path Traversal 방어: UUID v4 정규식 검증 + STORAGE_ROOT 경계 확인
  - 이미지 보호: Referrer-Policy 헤더 적용
  - 서빙 모드 분기: 로컬 개발은 API Route 직접 스트리밍, 프로덕션은 X-Accel-Redirect 헤더로 Nginx 위임 (환경변수 기반 분기)
  - Playwright MCP를 활용한 이미지 서빙 테스트

- **Task 024: 장바구니 서버 동기화 및 병합 구현 (F004)**
  - 서버 장바구니 CRUD Server Action: 추가, 삭제, 옵션 변경, 조회
  - 로그인 시 로컬-서버 장바구니 병합 로직: 동일 imageId+size+licenseType은 로컬 우선, 그 외 합산
  - 병합 후 서버에서 현재 가격 재계산, 가격 변경 아이템 알림 반환
  - 병합 완료 후 localStorage 장바구니 초기화
  - 결제 시 서버에서 가격 재검증 유틸리티
  - Playwright MCP를 활용한 장바구니 병합 E2E 테스트

- **Task 025: 위시리스트 API 구현 (F008)**
  - 위시리스트 토글 Server Action: 추가/제거 (userId+imageId 유니크)
  - 위시리스트 목록 조회 API (TanStack Query 캐싱)
  - 위시리스트 페이지 더미 데이터를 실제 API로 교체
  - 이미지 상세 페이지/검색 결과의 위시리스트 상태 연동
  - Playwright MCP를 활용한 위시리스트 E2E 테스트

- **Task 026: 마이페이지 API 구현 (F011)**
  - 구매 내역 조회 API: 주문 목록 + 주문 상세 (OrderItem 포함)
  - 다운로드 링크 상태 조회: 남은 횟수, 만료일, 유효 여부
  - 비밀번호 변경 Server Action (현재 비밀번호 확인 + bcryptjs)
  - 프로필 정보 수정 Server Action (이름/국가/출생연도)
  - 마이페이지 더미 데이터를 실제 API로 교체
  - Playwright MCP를 활용한 마이페이지 E2E 테스트

---

### Phase 5: 관리자 기능 및 이미지 처리

> 관리자가 상품을 관리하고 자동 이미지 처리 파이프라인이 동작하도록 한다. 결제할 상품이 먼저 존재해야 하므로 결제 시스템보다 선행한다.

- **Task 027: 자동 이미지 처리 파이프라인 구현 (F014)** - 우선순위
  - Sharp 0.34.x 설치 및 설정: limitInputPixels(300_000_000), concurrency(SHARP_CONCURRENCY 환경변수)
  - 이미지 업로드 원자적 순서: DB 레코드 PENDING 생성 -> 원본 파일 디스크 저장 -> BullMQ 작업 등록
  - 이미지 처리 BullMQ 워커: XL/L/M/S 비동기 리사이징, 워터마크 합성, 로컬 디스크 저장
  - 출력 포맷: 다운로드용 JPEG (quality: 90), 썸네일 WebP (quality: 85)
  - EXIF 메타데이터 제거: `.withMetadata(false)` 모든 출력에 적용
  - 처리 상태 관리: PENDING -> PROCESSING -> COMPLETED / FAILED
  - 실패 시 Cleanup: 로컬 파일 삭제 + DB 상태 FAILED 업데이트
  - 재시도 전략: 최대 3회, 지수 백오프, 영구 실패 시 Dead Letter Queue 이동
  - Graceful Shutdown: 워커 종료 시 진행 중인 작업 완료 후 종료
  - 업로드 허용 포맷: JPEG, PNG, TIFF (Zod 검증)
  - 로컬 저장 디렉토리 구조: originals/, downloads/, watermarks/, thumbnails/

- **Task 028: 관리자 상품 관리 API 및 연동 (F013)**
  - 상품 CRUD Server Action: 등록 (이미지 업로드 + 메타데이터), 수정 (메타데이터만), 소프트 삭제 (isActive=false)
  - 상품 목록 조회 API: 필터 (카테고리, 활성화 여부), 페이지네이션
  - 활성화/비활성화 토글 Server Action
  - 이미지 업로드 처리: Next.js body 크기 제한 조정 (50MB), FormData 처리
  - 관리자 상품 관리 페이지 더미 데이터를 실제 API로 교체
  - 이미지 처리 상태 배지 실시간 표시 (TanStack Query 폴링)
  - 소프트 삭제 파일 정리 Cron: isActive=false인 이미지의 모든 OrderItem.expiresAt 경과 확인 후 물리적 파일 삭제 스케줄러 구현
  - Playwright MCP를 활용한 상품 관리 E2E 테스트

- **Task 029: 관리자 주문 관리 API 및 연동 (F015)**
  - 주문 목록 조회 API: 검색 (주문번호, 이메일), 날짜 범위 필터, 페이지네이션
  - 주문 상세 조회 API: 주문아이템 + 거래 로그 포함
  - 이메일 재발송 Server Action: BullMQ를 통한 다운로드 링크 이메일 재전송
  - 다운로드 횟수/만료 초기화 Server Action (관리자 전용)
  - 관리자 주문 관리 페이지 더미 데이터를 실제 API로 교체
  - Playwright MCP를 활용한 주문 관리 E2E 테스트

- **Task 030: 관리자 대시보드 통계 API 및 연동 (F016)**
  - 매출 통계 API: 오늘/이번 주/이번 달 매출 집계
  - 총 판매 건수 API
  - 최근 주문 목록 API (최근 10건)
  - 인기 상품 TOP 10 API (salesCount 기준)
  - 일별/월별 매출 추이 API (Recharts 데이터 포맷)
  - 관리자 대시보드 더미 데이터를 실제 API로 교체
  - Playwright MCP를 활용한 대시보드 통계 E2E 테스트

---

### Phase 6: 결제 및 다운로드 시스템

> 결제 연동, 보안 다운로드, 이메일 전송 등 매출과 직결되는 핵심 트랜잭션 기능을 구현한다. Phase 5에서 등록된 실제 이미지 상품을 기반으로 결제 테스트를 진행한다.

- **Task 031: 결제 시스템 연동 (F005)** - 우선순위
  - 포트원 v2 또는 토스페이먼츠 SDK 설치 및 설정
  - 주문 생성 Server Action: PENDING 상태 주문 생성, idempotencyKey 발급, 서버 측 금액 계산 (SystemConfig 기준)
  - 클라이언트 PG 위젯 통합: 결제 페이지에 PG 결제 위젯 렌더링
  - PG사 콜백 리디렉션 처리: 결제 완료 페이지로 이동
  - 웹훅 수신 API: `/api/webhooks/payment` (IP 화이트리스트 + 서명 검증)
  - 웹훅 멱등성 가드: 주문 상태 COMPLETED면 즉시 200 응답 후 스킵
  - 결제 완료 처리: 주문 상태 COMPLETED 변경, TransactionLog PAYMENT 기록
  - 서버 사이드 금액 검증: 클라이언트 금액과 서버 재계산 금액 일치 확인
  - Playwright MCP를 활용한 결제 플로우 E2E 테스트

- **Task 032: 보안 파일 다운로드 구현 (F006)**
  - 결제 완료 시 UUID 토큰 기반 보안 다운로드 링크 생성 (OrderItem별)
  - 다운로드 API Route: `/api/downloads/[downloadToken]`
  - 다운로드 검증: 토큰 유효성, 횟수 제한 (3회), 만료일 검증 (7일)
  - Prisma 원자적 업데이트: `downloadCount: { increment: 1 }` (Race Condition 방지)
  - fs.createReadStream 스트리밍 응답 + 적절한 Content-Disposition 헤더
  - 다운로드 IP/UA TransactionLog DOWNLOAD 기록
  - 응답 헤더: Referrer-Policy: no-referrer, Cache-Control: private, no-store
  - 결제 완료 페이지/마이페이지 다운로드 버튼 실제 연동
  - Playwright MCP를 활용한 다운로드 플로우 E2E 테스트

- **Task 033: 이메일 전송 워커 구현 (F007)**
  - 이메일 전송 큐 워커: 결제 완료 이메일 (구매 확인 + 다운로드 링크)
  - AWS SES 연동: 이메일 템플릿 작성 (구매 확인, 관리자 로그인 알림)
  - 이메일 발송 워커: 실패 시 자동 재시도 (최대 3회, 지수 백오프)
  - 실패 시 TransactionLog FAILURE 기록 (이메일 실패가 주문 상태에 영향 없음)
  - 관리자 로그인 알림 이메일: 로그인 성공 시 IP/UA/시각 포함 이메일 발송

---

### Phase 7: 보안 강화, 캐싱, 통합 테스트

> 보안 정책 적용, 성능 최적화, 전체 사용자 플로우 통합 테스트를 수행한다.

- **Task 034: 보안 미들웨어 및 Rate Limiting 구현** - 우선순위
  - Rate Limiting 구현: 로그인 시도 (5회/분), 결제 요청 (3회/분), 다운로드 요청 (10회/분)
  - CORS 정책 설정: 결제 웹훅은 PG사 도메인/IP만 허용, 일반 API는 서비스 도메인만 허용
  - Redis 기반 세션 블록리스트: 강제 로그아웃 시 JWT 토큰 즉시 무효화
  - 입력 검증 미들웨어: 모든 API Route에서 Zod 스키마 검증 일괄 적용
  - 헬스체크 엔드포인트: `/api/health` (DB 연결, Redis 연결, 디스크 공간 체크)
  - Playwright MCP를 활용한 보안 정책 테스트

- **Task 035: Redis 캐싱 전략 구현**
  - Redis 캐싱 레이어 구현: 카테고리 목록 (TTL 1시간), 랜딩 베스트셀러 TOP 12 (TTL 10분), 검색 결과 동일 쿼리 (TTL 5분), SystemConfig 전체 (TTL 5분)
  - 캐시 무효화 전략: 상품 등록/수정/삭제 시 관련 캐시 무효화
  - HTTP 응답 캐시 헤더 정책 적용: 정적 자산 (max-age=31536000, immutable)

- **Task 036: 전체 사용자 플로우 통합 테스트**
  - Playwright MCP를 사용한 구매자 전체 여정 E2E 테스트: 검색 -> 상세 -> 장바구니 -> 결제 -> 다운로드
  - 구매자 인증 플로우 테스트: 회원가입 -> 로그인 -> 마이페이지
  - 관리자 전체 여정 E2E 테스트: 로그인 -> 상품 등록 -> 이미지 처리 확인 -> 주문 관리
  - 에러 핸들링 테스트: 결제 실패, 다운로드 만료, 잘못된 입력
  - 엣지 케이스 테스트: 동시 다운로드 요청, 장바구니 병합 충돌, 가격 변경 시나리오
  - 반응형 UI 테스트: 모바일/태블릿/데스크톱 뷰포트

---

### Phase 8: 배포 및 인프라

> AWS 인프라 구축, CI/CD 파이프라인 설정, 프로덕션 배포를 완료한다.

- **Task 037: AWS 인프라 구축 및 배포 설정** - 우선순위
  - EC2 인스턴스 설정: Node.js 런타임, PM2 프로세스 관리 (pm2-logrotate: max_size 50M, retain 7)
  - EBS 볼륨 설정: `/data/jiangs-storage/` 디렉토리 구조 생성 (originals/, downloads/, watermarks/, thumbnails/)
  - 파일 시스템 권한 설정: originals/ chmod 700
  - RDS PostgreSQL 16 인스턴스 설정
  - ElastiCache Redis 설정 (RDB + AOF 영속성 활성화)
  - ALB + ACM 인증서 설정 (HTTPS/TLS 종료)
  - AWS SES 도메인 인증 및 설정
  - CloudWatch 모니터링: EBS 디스크 사용률 80% 임계값 SNS 경보
  - Nginx 리버스 프록시 설정: client_max_body_size 50m, X-Accel-Redirect 썸네일 서빙, `valid_referers` 디렉티브로 Hotlinking 방지 (서비스 도메인만 허용)
  - 보안 그룹 설정: EC2(ALB만 허용), RDS(EC2만 허용), ElastiCache(EC2만 허용), ALB(0.0.0.0/0)
  - SSH 접근: 특정 관리자 IP만 허용

- **Task 038: CI/CD 파이프라인 및 백업 전략 구현**
  - GitHub Actions CI 파이프라인: lint, typecheck, build, Playwright 테스트
  - GitHub Actions CD 파이프라인: main 브랜치 머지 시 EC2 자동 배포
  - EBS 스냅샷 매일 자동 생성 (증분 방식, RTO 4시간 이내)
  - S3 백업: 매일 cron `aws s3 sync` -> Glacier Deep Archive (썸네일 제외)
  - 환경변수 관리: `.env.production` 설정 (STORAGE_ROOT, SHARP_CONCURRENCY, ADMIN_ALLOWED_IPS 등)
  - 프로덕션 Seed 실행: 카테고리, SystemConfig, 관리자 계정

- **Task 039: 프로덕션 최종 점검 및 런칭**
  - 프로덕션 환경 전체 동작 확인
  - 결제 테스트 (PG사 테스트 모드 -> 라이브 모드 전환)
  - 이미지 업로드/처리/다운로드 전체 플로우 검증
  - 보안 점검: Rate Limiting, CORS, CSRF, Path Traversal 방어 확인
  - 성능 점검: 이미지 서빙 응답 시간, 검색 쿼리 성능
  - 도메인 연결 및 SSL 인증서 확인
  - 모니터링 알림 동작 확인 (CloudWatch, 디스크 사용률)
