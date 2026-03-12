# Task 020: BullMQ 및 Redis 초기 설정

## 상태: 완료

## 설명

BullMQ + ioredis 기반 큐 시스템을 구축한다. 이미지 처리 큐와 이메일 발송 큐의 기본 골격을 완성하며, 워커는 Next.js 앱과 별도 Node.js 프로세스로 실행된다. 실제 처리 로직은 Task 027(이미지)과 Task 033(이메일)에서 구현한다.

## 관련 파일

- `src/lib/redis.ts` - ioredis 연결 팩토리 (싱글톤)
- `src/lib/queues/index.ts` - 큐 팩토리 및 QUEUE_NAMES 상수
- `src/lib/queues/job-types.ts` - Job 데이터 타입 정의
- `src/workers/image-processing.worker.ts` - 이미지 처리 워커 골격
- `src/workers/email.worker.ts` - 이메일 워커 골격
- `src/workers/index.ts` - 워커 진입점 및 Graceful Shutdown
- `package.json` - bullmq, ioredis 의존성 및 워커 실행 스크립트

## 수락 기준

- [x] Redis 연결 클라이언트가 정상적으로 생성된다
- [x] 이미지 처리 큐와 이메일 큐가 생성된다
- [x] Dead Letter Queue 구조가 구현된다
- [x] 재시도 전략이 적용된다 (최대 3회, 지수 백오프)
- [x] `npm run worker:dev` 실행 시 워커가 Redis에 연결된다
- [x] SIGINT/SIGTERM 시 Graceful Shutdown이 동작한다
- [x] TypeScript 타입 에러가 없다
- [x] ESLint/Prettier 검사를 통과한다

## 구현 단계

### 1단계: 패키지 설치

- [x] tasks/020-bullmq-redis.md 작업 파일 생성
- [x] bullmq, ioredis 설치
- [x] tsx, tsconfig-paths 설치 (워커 실행용)

### 2단계: Redis 연결 및 큐 유틸리티

- [x] src/lib/redis.ts 생성 (ioredis 연결 팩토리)
- [x] src/lib/queues/job-types.ts 생성 (Job 데이터 타입)
- [x] src/lib/queues/index.ts 생성 (큐 팩토리, QUEUE_NAMES, DEFAULT_JOB_OPTIONS)

### 3단계: 워커 구현

- [x] src/workers/image-processing.worker.ts 생성
- [x] src/workers/email.worker.ts 생성
- [x] src/workers/index.ts 생성 (진입점 + Graceful Shutdown)
- [x] package.json에 worker:dev, worker:start 스크립트 추가

### 4단계: 검증 및 완료

- [x] npm run worker:dev 실행 확인
- [x] npm run check-all 통과
- [x] ROADMAP.md Task 020 완료 표시

## 테스트 체크리스트

- [x] npm run worker:dev 실행 시 Redis 연결 성공 로그 확인
- [x] Ctrl+C 시 Graceful Shutdown 메시지 확인
- [x] npm run typecheck 통과

## 변경 사항 요약

**신규 생성 파일:**
- `src/lib/redis.ts` - ioredis 연결 팩토리 (createRedisConnection 함수)
- `src/lib/queues/job-types.ts` - ImageProcessingJobData, EmailJobData 타입
- `src/lib/queues/index.ts` - QUEUE_NAMES 상수, createQueue 팩토리, imageProcessingQueue, emailQueue export
- `src/workers/image-processing.worker.ts` - 이미지 처리 워커 골격 + DLQ 패턴
- `src/workers/email.worker.ts` - 이메일 워커 골격 + DLQ 패턴
- `src/workers/index.ts` - 워커 진입점, SIGTERM/SIGINT Graceful Shutdown

**수정 파일:**
- `package.json` - bullmq, ioredis 의존성 추가, tsx/tsconfig-paths devDependency 추가, worker:dev/worker:start 스크립트 추가
