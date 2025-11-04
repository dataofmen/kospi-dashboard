# 📊 KOSPI 모니터링 대시보드

코스피 시장의 10대 핵심 지표를 자동으로 추적하고, 종합 점수를 통해 상승/하락 시나리오를 시각적으로 모니터링하는 웹 대시보드입니다.

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
