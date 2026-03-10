# Task 002: TypeScript 타입 정의 및 인터페이스 설계

## 상태: 완료

## 설명

JiangsStock 스톡 이미지 판매 플랫폼을 위한 TypeScript 타입 시스템을 구축합니다.
도메인별 타입 파일, Zod 폼 스키마, 가격 상수, 환경변수 검증을 포함합니다.

## 관련 파일

- `src/types/enums.ts` - 모든 Enum 타입 정의
- `src/types/models.ts` - DB 모델 기반 인터페이스
- `src/types/api.ts` - API 요청/응답 타입
- `src/types/forms.ts` - Zod 폼 스키마 및 infer 타입
- `src/types/cart.ts` - 로컬 장바구니 타입
- `src/types/index.ts` - 전체 타입 re-export
- `src/lib/constants.ts` - 가격 상수 및 설정값
- `src/lib/env.ts` - 환경변수 Zod 검증 (수정)
- `env.d.ts` - 환경변수 TypeScript 타입 선언

## 수락 기준

- [x] 8개 Enum 타입이 모두 정의되고 export된다
- [x] 10개 데이터 모델 인터페이스가 PRD 명세와 일치한다 (M1/M2/M3 반영)
- [x] API 요청/응답 타입이 정의된다
- [x] 5개 Zod 폼 스키마가 정의되고 타입이 infer된다
- [x] 로컬 장바구니 타입이 정의된다
- [x] src/lib/constants.ts에 가격 상수가 매직 넘버 없이 정의된다
- [x] env.d.ts와 src/lib/env.ts가 플랫폼 전체 환경변수를 포함한다
- [x] TypeScript 타입 에러가 없다
- [x] ESLint 검사를 통과한다
- [x] `npm run check-all`이 통과한다

## 구현 단계

### 1단계: Enum 타입 정의

- [x] `src/types/enums.ts` 생성
- [x] UserRole, Orientation, ImageSize, LicenseType 정의
- [x] OrderStatus, ProcessingStatus, TransactionAction, TransactionStatus 정의

### 2단계: 데이터 모델 및 API 타입 정의

- [x] `src/types/models.ts` 생성 (User, Image, Category, Order, OrderItem, Wishlist, Cart, CartItem, TransactionLog, SystemConfig)
- [x] `src/types/api.ts` 생성 (SearchParams, PaginationMeta, ApiResponse, ApiError, PriceOption 등)
- [x] `src/types/cart.ts` 생성 (LocalCartItem, LocalCart, CartMergeResult)

### 3단계: Zod 폼 스키마 정의

- [x] `src/types/forms.ts` 생성
- [x] signupSchema, loginSchema 정의
- [x] productSchema, productUpdateSchema 정의
- [x] passwordChangeSchema, profileUpdateSchema 정의

### 4단계: 상수 및 환경변수 정의

- [x] `src/lib/constants.ts` 생성 (SIZE_RATIOS, 다운로드 상수, 이미지 처리 상수 등)
- [x] `src/types/index.ts` 생성 (전체 re-export)
- [x] `env.d.ts` 생성 (ProcessEnv 타입 선언)
- [x] `src/lib/env.ts` 수정 (Zod 스키마 확장)
- [x] `npm run check-all` 통과 확인
- [x] ROADMAP.md Task 002 완료 표시

## 변경 사항 요약

### 신규 생성 파일

- `src/types/enums.ts` - 8개 Enum string union 타입
- `src/types/models.ts` - 10개 DB 모델 인터페이스 + 보조 타입 (SizeMetadata, FileSizes, TransactionDetails)
- `src/types/api.ts` - SearchParams, PaginationMeta, ApiResponse, ApiError, PriceOption, ImageListResponse, ImageDetailResponse
- `src/types/forms.ts` - 6개 Zod 스키마 + 6개 infer 타입
- `src/types/cart.ts` - LocalCartItem, LocalCart, CartMergeResult
- `src/types/index.ts` - 전체 타입 re-export
- `src/lib/constants.ts` - SIZE_RATIOS, 이미지/다운로드/Sharp 상수, CATEGORIES
- `env.d.ts` - NodeJS.ProcessEnv 인터페이스 확장

### 수정 파일

- `src/lib/env.ts` - Zod 스키마 14개 변수로 확장, SKIP_ENV_VALIDATION 옵션 추가
