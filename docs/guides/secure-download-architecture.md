# 보안 다운로드 아키텍처

JiangsStock의 이미지 구매→다운로드 보안 설계 문서

---

## 대전제

> **서버에는 상업적 가치가 있는 이미지 파일이 단 한 장도 상시 존재하지 않는다.**

서버가 완전히 장악당하더라도 탈취할 수 있는 고품질 이미지가 물리적으로 존재하지 않도록 설계한다.

---

## 1. 저장 구조 (3-Tier)

### Tier 1: 서버 상시 보관 (browsing용)

해킹당해도 상업적 가치 없는 파일만 보관한다.

```
STORAGE_ROOT/
├── thumbnails/{imageId}.webp    # 작은 썸네일 (1200x1200, WebP)
└── watermarks/{imageId}.jpg     # 워터마크 미리보기 (67% 축소 + 대각선 워터마크)
```

- 썸네일: 저해상도, 정방형 크롭
- 워터마크: 대각선 "JiangsStock" 텍스트 오버레이, 상업적 사용 불가
- Nginx X-Accel-Redirect로 서빙, 퍼블릭 캐시 적용

### Tier 2: 원본 이미지 (로컬 하드디스크)

서버 프로세스(Next.js)는 **절대 접근 불가**. Worker 프로세스만 읽기 전용 접근.

```
D:\jiangsstock\          # Windows (개발)
/mnt/originals/          # Linux (프로덕션)
├── IMG_0001.jpg
├── IMG_0002.jpg
└── ...
```

- 환경변수: `ORIGINALS_ROOT`
- OS 레벨 권한으로 접근 제어 (섹션 6 참조)
- Image.code 필드로 파일명 매핑: `{ORIGINALS_ROOT}/{Image.code}.jpg`

### Tier 3: 임시 다운로드 파일 (구매 후 생성, 전송 후 삭제)

구매 확정 시 Worker가 생성, 다운로드 완료 후 즉시 삭제한다.

```
STORAGE_ROOT/
└── pending-downloads/
    └── {hashedToken}/
        └── {size}.enc          # AES-256-GCM 암호화된 리사이즈 파일
```

- 암호화 키: Redis에 저장 (TTL 5분)
- 파일 자체가 암호화되어 있어 탈취해도 복호화 불가
- 다운로드 완료 또는 TTL 만료 시 자동 삭제

---

## 2. 프로세스 권한 분리

### 핵심 원칙

웹서버(Next.js)와 파일 접근 프로세스(Worker)를 완전히 분리하여, 웹서버가 해킹당해도 원본 이미지에 접근할 수 없게 한다.

```
┌─────────────────────────────────────┐
│ Next.js (웹서버)                     │
│                                     │
│  실행 계정: webuser                  │
│  인터넷 노출: ✅ (해킹 대상)         │
│  원본 접근: ❌ 불가                  │
│  임시 파일 접근: 읽기 전용            │
│                                     │
│  역할:                               │
│  - 썸네일/워터마크 서빙              │
│  - 주문 처리, 결제 웹훅 수신          │
│  - Redis 큐에 다운로드 요청 등록      │
│  - 암호화 파일 복호화 → 스트림 전송   │
└────────────────┬────────────────────┘
                 │
           Redis Queue
           (메시지만 전달)
                 │
                 ▼
┌─────────────────────────────────────┐
│ Worker (별도 프로세스)               │
│                                     │
│  실행 계정: worker                   │
│  인터넷 노출: ❌ (해킹 경로 없음)    │
│  원본 접근: ✅ 읽기 전용             │
│  임시 파일 접근: 읽기/쓰기           │
│                                     │
│  역할:                               │
│  - 큐에서 다운로드 요청 수신          │
│  - DB에서 주문 유효성 재검증          │
│  - 원본 읽기 → Sharp 리사이즈        │
│  - AES-256-GCM 암호화 → 임시 저장    │
│  - 암호키 Redis 저장 (TTL 5분)       │
│  - "준비 완료" 이벤트 발행            │
└─────────────────────────────────────┘
```

