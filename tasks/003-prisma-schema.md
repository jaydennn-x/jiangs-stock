# Task 003: Prisma 스키마 설계, 마이그레이션, Seed 실행

## 상태: 완료

## 설명

Prisma ORM을 설치하고, JiangsStock 플랫폼의 전체 데이터베이스 스키마를 작성합니다.
PostgreSQL 16 + Redis 7 로컬 개발 환경을 Docker Compose로 구성하고, 마이그레이션과 Seed를 실행합니다.

## 관련 파일

- `prisma/schema.prisma` - 전체 데이터 모델 스키마 (8 Enum + 10 Model)
- `prisma/seed.ts` - Seed 스크립트
- `prisma/migrations/20260310072502_init/migration.sql` - 초기 마이그레이션
- `prisma/migrations/20260310072508_add_search_indexes/migration.sql` - Raw SQL 인덱스
- `prisma.config.ts` - Prisma 7.x 설정 파일
- `docker-compose.yml` - PostgreSQL 16 + Redis 7 서비스
- `.env.example` - 환경변수 예시
- `.env.local` - 로컬 개발 환경변수
- `src/generated/prisma/` - Prisma 생성 클라이언트 (자동 생성)
- `eslint.config.mjs` - ESLint flat config 수정 (FlatCompat 제거)

## 수락 기준

- [x] Prisma 스키마 검증 통과 (`npx prisma validate`)
- [x] 마이그레이션 모두 Applied 상태
- [x] GIN 인덱스(tags, colorTags, search_vector)와 tsvector 트리거 적용
- [x] Seed 실행 성공 (카테고리 6, SystemConfig 7, 사용자 4, 이미지 30, 주문 5)
- [x] `npm run check-all` 통과

## 구현 단계

### 1단계: Docker Compose 및 환경변수 설정

- [x] `docker-compose.yml` 생성 (PostgreSQL 16-alpine, Redis 7-alpine, healthcheck)
- [x] `.env.example` 생성 (전체 환경변수 문서화)
- [x] `.env.local` 생성 (로컬 개발값)
- [x] `.gitignore`에 `/storage/` 추가

### 2단계: Prisma 설치 및 스키마 작성

- [x] `@prisma/client`, `prisma` 설치
- [x] `prisma init --datasource-provider postgresql` 실행
- [x] `prisma/schema.prisma` 작성 (8 Enum + 10 Model)
- [x] `package.json`에 prisma seed 설정 추가

### 3단계: 마이그레이션 및 Raw SQL 인덱스 적용

- [x] `prisma migrate dev --name init` 실행
- [x] `prisma migrate dev --create-only --name add_search_indexes` 실행
- [x] Raw SQL 작성: pg_trgm 확장, GIN 인덱스, tsvector 컬럼 + 트리거
- [x] `prisma migrate dev` 실행 (커스텀 마이그레이션 적용)
- [x] `prisma generate` 실행

### 4단계: Seed 스크립트 작성 및 실행

- [x] `bcryptjs`, `@types/bcryptjs`, `@prisma/adapter-pg`, `pg` 설치
- [x] `prisma/seed.ts` 작성 (함수 분리: seedCategories, seedSystemConfig, seedAdminUser, seedDummyUsers, seedDummyImages, seedDummyOrders)
- [x] `prisma.config.ts`에 `migrations.seed` 설정 추가
- [x] `npx prisma db seed` 실행 성공

### 5단계: 작업 파일 및 완료 처리

- [x] `tasks/003-prisma-schema.md` 생성
- [x] `docs/ROADMAP.md` Task 003 완료 표시
- [x] ESLint flat config 오류 수정 (FlatCompat → 직접 import)
- [x] `npm run check-all` 통과

## 테스트 체크리스트

- [x] `npx prisma validate` 통과
- [x] `npx prisma migrate status` - 2건 모두 Applied
- [x] DB 직접 확인: search_vector 컬럼, GIN 인덱스 3개, 트리거 존재
- [x] `npx prisma db seed` 성공
- [x] DB 데이터 확인: Category 6, SystemConfig 7, User 4, Image 30, Order 5

## 변경 사항 요약

| 파일                                                                | 변경                                                         |
| ------------------------------------------------------------------- | ------------------------------------------------------------ |
| `prisma/schema.prisma`                                              | 신규 생성 - 8 Enum, 10 Model                                 |
| `prisma/seed.ts`                                                    | 신규 생성 - Seed 스크립트                                    |
| `prisma/migrations/20260310072502_init/migration.sql`               | 자동 생성                                                    |
| `prisma/migrations/20260310072508_add_search_indexes/migration.sql` | 신규 생성 - Raw SQL                                          |
| `prisma.config.ts`                                                  | 신규 생성 - Prisma 7.x 설정                                  |
| `docker-compose.yml`                                                | 신규 생성                                                    |
| `.env.example`                                                      | 신규 생성                                                    |
| `.env.local`                                                        | 신규 생성                                                    |
| `.gitignore`                                                        | `/storage/` 추가                                             |
| `package.json`                                                      | prisma seed 설정, bcryptjs/@prisma/adapter-pg/pg 패키지 추가 |
| `eslint.config.mjs`                                                 | FlatCompat 제거, flat config 직접 import로 변경              |
| `docs/ROADMAP.md`                                                   | Task 003 완료 표시                                           |
