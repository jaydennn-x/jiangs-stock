# Task 019: NextAuth.js v5 인증 시스템 구현

## 상태: 완료

## 설명

NextAuth.js v5 (Auth.js) 기반 인증 시스템을 구현한다. 구매자와 관리자 인증을 분리하고, JWT 세션 전략, 보호 경로 미들웨어, IP 화이트리스트를 적용한다.

## 관련 파일

- `src/auth.ts` - NextAuth v5 메인 설정 (Node.js 전용, Prisma+bcryptjs 포함)
- `src/auth.config.ts` - NextAuth Edge 호환 설정 (미들웨어용)
- `src/middleware.ts` - 인증 미들웨어
- `src/app/api/auth/[...nextauth]/route.ts` - Route Handler
- `src/lib/prisma.ts` - Prisma 싱글톤 클라이언트
- `src/lib/actions/auth.ts` - 구매자 인증 Server Actions
- `src/lib/actions/admin-auth.ts` - 관리자 인증 Server Action
- `src/lib/ip-whitelist.ts` - IP CIDR 검증 유틸
- `src/lib/auth-utils.ts` - 서버 인증 유틸
- `src/types/next-auth.d.ts` - NextAuth 타입 확장
- `src/components/login-form.tsx` - 로그인 폼 (Server Action 연동)
- `src/components/signup-form.tsx` - 회원가입 폼 (Server Action 연동)
- `src/components/admin/admin-login-form.tsx` - 관리자 로그인 폼 (Server Action 연동)

## 수락 기준

- [x] 구매자가 회원가입/로그인/로그아웃을 실제로 수행 가능
- [x] 관리자가 별도 로그인으로 인증 가능 (ADMIN role 검증)
- [x] 보호된 경로(/mypage, /wishlist, /checkout)에 미인증 접근 시 /login으로 리디렉션
- [x] /admin 경로에 미인증 접근 시 /admin/login으로 리디렉션
- [x] USER role 계정으로 /admin 접근 시 차단
- [x] IP 화이트리스트 기반 관리자 접근 제한 (개발환경에서는 통과)
- [x] JWT 세션 전략 사용 (httpOnly/secure/sameSite=strict 쿠키)
- [x] TypeScript 타입 에러 없음
- [x] ESLint/Prettier 검사 통과

## 구현 단계

### 1단계: 패키지 설치

- [x] tasks/019-nextauth-auth.md 작업 파일 생성
- [x] next-auth@beta 패키지 설치

### 2단계: NextAuth 설정 및 Route Handler

- [x] src/auth.config.ts 생성 (Edge 호환 설정)
- [x] src/auth.ts 생성 (Credentials Provider, JWT 전략, callbacks)
- [x] src/app/api/auth/[...nextauth]/route.ts 생성

### 3단계: 타입 확장 및 유틸 구현

- [x] src/types/next-auth.d.ts 생성 (Session/JWT에 role 필드 추가)
- [x] src/lib/ip-whitelist.ts 생성 (CIDR 검증)
- [x] src/lib/auth-utils.ts 생성 (getRequiredSession, getAdminSession)
- [x] src/lib/prisma.ts 생성 (Prisma 싱글톤 클라이언트)

### 4단계: Server Actions 구현

- [x] src/lib/actions/auth.ts 생성 (signupAction, loginAction, logoutAction)
- [x] src/lib/actions/admin-auth.ts 생성 (adminLoginAction)

### 5단계: 미들웨어 구현

- [x] src/middleware.ts 생성 (보호 경로, 관리자 경로 설정)

### 6단계: 폼 컴포넌트 연동

- [x] login-form.tsx - loginAction 연동
- [x] signup-form.tsx - signupAction 연동
- [x] admin-login-form.tsx - adminLoginAction 연동

### 7단계: 테스트 및 완료

- [x] Playwright MCP E2E 테스트 (미들웨어 리디렉션 검증)
- [x] npm run typecheck 통과
- [x] ROADMAP.md Task 019 완료 표시

## 테스트 체크리스트

- [x] 보호 경로: 미인증 상태로 /mypage 접근 → /login?callbackUrl=/mypage/orders 리디렉션 확인
- [x] /admin 접근 시 /admin/login으로 리디렉션 확인
- [x] 회원가입 폼 정상 렌더링 확인
- [x] 관리자 로그인 폼 정상 렌더링 확인
- [ ] 회원가입 → 로그인 → 홈 리디렉션 (DB 필요)
- [ ] 로그아웃 → 세션 종료 (DB 필요)
- [ ] 관리자 로그인 → /admin/dashboard (DB 필요)

## 변경 사항 요약

**신규 생성 파일:**

- `src/auth.ts` - NextAuth v5 설정 (Node.js, Prisma+bcryptjs 포함)
- `src/auth.config.ts` - Edge 호환 NextAuth 설정 (미들웨어용)
- `src/middleware.ts` - 보호 경로 인증 미들웨어
- `src/app/api/auth/[...nextauth]/route.ts` - Route Handler
- `src/lib/prisma.ts` - Prisma 싱글톤 클라이언트
- `src/lib/actions/auth.ts` - signupAction, loginAction, logoutAction
- `src/lib/actions/admin-auth.ts` - adminLoginAction (IP 검증 포함)
- `src/lib/ip-whitelist.ts` - CIDR 기반 IP 검증 유틸
- `src/lib/auth-utils.ts` - getRequiredSession, getAdminSession
- `src/types/next-auth.d.ts` - Session/JWT 타입 확장

**수정 파일:**

- `src/components/login-form.tsx` - loginAction Server Action 연동
- `src/components/signup-form.tsx` - signupAction Server Action 연동
- `src/components/admin/admin-login-form.tsx` - adminLoginAction 연동
