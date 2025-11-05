# 📊 KOSPI 모니터링 대시보드

코스피 시장의 10대 핵심 지표를 자동으로 추적하고, 종합 점수를 통해 상승/하락 시나리오를 시각적으로 모니터링하는 웹 대시보드입니다.

## 🚀 Railway 간편 배포 (3분 완성)

### ⚡ 빠른 배포 방법

**1단계**: Railway 로그인
- https://railway.app 접속 → GitHub 계정으로 로그인

**2단계**: 이 저장소 배포
- Railway 대시보드 → **"New Project"** 클릭
- **"Deploy from GitHub repo"** 선택
- `dataofmen/kospi-dashboard` 검색 및 선택
- **"Deploy Now"** 클릭

**3단계**: PostgreSQL 추가
- 프로젝트에서 **"+ New"** → **"Database"** → **"Add PostgreSQL"**

**4단계**: 환경 변수 설정
프로젝트 → **"Variables"** 탭 → **Raw Editor** 활성화 → 아래 전체 복사&붙여넣기:

```env
FRED_API_KEY=22657b2b26b8b8a9641ea58fed9c6916
EXIM_API_KEY=bBFEqblxWAVHTs3FPp1CntgJ4mb5BeyJ
ADMIN_PASSWORD=kospi2025
RESEND_API_KEY=re_dRcXzEE6_12TraNctjd3ZBEFYcgPD3ZPS
RESEND_FROM_EMAIL=KOSPI Monitor <onboarding@resend.dev>
NODE_ENV=production
```

**5단계**: 배포 완료 대기 (3분)
- **Deployments** 탭에서 진행상황 확인
- ✅ "Deployed" 상태 확인
- **Settings** → **Domains**에서 생성된 URL 복사

### ✅ 배포 후 설정

**1. 관리자 접속**: `https://your-app.railway.app/admin` (비밀번호: `kospi2025`)

**2. 수동 데이터 입력** (5개 지표):
- 메모리 가격: `2.5` USD
- 반도체 영업이익: `8.5` 조원
- 밸류업 지수: `3` (0-5)
- S&P500 PBR: `4.8`
- AI CapEx 성장률: `35` %

**3. 이메일 알림 설정**:
- 관리자 → "알림 관리" → 이메일 추가 → 활성화

**4. 첫 데이터 수집 테스트**:
```bash
curl https://your-app.railway.app/api/cron
```

**5. 자동 스케줄러 설정** (Cron-job.org):
- URL: `https://your-app.railway.app/api/cron`
- Schedule: `0 9 * * *` (매일 오전 9시)
- Timezone: `Asia/Seoul`

---

## 🚀 로컬 개발 환경 설정

