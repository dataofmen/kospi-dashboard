# 🚀 Railway 배포 가이드 - 단계별 완전 가이드

## ✅ 현재 완료 상태

- [x] GitHub 저장소 생성: https://github.com/dataofmen/kospi-dashboard
- [x] 코드 푸시 완료
- [x] PostgreSQL 스키마 준비 완료
- [x] API 키 발급 완료

---

## 📝 Railway 배포 단계

### Step 1: Railway 회원가입 및 로그인

1. https://railway.app 접속
2. "Start a New Project" 또는 "Login with GitHub" 클릭
3. GitHub 계정으로 로그인

### Step 2: GitHub 저장소 연결

1. Railway 대시보드에서 **"New Project"** 클릭
2. **"Deploy from GitHub repo"** 선택
3. **"Configure GitHub App"** 클릭 (처음 사용 시)
4. `dataofmen/kospi-dashboard` 저장소 선택
5. **"Deploy Now"** 클릭

Railway가 자동으로:
- 저장소를 클론
- 의존성 설치
- Next.js 빌드
- 배포 URL 생성

### Step 3: PostgreSQL 데이터베이스 추가

1. 프로젝트 대시보드에서 **"+ New"** 버튼 클릭
2. **"Database"** 선택
3. **"Add PostgreSQL"** 클릭
4. 자동으로 `DATABASE_URL` 환경변수 생성됨

### Step 4: 환경 변수 설정

프로젝트에서 **"Variables"** 탭 클릭 후 다음 변수들을 추가:

#### 필수 환경 변수
```
DATABASE_URL
(자동 생성됨 - 건드리지 마세요)

FRED_API_KEY
22657b2b26b8b8a9641ea58fed9c6916

EXIM_API_KEY
bBFEqblxWAVHTs3FPp1CntgJ4mb5BeyJ

ADMIN_PASSWORD
kospi2025

RESEND_API_KEY
re_dRcXzEE6_12TraNctjd3ZBEFYcgPD3ZPS
```

#### 선택 환경 변수
```
RESEND_FROM_EMAIL
KOSPI Monitor <onboarding@resend.dev>

NODE_ENV
production
```

**중요**: `NEXT_PUBLIC_APP_URL`은 배포 후 생성된 URL로 설정해야 합니다.

### Step 5: 배포 URL 확인 및 NEXT_PUBLIC_APP_URL 설정

1. 배포 완료 대기 (2-3분 소요)
2. "Deployments" 탭에서 생성된 URL 확인
   - 예: `https://kospi-dashboard-production-xxxx.up.railway.app`
3. **"Variables"** 탭으로 돌아가서 추가:
   ```
   NEXT_PUBLIC_APP_URL
   https://kospi-dashboard-production-xxxx.up.railway.app
   ```
4. 저장 후 자동 재배포 대기

### Step 6: 데이터베이스 마이그레이션

Railway는 `railway.toml`의 `startCommand`에 마이그레이션이 포함되어 있어 자동 실행됩니다:

```toml
startCommand = "npx prisma migrate deploy && npm run start"
```

수동으로 확인하려면:
1. 프로젝트에서 **"Terminal"** 또는 **"CLI"** 접근
2. 다음 명령어 실행:
```bash
npx prisma migrate deploy
```

---

## 🧪 배포 확인 및 테스트

### 1. 웹사이트 접속
```
https://your-app-url.railway.app
```

**확인사항**:
- 메인 대시보드가 표시되는가?
- 지표 카드들이 보이는가? (데이터는 아직 없을 수 있음)

### 2. 관리자 페이지 접속
```
https://your-app-url.railway.app/admin
```

**로그인**:
- 비밀번호: `kospi2025`

**수동 데이터 입력**:
1. 날짜 선택
2. 5개 지표 입력:
   - 메모리 가격: `8.5`
   - 반도체 영업이익: `15.0`
   - 밸류업 지수: `3`
   - S&P500 PBR: `5.2`
   - AI CapEx 성장률: `25.0`
3. "저장하기" 클릭
4. 대시보드로 리다이렉트되면 성공!

### 3. 자동 데이터 수집 테스트
```bash
curl https://your-app-url.railway.app/api/cron
```

**확인**:
- 200 OK 응답
- 대시보드 새로고침 시 외국인/개인 순매수, 환율, PBR, 미국 금리 데이터 표시

### 4. 차트 페이지 확인
```
https://your-app-url.railway.app/charts
```

**확인**:
- 5개 차트 표시
- 기간 선택 버튼 동작

### 5. 알림 관리 페이지
```
https://your-app-url.railway.app/admin/alerts
```

**알림 추가**:
1. 이메일 주소 입력
2. "알림 추가" 클릭
3. 활성화 상태 확인

---

## 🔄 외부 Cron Job 설정

Railway는 자체 cron을 지원하지 않으므로 외부 서비스를 사용해야 합니다.

### 옵션 1: Cron-job.org (추천)

1. https://cron-job.org/en/ 접속 및 가입
2. **"Create cronjob"** 클릭
3. 다음 정보 입력:
   ```
   Title: KOSPI Daily Collection
   URL: https://your-app-url.railway.app/api/cron
   Schedule:
   - Hour: 9
   - Minute: 0
   - Day: * (every day)
   - Month: * (every month)
   - Weekday: * (every day of week)
   Timezone: Asia/Seoul
   ```
4. **"Create"** 클릭

### 옵션 2: EasyCron

1. https://www.easycron.com 가입
2. "Add Cron Job" 클릭
3. URL과 스케줄 설정 (동일)

