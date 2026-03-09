# JiangsStock

스톡 이미지를 크기별·라이선스별로 판매하는 1인 개발 이커머스 플랫폼입니다.

## 주요 기능

**구매자**
- 키워드·카테고리·색상·방향 기반 이미지 검색
- 크기(XL/L/M/S) 및 라이선스(스탠다드/확장) 선택 구매
- 장바구니 및 위시리스트
- 보안 다운로드 링크 (3회 제한, 7일 만료)

**관리자**
- 이미지 업로드 시 자동 리사이징 및 워터마크 생성
- 주문 관리 및 다운로드 링크 재발송
- 매출 통계 대시보드

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | Next.js 16.1, React 19, TypeScript, TailwindCSS v4, shadcn/ui |
| Backend | Next.js API Routes, Prisma ORM 6, PostgreSQL 16 |
| Auth | NextAuth.js v5 (Auth.js) |
| Queue | BullMQ, Redis |
| Image | Sharp 0.34 |
| Payment | 포트원 v2 / 토스페이먼츠 |
| Infra | AWS (EC2, RDS, ElastiCache, SES, S3) |

## 설치 방법

### 사전 요구사항

- Node.js 20+
- PostgreSQL 16
- Redis

### 설치

```bash
# 저장소 클론
git clone https://github.com/your-username/jiangs-stock.git
cd jiangs-stock

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.local

# 데이터베이스 마이그레이션
npx prisma migrate dev

# 개발 서버 실행
npm run dev
```

### 환경 변수

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/jiangsstock"

# Auth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Redis
REDIS_URL="redis://localhost:6379"

# Storage
STORAGE_ROOT="/data/jiangs-storage"

# AWS SES
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_REGION="ap-northeast-2"

# Payment (포트원 or 토스페이먼츠)
PORTONE_API_KEY=""
PORTONE_API_SECRET=""
```

## 사용 예시

### 이미지 검색 API

```typescript
// 키워드 검색
const response = await fetch('/api/images?q=nature&category=landscape');
const images = await response.json();
```

### 결제 처리

```typescript
// 주문 생성 및 결제
const order = await createOrder({
  items: [
    { imageId: 'uuid', size: 'XL', licenseType: 'STANDARD' }
  ]
});
```

## 프로젝트 구조

```
├── app/                    # Next.js App Router
│   ├── (auth)/            # 인증 관련 페이지
│   ├── (shop)/            # 쇼핑 관련 페이지
│   ├── admin/             # 관리자 페이지
│   └── api/               # API Routes
├── components/            # React 컴포넌트
├── lib/                   # 유틸리티 및 설정
├── prisma/                # Prisma 스키마 및 마이그레이션
└── workers/               # BullMQ 워커
```

## 라이선스

MIT License

---

© 2026 JiangsStock