### OS 레벨 권한 설정 (Linux 프로덕션)

```bash
# 1. 전용 계정 생성
useradd --no-create-home --shell /bin/false webuser
useradd --no-create-home --shell /bin/false worker

# 2. 공유 그룹 생성
groupadd shared-downloads

# 3. 원본 이미지: worker만 접근
chown worker:worker /mnt/originals
chmod 700 /mnt/originals              # rwx------ (worker만)

# 4. 임시 다운로드: worker 쓰기, webuser 읽기
chown worker:shared-downloads /data/storage/pending-downloads
chmod 750 /data/storage/pending-downloads  # rwxr-x---
usermod -aG shared-downloads webuser       # webuser에 읽기 권한

# 5. 썸네일/워터마크: webuser만 읽기
chown webuser:webuser /data/storage/thumbnails
chown webuser:webuser /data/storage/watermarks
chmod 755 /data/storage/thumbnails
chmod 755 /data/storage/watermarks

# 6. PM2 프로세스 실행
pm2 start ecosystem.config.js --env production
# Next.js → uid: webuser
# Worker  → uid: worker
```

---

## 3. 전체 다운로드 Flow

### Phase 1: 브라우징

```
구매자 브라우저 ◄──── 썸네일 + 워터마크 (Tier 1)
(검색, 상세보기)      Nginx X-Accel-Redirect로 서빙
                     Cache-Control: public, max-age=86400
```

### Phase 2: 결제

```
장바구니 → 체크아웃
     │
     ▼
┌───────────────────────────────────────────┐
│ 서버: Order 생성 (PENDING)                 │
│  • idempotencyKey: crypto.randomUUID()    │
│  • totalAmount: 서버에서 재계산            │
│  • OrderItems: 이미지별 사이즈/라이선스     │
└────────────────┬──────────────────────────┘
                 ▼
        PG사 결제 위젯 호출
                 │
                 ▼
┌───────────────────────────────────────────┐
│ PG 웹훅 수신 (POST /api/webhooks/payment) │
│                                           │
│  검증 4단계:                               │
│  ① PG 서명(Signature) 검증                │
│  ② PG IP 화이트리스트 확인                 │
│  ③ 주문 금액 === PG 승인 금액              │
│  ④ 멱등성 체크 (이미 COMPLETED면 skip)     │
│                                           │
│  처리:                                     │
│  • Order.status → COMPLETED               │
│  • Order.paidAt → now()                   │
│  • 각 OrderItem에:                         │
│    - downloadToken: crypto.randomUUID()   │
│    - expiresAt: now() + 7일               │
│    - downloadLimit: 3                     │
│  • TransactionLog 기록 (PAYMENT, SUCCESS) │
└───────────────────────────────────────────┘
```

### Phase 3: 다운로드 (핵심)

