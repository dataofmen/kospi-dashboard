# 🚀 KOSPI Dashboard - Railway 배포 가이드

## 준비 사항

### 1. API 키 발급 (완료 ✅)
- ✅ FRED API: `22657b2b26b8b8a9641ea58fed9c6916`
- ✅ EXIM API: `bBFEqblxWAVHTs3FPp1CntgJ4mb5BeyJ`
- ✅ Resend API: `re_dRcXzEE6_12TraNctjd3ZBEFYcgPD3ZPS`

### 2. GitHub 저장소
이 프로젝트를 GitHub에 푸시해야 합니다.

```bash
git init
git add .
git commit -m "Initial commit: KOSPI monitoring dashboard"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/kospi-dashboard.git
git push -u origin main
```

---

## Railway 배포 단계

### Step 1: Railway 프로젝트 생성

1. https://railway.app 접속 및 로그인
2. "New Project" 클릭
3. "Deploy from GitHub repo" 선택
4. `kospi-dashboard` 저장소 선택

### Step 2: PostgreSQL 추가

1. Railway 대시보드에서 "+ New" 클릭
2. "Database" → "PostgreSQL" 선택
3. 자동으로 `DATABASE_URL` 환경변수가 생성됩니다

### Step 3: 환경 변수 설정

Railway 프로젝트 → "Variables" 탭에서 다음 변수들을 추가:

#### 필수 환경 변수
```
DATABASE_URL=<자동 생성됨>
FRED_API_KEY=22657b2b26b8b8a9641ea58fed9c6916
EXIM_API_KEY=bBFEqblxWAVHTs3FPp1CntgJ4mb5BeyJ
ADMIN_PASSWORD=kospi2025
RESEND_API_KEY=re_dRcXzEE6_12TraNctjd3ZBEFYcgPD3ZPS
```

#### 선택 환경 변수
```
RESEND_FROM_EMAIL=KOSPI Monitor <onboarding@resend.dev>
NEXT_PUBLIC_APP_URL=https://your-app.railway.app
NODE_ENV=production
```

### Step 4: 데이터베이스 스키마 변경

Railway는 PostgreSQL을 사용하므로 `prisma/schema.prisma`를 수정해야 합니다:

```prisma
datasource db {
  provider = "postgresql"  // sqlite에서 postgresql로 변경
  url      = env("DATABASE_URL")
}
```

그리고 SQLite 전용 타입을 PostgreSQL 타입으로 변경:

```prisma
model Indicator {
  date DateTime @unique @db.Date  // @db.Date 추가
}

model CollectionLog {
  date DateTime @db.Date  // @db.Date 추가
}
```

### Step 5: 배포 트리거

1. Railway는 GitHub에 푸시할 때마다 자동 배포됩니다
2. 또는 Railway 대시보드에서 "Deploy" 버튼 클릭

### Step 6: 배포 확인

1. Railway 대시보드에서 "View Logs" 클릭
2. 빌드 및 배포 진행 상황 확인
3. 배포 완료 후 생성된 URL 클릭 (예: `https://kospi-dashboard.railway.app`)

---

## 배포 후 설정

### 1. 관리자 접속
```
https://your-app.railway.app/admin
비밀번호: kospi2025
```

### 2. 수동 데이터 입력
- 메모리 가격
- 반도체 영업이익
- 밸류업 지수
- S&P500 PBR
- AI CapEx 성장률

### 3. 이메일 알림 설정
```
https://your-app.railway.app/admin/alerts
```
- 이메일 주소 추가
- 알림 활성화

### 4. 첫 데이터 수집 테스트
```bash
curl https://your-app.railway.app/api/cron
```

---

## 자동 스케줄러 설정

Railway에서는 cron job을 직접 지원하지 않으므로 외부 서비스를 사용해야 합니다.

### 옵션 1: Cron-job.org (추천)
1. https://cron-job.org 가입
2. "Create cronjob" 클릭
3. URL: `https://your-app.railway.app/api/cron`
4. Schedule: `0 9 * * *` (매일 오전 9시 한국시간)
5. Timezone: Asia/Seoul

### 옵션 2: EasyCron
1. https://www.easycron.com 가입
2. Cron job 생성
3. URL 및 스케줄 설정

### 옵션 3: GitHub Actions
`.github/workflows/daily-collect.yml` 파일 생성:

```yaml
name: Daily Data Collection
on:
  schedule:
    - cron: '0 0 * * *'  # UTC 00:00 = KST 09:00
  workflow_dispatch:

jobs:
  collect:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger collection
        run: |
          curl https://your-app.railway.app/api/cron
```

---

## 문제 해결

### 데이터베이스 마이그레이션 실패
```bash
# Railway CLI 설치
npm install -g railway

# Railway 프로젝트 연결
railway login
railway link

# 마이그레이션 수동 실행
railway run npx prisma migrate deploy
```

### 빌드 실패
- `railway.toml` 파일이 올바른지 확인
- `package.json`의 `build` 스크립트 확인
- Railway 로그에서 에러 메시지 확인

### 환경 변수 누락
- Railway Variables 탭에서 모든 필수 변수 확인
- 변수 저장 후 재배포 필요

---

## 모니터링

### Railway 대시보드
- CPU/메모리 사용량 확인
- 응답 시간 모니터링
- 에러 로그 확인

### 알림 히스토리
```
https://your-app.railway.app/admin/alerts
```
- 발송된 이메일 확인
- 알림 조건 충족 여부 확인

---

## 비용

### Railway 무료 플랜
- $5 무료 크레딧/월
- PostgreSQL 포함
- 충분한 리소스 제공

### 예상 사용량
- 1일 1회 데이터 수집
- 이메일 알림: Resend 무료 플랜 (100개/일)
- 예상 비용: **무료**

---

## 다음 단계

1. ✅ API 키 설정 완료
2. ⏳ GitHub 저장소 생성
3. ⏳ Railway 프로젝트 생성
4. ⏳ PostgreSQL 추가
5. ⏳ 환경 변수 설정
6. ⏳ 스키마 PostgreSQL 전환
7. ⏳ 배포 및 테스트

**준비 완료! GitHub에 푸시 후 Railway 배포를 시작하세요! 🚀**
