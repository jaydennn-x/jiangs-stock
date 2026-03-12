# Task 023: 이미지 서빙 API Route 구현 (F017)

## 상태: 완료

## 설명

썸네일, 워터마크 프리뷰, 원본 이미지를 서빙하는 API Route를 구현한다. Prisma DB에서 파일 경로를 조회하여 Path Traversal을 방어하고, 개발환경은 직접 스트리밍, 프로덕션은 X-Accel-Redirect(Nginx 위임) 방식으로 서빙한다.

## 관련 파일

- `src/lib/image-serving.ts` - 공통 파일 스트리밍 유틸 (serveFile, getContentType)
- `src/app/api/images/thumbnail/[imageId]/route.ts` - 썸네일 서빙 API
- `src/app/api/images/preview/[imageId]/route.ts` - 워터마크 프리뷰 서빙 API
- `src/app/api/admin/images/[imageId]/original/route.ts` - 원본 파일 서빙 API (ADMIN 전용)
- `src/app/(buyer)/images/[id]/page.tsx` - watermarkUrl → /api/images/preview/${id} 교체

## 수락 기준

- [x] GET /api/images/thumbnail/[imageId] → 썸네일 이미지 스트리밍 (인증 불필요)
- [x] GET /api/images/preview/[imageId] → 워터마크 프리뷰 스트리밍 (인증 불필요)
- [x] GET /api/admin/images/[imageId]/original → 원본 파일 스트리밍 (ADMIN 전용)
- [x] Path Traversal 방어: DB 경로 조회 + STORAGE_ROOT 경계 확인
- [x] Referrer-Policy: no-referrer 헤더 적용
- [x] 개발: fs.createReadStream 스트리밍, 프로덕션: X-Accel-Redirect
- [x] 이미지 상세 페이지 watermarkUrl → API URL 교체
- [x] npm run check-all 통과

## 구현 단계

### 1단계: 공통 유틸리티 및 썸네일/프리뷰 Route 구현

- [x] src/lib/image-serving.ts 생성 (serveFile, getContentType)
- [x] STORAGE_ROOT 경계 확인 (path.normalize 적용)
- [x] 개발/프로덕션 분기 (NODE_ENV 기반)
- [x] 썸네일 Route: Prisma thumbnailUrl 조회, Cache-Control: public, max-age=86400, immutable
- [x] 프리뷰 Route: Prisma watermarkUrl 조회, Cache-Control: public, max-age=3600

### 2단계: 관리자 원본 이미지 Route 구현

- [x] auth()로 세션 확인 → ADMIN 역할 검증 (401/403)
- [x] Prisma originalUrl 조회
- [x] Cache-Control: private, no-store

### 3단계: 이미지 상세 페이지 URL 교체

- [x] image.watermarkUrl → /api/images/preview/${id} 교체
- [x] ProtectedImage unoptimized 처리 기존 코드 활용

### 4단계: 검증 및 완료

- [x] npm run check-all 통과 (0 errors)
- [x] Playwright MCP E2E 테스트
- [x] ROADMAP.md Task 023 완료 표시

## 테스트 체크리스트

- [x] /api/images/thumbnail/[imageId] → 응답 헤더 확인
- [x] /api/images/preview/[imageId] → 응답 헤더 확인
- [x] /api/admin/images/[imageId]/original 비인증 → 401
- [x] 이미지 상세 페이지 프리뷰 이미지 API URL 사용 확인

## 변경 사항 요약

**신규 생성 파일:**

- `src/lib/image-serving.ts` - serveFile(개발/프로덕션 분기), getContentType(format→MIME) 유틸

**수정 파일:**

- `src/app/api/images/thumbnail/[imageId]/route.ts` - TODO 스텁 → 실제 구현
- `src/app/api/images/preview/[imageId]/route.ts` - TODO 스텁 → 실제 구현
- `src/app/api/admin/images/[imageId]/original/route.ts` - TODO 스텁 → ADMIN 인증 + 스트리밍
- `src/app/(buyer)/images/[id]/page.tsx` - watermarkUrl 직접 사용 → /api/images/preview/${id}
