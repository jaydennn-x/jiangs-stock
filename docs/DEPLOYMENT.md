# 배포 가이드 — jiangsgamseong.co.kr

## 전체 구조

```
[로컬 PC (Windows)]                [GitHub]                [AWS EC2 (Ubuntu)]
 개발 & 원본 이미지 보관  ──push──→  코드 저장소  ──clone──→  운영 서버
                                                            ├─ Next.js 앱
                                                            ├─ PostgreSQL (DB)
                                                            ├─ Redis (캐시/큐)
                                                            ├─ Nginx (웹서버/SSL)
                                                            └─ PM2 (프로세스 관리)
```

- **로컬 PC**: 코드 개발 + 원본 이미지 마스터 보관 (하드디스크)
- **GitHub**: 코드 버전 관리 (원격 저장소)
- **EC2 서버**: 실제 사용자가 접속하는 운영 서버

---

## 사용 중인 서비스 & 역할

| 서비스 | 역할 | 비용 |
|--------|------|------|
| **AWS EC2** (`t3.small`) | 앱 실행 서버 (2vCPU, 2GB RAM, 30GB 스토리지) | 월 ~$15 |
| **AWS Route 53** | DNS 관리 (`jiangsgamseong.co.kr` 도메인) | 월 $0.5 |
| **탄력적 IP** | EC2에 고정 IP 부여 (재시작해도 IP 안 바뀜) | 연결 시 무료 |
| **Let's Encrypt** | HTTPS 인증서 (Certbot으로 자동 갱신) | 무료 |
| **GitHub** | 코드 저장소 (`jaydennn-x/jiangs-stock`) | 무료 |

---

## EC2 서버에 설치한 것들

### 1. Node.js 20 (nvm으로 설치)
- **역할**: Next.js 앱을 실행하는 JavaScript 런타임
- **설치 경로**: `/home/ubuntu/.nvm/versions/node/v20.20.1/`
- **확인**: `node -v`

### 2. PM2 (프로세스 매니저)
- **역할**: Next.js 앱을 백그라운드에서 실행, 서버 재시작 시 자동 실행
- **관리 중인 프로세스**:
  - `jiangs-web`: Next.js 웹 서버 (포트 3000)
  - `jiangs-worker`: 이미지 처리 워커
- **주요 명령어**:
  ```bash
  pm2 list              # 실행 중인 프로세스 목록
  pm2 logs              # 로그 확인
  pm2 restart all       # 전체 재시작
  pm2 restart jiangs-web  # 웹서버만 재시작
  ```

### 3. PostgreSQL (데이터베이스)
- **역할**: 사용자, 이미지, 주문 등 모든 데이터 저장
- **DB명**: `jiangsstock`
- **유저명**: `jiangs`
- **접속**: `sudo -u postgres psql -d jiangsstock`
- **주요 명령어**:
  ```bash
  sudo systemctl status postgresql   # 상태 확인
  sudo systemctl restart postgresql  # 재시작
  ```

### 4. Redis (인메모리 저장소)
- **역할**: 이미지 처리 작업 큐, 캐싱
- **포트**: 6379
- **주요 명령어**:
  ```bash
  sudo systemctl status redis-server  # 상태 확인
  redis-cli ping                      # PONG 응답하면 정상
  ```

### 5. Nginx (웹서버 / 리버스 프록시)
- **역할**:
  - 외부 요청(80/443 포트)을 Next.js(3000 포트)로 전달
  - HTTPS(SSL) 처리
  - 파일 업로드 크기 제한 (50MB)
- **설정 파일**: `/etc/nginx/sites-available/jiangs`
- **주요 명령어**:
  ```bash
  sudo nginx -t                    # 설정 문법 검사
  sudo systemctl restart nginx     # 재시작
  sudo systemctl status nginx      # 상태 확인
  ```

### 6. Certbot (SSL 인증서)
- **역할**: Let's Encrypt에서 HTTPS 인증서 발급 & 자동 갱신
- **갱신 확인**: `sudo certbot renew --dry-run`
- **자동 갱신**: 시스템 타이머로 자동 실행됨

---

## 프로젝트 파일 구조 (서버)

```
/home/ubuntu/jiangs/
├── .env                  ← 환경변수 (비밀번호, 시크릿 등)
├── storage/
│   ├── originals/        ← 원본 이미지
│   ├── thumbnails/       ← 썸네일 (자동 생성)
│   ├── previews/         ← 미리보기 (자동 생성)
│   └── watermarked/      ← 워터마크 버전 (자동 생성)
├── .next/                ← 빌드 결과물
├── node_modules/         ← 의존성 패키지
└── (나머지 소스코드)
```

---

## 환경변수 (.env)

| 변수 | 용도 |
|------|------|
| `DATABASE_URL` | PostgreSQL 접속 정보 (유저:비밀번호@호스트/DB명) |
| `REDIS_URL` | Redis 접속 주소 |
| `NEXTAUTH_SECRET` | 사용자 세션/JWT 암호화 키 (DB 비번과 별도) |
| `NEXTAUTH_URL` | 사이트 주소 (`https://jiangsgamseong.co.kr`) |
| `STORAGE_ROOT` | 이미지 저장 경로 |
| `SHARP_CONCURRENCY` | 이미지 처리 동시 작업 수 |
| `ADMIN_ALLOWED_IPS` | 관리자 접근 허용 IP |
| `NEXT_PUBLIC_APP_URL` | 클라이언트에서 사용하는 사이트 URL |

---

## 네트워크 흐름