```
마이페이지 → 구매내역 → 다운로드 버튼 클릭
     │
     ▼
GET /api/downloads/{downloadToken}
     │
     ▼
┌───────────────────────────────────────────┐
│ Step 1: 6중 보안 검증 (Next.js)           │
│                                           │
│  ① 토큰 유효성: DB에 존재하는가?           │
│  ② 만료 체크: expiresAt > now()?          │
│  ③ 횟수 체크: downloadCount < limit?      │
│  ④ 소유자 확인: session.userId === 주문자? │
│  ⑤ Rate Limit: 분당 5회 초과?             │
│  ⑥ 주문 상태: order.status === COMPLETED? │
│                                           │
│  하나라도 실패 → 403 + TransactionLog     │
└────────────────┬──────────────────────────┘
                 │ (검증 통과)
                 ▼
┌───────────────────────────────────────────┐
│ Step 2: 다운로드 준비 요청 (Next.js → Queue) │
│                                           │
│  Redis Queue에 Job 등록:                   │
│  {                                        │
│    downloadToken,                         │
│    imageCode,                             │
│    size,       // XL, L, M, S             │
│    orderId                                │
│  }                                        │
│                                           │
│  응답 대기: Redis Pub/Sub 또는 polling     │
│  (타임아웃: 30초)                          │
└────────────────┬──────────────────────────┘
                 │
           Redis Queue
                 │
                 ▼
┌───────────────────────────────────────────┐
│ Step 3: 파일 생성 (Worker)                 │
│                                           │
│  1. DB에서 주문 유효성 재검증              │
│  2. 원본 읽기:                             │
│     {ORIGINALS_ROOT}/{imageCode}.jpg      │
│  3. Sharp 리사이즈:                        │
│     XL: 100% / L: 67% / M: 45% / S: 26% │
│     EXIF 완전 제거, JPEG quality 90       │
│  4. AES-256-GCM 암호화:                   │
│     key: crypto.randomBytes(32)           │
│     iv: crypto.randomBytes(16)            │
│  5. 암호화 파일 저장:                      │
│     {STORAGE_ROOT}/pending-downloads/     │
│       {sha256(token)}/{size}.enc          │
│  6. 암호키+IV Redis 저장:                  │
│     key: `dl:{token}:key`                 │
│     TTL: 300초 (5분)                      │
│  7. "준비 완료" 이벤트 발행                │
└────────────────┬──────────────────────────┘
                 │
           Redis Pub/Sub
                 │
                 ▼
┌───────────────────────────────────────────┐
│ Step 4: 스트림 전송 (Next.js)              │
│                                           │
│  1. Redis에서 암호키 조회                  │
│  2. 암호화 파일 읽기 → 복호화 스트림       │
│  3. HTTP 응답:                             │
│     Content-Type: image/jpeg              │
│     Content-Disposition: attachment;      │
│       filename="JIANGS_{code}_{size}.jpg" │
│     Cache-Control: no-store               │
│     X-Content-Type-Options: nosniff       │
│  4. 전송 완료 후:                          │
│     - 암호화 파일 즉시 삭제                │
│     - Redis 키 삭제                        │
│     - downloadCount 원자적 +1             │
│     - TransactionLog 기록                 │
│       (DOWNLOAD, SUCCESS, IP, UA)         │
└───────────────────────────────────────────┘
```

### Phase 4: 정리 (Cron Worker)

```
매 10분 실행:
  1. pending-downloads/ 디렉토리 스캔
  2. 5분 이상 경과한 파일 삭제
  3. 만료된 Redis 키 정리 (TTL이 자동 처리하지만 방어적 정리)
  4. expiresAt 지난 OrderItem 로그 기록
```

---

## 4. 보안 레이어 상세

### 4.1 파일 저장 보안

| 위협 | 대응 |
|------|------|
| 서버 해킹 시 파일 탈취 | 서버에 고품질 파일 상시 미보관 |
| 임시 파일 탈취 | AES-256-GCM 암호화, 키는 Redis 분리 (TTL 5분) |
| Worker 해킹 | 인터넷 미노출, 포트 미개방, 해킹 경로 없음 |
| 로컬 하드 물리 탈취 | 서버 보안과 별개, 물리 보안으로 대응 |

### 4.2 다운로드 토큰 보안

| 위협 | 대응 |
|------|------|
| URL 공유/유출 | 세션 바인딩 (구매자 userId만 다운로드 가능) |
| 토큰 추측 | UUID v4 (122비트 엔트로피, 무차별 대입 불가) |
| 토큰 재사용 | 횟수 제한 (3회), 만료 기한 (7일) |
| 자동화 다운로드 | Rate Limit (분당 5회) |

### 4.3 결제 보안

| 위협 | 대응 |
|------|------|
| 금액 조작 | 서버에서 가격 재계산, PG 승인 금액과 비교 |
| 위조 웹훅 | PG 서명 검증 + IP 화이트리스트 |
| 중복 결제 | 멱등성 키 (idempotencyKey) |
| 결제 후 주문 조작 | Order 상태 COMPLETED 이후 수정 불가 |

### 4.4 전송 보안

| 위협 | 대응 |
|------|------|
| 중간자 공격 | HTTPS 필수 (TLS 1.3) |
| 응답 캐싱 | Cache-Control: no-store |
| 파일 타입 스니핑 | X-Content-Type-Options: nosniff |
| Referrer 유출 | Referrer-Policy: no-referrer |