### 1단계: Railway 프로젝트 생성
1. [Railway.app](https://railway.app) 로그인 (GitHub 계정 연동)
2. **"New Project"** 클릭
3. **"Deploy from GitHub repo"** 선택
4. `dataofmen/kospi-dashboard` 저장소 선택

### 2단계: PostgreSQL 데이터베이스 추가
1. 프로젝트 화면에서 **"+ New"** 버튼 클릭
2. **"Database"** → **"Add PostgreSQL"** 선택
3. Railway가 자동으로 `DATABASE_URL` 환경변수 연결

### 3단계: 환경 변수 설정
프로젝트 → **"Variables"** 탭에서 아래 변수 추가:

```env
FRED_API_KEY=22657b2b26b8b8a9641ea58fed9c6916
EXIM_API_KEY=bBFEqblxWAVHTs3FPp1CntgJ4mb5BeyJ
ADMIN_PASSWORD=kospi2025
RESEND_API_KEY=re_dRcXzEE6_12TraNctjd3ZBEFYcgPD3ZPS
RESEND_FROM_EMAIL=KOSPI Monitor <onboarding@resend.dev>
NODE_ENV=production
```

### 4단계: 배포 완료 대기
- Railway가 자동으로 빌드 및 배포 (약 3-5분)
- 배포 완료 후 생성된 URL 확인 (예: `https://kospi-dashboard-production.railway.app`)

### 5단계: 관리자 설정
1. `https://your-app.railway.app/admin` 접속 (비밀번호: `kospi2025`)
2. 수동 데이터 입력 (메모리 가격, 반도체 이익, 밸류업 지수 등)
3. **"알림 관리"** 버튼 클릭 → 이메일 주소 추가

### 6단계: 자동 수집 스케줄러 설정
**옵션 1: Cron-job.org (추천)**
1. [Cron-job.org](https://cron-job.org) 무료 가입
2. "Create cronjob" 클릭
3. URL: `https://your-app.railway.app/api/cron`
4. Schedule: `0 9 * * *` (매일 오전 9시)
5. Timezone: `Asia/Seoul`

**옵션 2: GitHub Actions**
- 저장소에 `.github/workflows/daily-collect.yml` 생성 (자세한 내용은 `RAILWAY_DEPLOY_GUIDE.md` 참조)

---

✅ **배포 완료!** 이제 매일 오전 9시마다 자동으로 데이터가 수집되고, 알림 조건 충족 시 이메일이 발송됩니다.

## 🚀 빠른 시작

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.example`을 복사하여 `.env` 파일 생성:

```bash
cp .env.example .env
```

필요한 API 키를 `.env`에 입력:
- **FRED_API_KEY**: https://fred.stlouisfed.org (무료)
- **EXIM_API_KEY**: https://www.koreaexim.go.kr (무료)

### 3. 데이터베이스 설정

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 4. 개발 서버 실행

```bash
npm run dev
```

`http://localhost:3000` 접속

## 📊 주요 기능

### ✅ 완료된 기능
- **자동 데이터 수집**: 5개 지표 자동 수집 (외국인/개인 순매수, 환율, KOSPI PBR, 미 금리)
- **종합 점수**: 0-10 스케일 점수 자동 계산
- **시나리오 판정**: 강세/중립/약세 자동 판정
- **색상 코딩**: 상승/하락 신호 시각화
- **관리자 UI**: 수동 데이터 입력 (메모리가격, 반도체이익, 밸류업지수, S&P500 PBR, AI CapEx)
- **추세 차트**: 과거 데이터 그래프 (Recharts 기반)
- **이메일 알림**: 조건 기반 자동 이메일 발송 (Resend)
- **스케줄러**: 매일 오전 9시 자동 수집 (node-cron)

## 🏗️ 기술 스택

- Next.js 14, TypeScript, Tailwind CSS
- PostgreSQL + Prisma ORM
- Axios + Cheerio (웹 스크래핑)

## 📚 자세한 문서

프로젝트 루트의 `PRD.md` 파일 참조

---

## 🚀 Railway 배포 가이드

### 1. Railway 프로젝트 생성

1. [Railway.app](https://railway.app) 가입 및 로그인
2. "New Project" 클릭
3. "Deploy from GitHub repo" 선택
4. 본 저장소 연결

### 2. PostgreSQL 추가

1. Railway 프로젝트에서 "+ New" 클릭
2. "Database" → "PostgreSQL" 선택
3. 자동으로 `DATABASE_URL` 환경변수 생성됨

### 3. 환경 변수 설정

Railway 프로젝트 → Variables 탭에서 다음 변수 추가:

```
# 필수
FRED_API_KEY=your_fred_api_key
EXIM_API_KEY=your_exim_api_key
ADMIN_PASSWORD=your_admin_password
RESEND_API_KEY=your_resend_api_key

# 선택
RESEND_FROM_EMAIL=KOSPI Monitor <your@email.com>
NEXT_PUBLIC_APP_URL=https://your-app.railway.app
NODE_ENV=production
```

### 4. 데이터베이스 마이그레이션

Railway CLI 사용:

```bash
# Railway CLI 설치
npm install -g railway

# 프로젝트 연결
railway link

# 마이그레이션 실행
railway run npx prisma migrate deploy
railway run npx prisma generate
```

또는 Prisma Studio를 통해:

```bash
railway run npx prisma studio
```

### 5. 배포 확인

1. Railway에서 자동 배포 완료 대기
2. 생성된 URL (예: `https://kospi-dashboard.railway.app`) 접속
3. 대시보드 정상 작동 확인

### 6. 알림 설정

1. `/admin` 경로로 이동 (ADMIN_PASSWORD로 로그인)
2. "알림 관리" 버튼 클릭
3. 이메일 주소 추가 및 활성화

### 7. 스케줄러 동작 확인

- 매일 오전 9시(한국 시간) 자동 데이터 수집
- 수동 테스트: `/api/cron` 엔드포인트 호출

```bash
curl https://your-app.railway.app/api/cron
```

---

## 🔧 개발 팁

### 로컬에서 크론 작업 테스트

```bash
curl http://localhost:3000/api/cron
```

### Prisma Studio 실행

```bash
npx prisma studio
```

### 타입 체크

```bash
npm run build
```