```
사용자 브라우저
    │
    ▼ (https://jiangsgamseong.co.kr)
Route 53 DNS → 탄력적 IP (고정)
    │
    ▼ (포트 443/HTTPS)
EC2 보안 그룹 (방화벽)
    │
    ▼
Nginx (SSL 종료 + 리버스 프록시)
    │
    ▼ (포트 3000)
Next.js 앱 (PM2가 관리)
    │
    ├──→ PostgreSQL (데이터 조회/저장)
    └──→ Redis (작업 큐/캐시)
```

---

## 코드 업데이트 방법

로컬에서 코드 수정 후:

```bash
# 1. 로컬에서 GitHub에 푸시
git add .
git commit -m "변경 내용"
git push origin main

# 2. EC2 서버에 SSH 접속
ssh -i /c/Users/you04/Downloads/jiangs-key.pem ubuntu@15.164.252.56

# 3. 서버에서 코드 가져오기 & 재빌드
cd ~/jiangs
git pull
npm install          # 패키지 변경 시
npx prisma generate  # 스키마 변경 시
npx prisma db push   # DB 스키마 변경 시
npm run build
pm2 restart jiangs-web
```

---

## 원본 이미지 업로드 (로컬 → 서버)

원본 이미지는 로컬 PC `D:\jiangsstock`에 보관하고, 필요할 때 서버로 업로드한다.

```bash
# Git Bash에서 실행 (로컬 PC)
rsync -avz -e "ssh -i /c/Users/you04/Downloads/jiangs-key.pem" \
  /d/jiangsstock/ \
  ubuntu@15.164.252.56:/home/ubuntu/jiangs/storage/originals/
```

---

## 관리자 계정 & 보안

### 관리자 로그인
- **URL**: `https://jiangsgamseong.co.kr/admin/login`
- **계정**: `admin@jiangsstock.com` / `Admin1234!`

### IP 화이트리스트
관리자 페이지(`/admin` 하위 전체)는 허용된 IP에서만 접근 가능하다.
- 허용 IP 목록: 서버 `.env`의 `ADMIN_ALLOWED_IPS`에서 관리
- 허용되지 않은 IP → 홈으로 리다이렉트

```bash
# 서버에서 허용 IP 확인
grep ADMIN_ALLOWED_IPS ~/jiangs/.env

# 새 IP 추가 (쉼표로 구분, CIDR도 가능)
# 예: ADMIN_ALLOWED_IPS=127.0.0.1,::1,218.39.218.53,123.456.789.0/24
```

### 보안 정책
- 관리자 계정은 **일반 로그인 페이지(`/login`)에서 로그인 불가** (admin 전용 로그인만 허용)
- `/admin` 경로 전체(로그인 페이지 포함)에 IP 화이트리스트 적용
- IP가 변경되면 서버 `.env`의 `ADMIN_ALLOWED_IPS`를 수정하고 `pm2 restart jiangs-web`

### 유저 데이터 관리
- **DB 직접 조회** (서버 SSH 접속 후):
  ```bash
  # 전체 유저 목록
  sudo -u postgres psql -d jiangsstock -c 'SELECT id, email, name, role FROM "User";'

  # 특정 유저 role 변경
  sudo -u postgres psql -d jiangsstock -c "UPDATE \"User\" SET role = 'ADMIN' WHERE email = 'someone@example.com';"
  ```
- **GUI 도구**: DBeaver 등 DB 클라이언트로 SSH 터널 연결하면 GUI에서 조회/수정 가능

---

## 자주 묻는 질문

### 내 PC를 꺼도 서버는 돌아가나요?
**네.** AWS EC2는 클라우드 서버로 로컬 PC와 완전히 독립적이다. PC를 꺼도, 인터넷을 끊어도 사이트는 24시간 정상 운영된다.

### 서버를 끄고 싶으면?
AWS 콘솔에서 EC2 인스턴스를 중지(Stop)하면 된다. 중지 중에는 비용이 거의 안 든다 (스토리지 비용만 소액 발생). 다시 시작(Start)하면 탄력적 IP 덕분에 같은 주소로 접속 가능.

---

## 문제 해결

### 사이트 접속 안 될 때
```bash
# 1. Next.js 앱 확인
pm2 list                           # online 상태인지 확인
pm2 logs jiangs-web --lines 50     # 에러 로그 확인

# 2. Nginx 확인
sudo systemctl status nginx
sudo nginx -t

# 3. DB 확인
sudo systemctl status postgresql

# 4. Redis 확인
sudo systemctl status redis-server
```

### 서버 재시작 후
PM2 startup 설정을 해뒀으므로 **자동으로 앱이 실행**됩니다. 안 되면:
```bash
cd ~/jiangs
pm2 start npm --name "jiangs-web" -- start
pm2 start npm --name "jiangs-worker" -- run worker:start
```

### SSL 인증서 만료 시
보통 자동 갱신되지만, 수동으로:
```bash
sudo certbot renew
sudo systemctl restart nginx
```

---

## EC2 보안 그룹 (방화벽 규칙)

| 포트 | 프로토콜 | 소스 | 용도 |
|------|----------|------|------|
| 22 | TCP | 내 IP만 | SSH 접속 |
| 80 | TCP | 0.0.0.0/0 | HTTP (→ HTTPS 리다이렉트) |
| 443 | TCP | 0.0.0.0/0 | HTTPS |

---

## 비용 요약 (예상 월별)

| 항목 | 비용 |
|------|------|
| EC2 t3.small | ~$15/월 |
| Route 53 호스팅 | ~$0.5/월 |
| 탄력적 IP | 연결 시 무료 |
| SSL 인증서 | 무료 |
| **합계** | **~$16/월** |

> 프리티어 기간(12개월)이면 t3.micro 무료 사용 가능하지만, 스톡사진 사이트에는 t3.small 권장.