### 4.5 감사 추적

모든 다운로드 시도(성공/실패)를 TransactionLog에 기록한다:

```typescript
{
  orderId: string;
  action: 'DOWNLOAD';
  status: 'SUCCESS' | 'FAILURE';
  ipAddress: string;
  userAgent: string;
  details: {
    downloadToken: string;
    imageCode: string;
    size: string;
    failureReason?: string;    // 실패 시 사유
    downloadCount?: number;    // 현재 다운로드 횟수
  }
}
```

---

## 5. 해킹 시나리오별 피해 분석

### 시나리오 1: 웹서버(Next.js) 완전 장악

```
공격자가 얻을 수 있는 것:
  ✅ 썸네일 (저해상도, 상업 가치 없음)
  ✅ 워터마크 미리보기 (상업 사용 불가)
  ✅ DB 접근 (주문 기록, 사용자 정보)
  ✅ 암호화된 임시 파일 (5분 이내 존재 시)

공격자가 얻을 수 없는 것:
  ❌ 원본 이미지 (OS 권한으로 접근 차단)
  ❌ 리사이즈 파일 (메모리/암호화 임시만 존재)
  ❌ 암호화 키 (Redis TTL 5분, 파일과 동시 탈취 필요)

피해: 사용자 정보 유출 가능, 이미지 자산은 안전
```

### 시나리오 2: Redis 장악

```
공격자가 얻을 수 있는 것:
  ✅ 세션 데이터
  ✅ 암호화 키 (5분 이내 존재 시)
  ✅ 큐 메시지

공격자가 얻을 수 없는 것:
  ❌ 암호화 파일 (파일시스템 접근 필요)
  ❌ 키만으로는 복호화 불가 (파일 없음)

피해: 세션 탈취 가능, 이미지 자산은 안전
```

### 시나리오 3: 웹서버 + Redis 동시 장악

```
이론적 가능:
  5분 이내에 암호화 파일 + 키를 동시 확보하면 복호화 가능

현실적 난이도:
  - 5분 TTL 내 두 시스템 동시 장악 필요
  - 해당 시점에 다운로드 대기 중인 파일만 대상
  - 전체 이미지 DB 탈취는 불가능 (on-demand 생성이므로)

피해: 최악의 경우 수 장의 개별 이미지 유출 가능, 전체 자산은 안전
```

### 시나리오 4: Worker 프로세스 장악

```
공격 경로:
  - 인터넷 미노출 (포트 바인딩 없음)
  - SSH를 통한 서버 자체 침입 필요
  - 이 경우 OS 레벨 침입이므로 아키텍처와 무관한 물리 보안 영역

피해: OS 보안 실패, 별도 대응 필요
```

---

## 6. 동시성 제어

### On-Demand 리사이즈 메모리 관리

```
XL 원본: ~30MB 메모리
Sharp 리사이즈 중: ~60MB (입력 + 출력)
동시 3건: ~180MB

→ Semaphore로 동시 처리 3건 제한
→ 초과 시 큐 대기 (BullMQ가 자동 관리)
→ 1인 운영 규모에서 충분
```

### 환경변수

```bash
# Worker 동시 처리 수
DOWNLOAD_WORKER_CONCURRENCY=3

# Sharp 메모리 제한
SHARP_MEMORY_LIMIT=512    # MB

# 다운로드 Rate Limit
DOWNLOAD_RATE_LIMIT=5     # 분당 최대 요청 수
DOWNLOAD_RATE_WINDOW=60   # Rate Limit 윈도우 (초)
```

---

## 7. 암호화 상세

### AES-256-GCM 선택 이유

- **AES-256**: 군사 등급 암호화, 현존 최고 보안
- **GCM 모드**: 인증된 암호화 (무결성 검증 포함)
  - 파일이 변조되면 복호화 실패 → 위변조 탐지
- Node.js `crypto` 모듈 네이티브 지원 (외부 의존성 없음)

### 암호화 Flow

