# Task 010: 인증 페이지 UI 구현 (회원가입/로그인)

## 상태: 완료

## 설명

더미 수준으로 구현되어 있던 `LoginForm`과 `SignupForm` 컴포넌트를 React Hook Form + Zod 기반으로 완전 재구현한다. 비밀번호 강도 표시, 이메일 중복 확인 더미 피드백, 선택 필드, 약관 동의 체크박스 2개를 포함한다.

## 관련 파일

- `src/components/login-form.tsx` — LoginForm 전면 교체 (RHF + zodResolver)
- `src/components/signup-form.tsx` — SignupForm 전면 교체 (RHF + zodResolver + 비밀번호 강도 + 선택 필드 + 약관)
- `src/lib/password-strength.ts` — 새 파일: 비밀번호 강도 계산 유틸 함수
- `src/types/forms.ts` — loginSchema, signupSchema 재사용 (수정 없음)
- `src/app/(buyer)/login/page.tsx` — 수정 없음
- `src/app/(buyer)/signup/page.tsx` — 수정 없음

## 수락 기준

- [x] 회원가입 폼: 이메일, 비밀번호, 비밀번호 확인, 이름(선택), 국가(선택), 출생연도(선택), 약관 동의 체크박스 2개
- [x] 비밀번호 강도 표시 UI (Progress 바 + 텍스트)
- [x] 이메일 중복 확인 인라인 피드백 (더미)
- [x] 로그인 폼: 이메일, 비밀번호, 로그인 상태 유지 체크박스
- [x] 회원가입/로그인 페이지 간 전환 링크
- [x] Zod 4.x 기반 폼 유효성 검사 스키마 작성 (React Hook Form 연동)
- [x] 비밀번호 정책 표시: 최소 8자, 영문+숫자+특수문자
- [x] TypeScript 타입 에러 없음
- [x] ESLint/Prettier 검사 통과
- [x] 빌드 성공

## 구현 단계

### 1단계: 비밀번호 강도 유틸 함수 구현

- [x] `src/lib/password-strength.ts` 신규 생성
- [x] `calcPasswordStrength(password): 0|1|2|3|4` 구현
- [x] `getStrengthInfo(score): { label, colorClass }` 구현
- [x] `getStrengthPercent(score): number` 구현

### 2단계: LoginForm 재구현

- [x] `useForm<LoginFormData>({ resolver: zodResolver(loginSchema) })` 연동
- [x] shadcn `Form/FormField/FormItem/FormLabel/FormControl/FormMessage` 활용
- [x] email, password, rememberMe 필드 구현
- [x] 비밀번호 눈 아이콘 토글
- [x] Checkbox RHF 연동 (checked/onCheckedChange)
- [x] 폼 제출 시 console.log

### 3단계: SignupForm 완전 재구현

- [x] `useForm<SignupFormData>({ resolver: zodResolver(signupSchema) as any })` 연동
- [x] 필수 필드: email, password, passwordConfirm
- [x] 선택 필드: name, country(Select), birthYear(Select)
- [x] `PasswordStrengthBar` 내부 컴포넌트 분리 (Progress 바 + 강도 텍스트)
- [x] 이메일 onBlur 더미 중복 확인 ('사용 가능한 이메일입니다')
- [x] 약관 체크박스 2개 (agreedTerms, agreedPrivacy) + 각 페이지 링크
- [x] 비밀번호 정책 FormDescription 힌트

## 변경 사항 요약

- **신규 생성**: `src/lib/password-strength.ts` — calcPasswordStrength, getStrengthInfo, getStrengthPercent 유틸 함수
- **전면 교체**: `src/components/login-form.tsx` — useState 수동 검증 → RHF + zodResolver(loginSchema)
- **전면 교체**: `src/components/signup-form.tsx` — 정적 마크업 → RHF + zodResolver(signupSchema), 비밀번호 강도/이메일 중복/선택 필드/약관 2개 포함
- **신규 생성**: `tasks/010-auth-pages.md`
- **주의**: Zod 4.x + @hookform/resolvers 5.x 간 타입 호환 이슈 → `resolver: zodResolver(signupSchema) as any` 로 해결