### 옵션 3: GitHub Actions (무료, 추천)

`.github/workflows/daily-collection.yml` 파일 생성:

```yaml
name: Daily KOSPI Data Collection

on:
  schedule:
    # UTC 00:00 = KST 09:00
    - cron: '0 0 * * *'
  workflow_dispatch:  # 수동 실행 가능

jobs:
  collect-data:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger data collection
        run: |
          curl -X GET https://your-app-url.railway.app/api/cron
```

GitHub 저장소에 푸시:
```bash
mkdir -p .github/workflows
# 위 내용으로 파일 생성
git add .github/workflows/daily-collection.yml
git commit -m "Add GitHub Actions cron job"
git push
```

**수동 실행 테스트**:
- GitHub 저장소 → Actions 탭 → "Daily KOSPI Data Collection" → "Run workflow"

---

## 📧 이메일 알림 테스트

### 1. Resend 도메인 확인 (선택 사항)

기본적으로 `onboarding@resend.dev`에서 발송됩니다. 커스텀 도메인 사용 시:

1. https://resend.com/domains 접속
2. 도메인 추가 및 DNS 레코드 설정
3. Railway Variables에서 `RESEND_FROM_EMAIL` 업데이트

### 2. 수동 알림 트리거

점수 조건을 충족하도록 데이터 입력:

**강세 시나리오 테스트 (점수 ≥7)**:
- 외국인 순매수: `10000` (1조원)
- 환율: `1250`
- KOSPI PBR: `0.95`
- 미국 금리: `3.0`
- 메모리 가격: `12`
- 반도체 이익: `25`
- 밸류업: `5`
- S&P500 PBR: `4.0`
- AI CapEx: `30`

데이터 저장 후 등록된 이메일로 알림 수신 확인!

---

## 🐛 문제 해결 (Troubleshooting)

### 1. 빌드 실패

**증상**: Railway에서 빌드가 실패함

**해결**:
1. Railway 로그 확인: "View Logs" 클릭
2. 일반적인 원인:
   - 의존성 설치 실패 → `package.json` 확인
   - TypeScript 에러 → `npm run build` 로컬 테스트
   - 환경 변수 누락 → Variables 탭 확인

### 2. 데이터베이스 연결 실패

**증상**: 500 에러, "Can't reach database" 메시지

**해결**:
1. `DATABASE_URL` 환경변수 확인
2. PostgreSQL 데이터베이스가 같은 프로젝트에 있는지 확인
3. 마이그레이션 재실행:
```bash
# Railway CLI 설치
npm install -g railway

# 프로젝트 연결
railway login
railway link

# 마이그레이션
railway run npx prisma migrate deploy
```

### 3. API 키 오류

**증상**: 자동 수집 실패, API 키 관련 에러

**해결**:
1. Variables 탭에서 API 키 재확인:
   - FRED_API_KEY
   - EXIM_API_KEY
2. API 키 유효성 로컬 테스트:
```bash
curl "https://api.stlouisfed.org/fred/series/observations?series_id=DGS10&api_key=YOUR_KEY&file_type=json&limit=1"
```

### 4. 이메일 발송 실패

**증상**: 알림 조건 충족되지만 이메일 미수신

**해결**:
1. `RESEND_API_KEY` 확인
2. Resend 대시보드에서 API 키 활성 상태 확인
3. 스팸 폴더 확인
4. Railway 로그에서 Resend 에러 메시지 확인

### 5. 스케줄러 미작동

**증상**: 매일 오전 9시에 자동 수집 안 됨

**원인**: Railway는 자체 cron 없음

**해결**:
- 외부 Cron 서비스 설정 필수 (위 섹션 참조)
- GitHub Actions 사용 권장

---

## 📊 모니터링 및 유지보수

### Railway 대시보드 확인

**Metrics 탭**:
- CPU 사용량
- 메모리 사용량
- 응답 시간
- 에러 로그

**권장 확인 주기**: 주 1회

### 데이터베이스 관리

**Prisma Studio로 데이터 확인**:
```bash
railway run npx prisma studio
```

**백업 (중요 데이터)**:
```bash
railway run npx prisma db pull
```

### 비용 모니터링

**Railway 무료 플랜**:
- $5 크레딧/월
- PostgreSQL 포함

**예상 사용량**:
- Next.js 앱: ~$2-3/월
- PostgreSQL: ~$1-2/월
- **총 예상: $3-5/월 (무료 크레딧 내)**

---

## ✅ 최종 체크리스트

배포 완료 후 다음을 확인하세요:

- [ ] 웹사이트 접속 가능
- [ ] 관리자 로그인 작동
- [ ] 수동 데이터 입력 성공
- [ ] 자동 수집 API 호출 성공
- [ ] 차트 페이지 표시
- [ ] 알림 이메일 수신 테스트
- [ ] 외부 Cron Job 설정 완료
- [ ] GitHub Actions (옵션) 설정
- [ ] Railway 비용 모니터링 설정

---

## 🎉 배포 완료!

모든 단계를 완료하셨다면 축하드립니다!

**다음 단계**:
1. 매일 오전 9시에 자동 수집 확인
2. 주요 지표 변화 시 이메일 알림 수신
3. 차트로 추세 분석
4. 필요 시 수동 데이터 입력

**문의 및 지원**:
- GitHub Issues: https://github.com/dataofmen/kospi-dashboard/issues
- Railway Support: https://railway.app/help

---

**배포 날짜**: 2025년 11월 5일
**저장소**: https://github.com/dataofmen/kospi-dashboard
**Railway 프로젝트**: (배포 후 URL 추가)