```
암호화 (Worker):
  key = crypto.randomBytes(32)       // 256비트 키
  iv  = crypto.randomBytes(16)       // 초기화 벡터
  cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  encrypted = cipher.update(resizedBuffer) + cipher.final()
  authTag = cipher.getAuthTag()      // 16바이트 인증 태그

  저장: {authTag}{encrypted} → 파일
  저장: {key}{iv} → Redis (TTL 5분)

복호화 (Next.js):
  {key, iv} ← Redis
  {authTag, encrypted} ← 파일
  decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
  decipher.setAuthTag(authTag)
  decrypted = decipher.update(encrypted) + decipher.final()

  → Response stream으로 전송
```

---

## 8. 구현 파일 구조

### 수정 대상

```
src/workers/image-processing.worker.ts
  → XL/L/M/S 다운로드 파일 사전 생성 로직 제거
  → 썸네일 + 워터마크만 생성하도록 변경

src/lib/image-processing/resize.ts
  → on-demand 리사이즈 함수 추가 (resizeOnDemand)

src/lib/queues/job-types.ts
  → DownloadPrepareJob 타입 추가
```

### 신규 생성

```
src/app/api/downloads/[token]/route.ts
  → 보안 다운로드 API (6중 검증 + 스트림 전송)

src/app/api/webhooks/payment/route.ts
  → PG 결제 웹훅 핸들러

src/lib/services/secure-download.service.ts
  → 토큰 검증, 암호화/복호화, 파일 정리 로직

src/lib/services/download-crypto.service.ts
  → AES-256-GCM 암호화/복호화 유틸리티

src/lib/download-limiter.ts
  → Redis 기반 Rate Limit + Semaphore

src/workers/download-prepare.worker.ts
  → 다운로드 준비 Worker (원본 읽기 → 리사이즈 → 암호화)

src/workers/download-cleanup.worker.ts
  → 만료 파일 정리 Cron Worker
```

---

## 9. 환경변수 추가 목록

```bash
# 원본 이미지 경로 (Worker만 접근)
ORIGINALS_ROOT="D:\\jiangsstock"           # Windows 개발
# ORIGINALS_ROOT="/mnt/originals"          # Linux 프로덕션

# 다운로드 보안
DOWNLOAD_TOKEN_EXPIRY_DAYS=7               # 토큰 만료 기간
DOWNLOAD_MAX_COUNT=3                       # 최대 다운로드 횟수
DOWNLOAD_CRYPTO_TTL=300                    # 암호키 Redis TTL (초)
DOWNLOAD_WORKER_CONCURRENCY=3              # Worker 동시 처리 수

# Rate Limiting
DOWNLOAD_RATE_LIMIT=5                      # 분당 최대 다운로드 요청
DOWNLOAD_RATE_WINDOW=60                    # Rate Limit 윈도우 (초)
```

---

## 10. 체크리스트

### 배포 전 보안 점검

- [ ] `ORIGINALS_ROOT` 디렉토리에 webuser 접근 불가 확인
- [ ] Worker 프로세스가 외부 포트에 바인딩되지 않음 확인
- [ ] Redis 비밀번호 설정 및 외부 접근 차단 확인
- [ ] HTTPS 인증서 적용 및 TLS 1.3 확인
- [ ] `NEXTAUTH_SECRET` 충분한 엔트로피 (32자 이상) 확인
- [ ] PG 웹훅 IP 화이트리스트 설정 확인
- [ ] PM2 ecosystem.config.js에 uid/gid 설정 확인
- [ ] Nginx에서 `/pending-downloads/` 경로 직접 접근 차단 확인
- [ ] 환경변수에 민감정보가 Git에 커밋되지 않음 확인
- [ ] TransactionLog 테이블 인덱스 설정 확인

### 운영 모니터링

- [ ] 실패한 다운로드 시도 알림 설정
- [ ] Rate Limit 초과 알림 설정
- [ ] pending-downloads 디렉토리 크기 모니터링
- [ ] Worker 프로세스 health check 설정
- [ ] Redis 메모리 사용량 모니터링
