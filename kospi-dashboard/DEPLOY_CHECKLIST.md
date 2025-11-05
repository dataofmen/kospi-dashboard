# 🚀 Railway 배포 체크리스트

## ✅ 배포 전 준비사항

- [x] GitHub 저장소 생성 완료
- [x] 코드 푸시 완료
- [x] API 키 확인:
  - FRED API: `22657b2b26b8b8a9641ea58fed9c6916`
  - EXIM API: `bBFEqblxWAVHTs3FPp1CntgJ4mb5BeyJ`
  - Resend API: `re_dRcXzEE6_12TraNctjd3ZBEFYcgPD3ZPS`

## 📋 Railway 배포 단계 (5분)

### 1️⃣ Railway 프로젝트 생성
- [ ] https://railway.app 로그인 (GitHub 계정)
- [ ] "New Project" 클릭
- [ ] "Deploy from GitHub repo" 선택
- [ ] `dataofmen/kospi-dashboard` 선택

### 2️⃣ PostgreSQL 추가
- [ ] 프로젝트에서 "+ New" 클릭
- [ ] "Database" → "Add PostgreSQL" 선택
- [ ] `DATABASE_URL` 자동 연결 확인

### 3️⃣ 환경 변수 설정
프로젝트 → "Variables" 탭에서 복사&붙여넣기:

```
FRED_API_KEY=22657b2b26b8b8a9641ea58fed9c6916
EXIM_API_KEY=bBFEqblxWAVHTs3FPp1CntgJ4mb5BeyJ
ADMIN_PASSWORD=kospi2025
RESEND_API_KEY=re_dRcXzEE6_12TraNctjd3ZBEFYcgPD3ZPS
RESEND_FROM_EMAIL=KOSPI Monitor <onboarding@resend.dev>
NODE_ENV=production
```

- [ ] 모든 환경 변수 입력 완료
- [ ] "Add" 버튼으로 저장

### 4️⃣ 배포 완료 대기
- [ ] Railway 빌드 로그 확인
- [ ] "✓ Build successful" 메시지 확인
- [ ] "✓ Deployed" 상태 확인
- [ ] 생성된 URL 복사 (예: `https://kospi-dashboard-production.railway.app`)

## 🔍 배포 후 확인사항

### 5️⃣ 앱 정상 작동 확인
- [ ] Railway URL 접속
- [ ] 대시보드 화면 정상 로드 확인
- [ ] "No data available" 메시지 확인 (정상 - 아직 데이터 없음)

### 6️⃣ 관리자 패널 접속
URL: `https://your-app.railway.app/admin`

- [ ] 비밀번호 `kospi2025` 입력
- [ ] 관리자 화면 로드 확인

### 7️⃣ 수동 데이터 입력
관리자 패널에서 다음 지표 입력:

- [ ] 메모리 가격: `2.5` (USD)
- [ ] 반도체 영업이익: `8.5` (조원)
- [ ] 밸류업 지수: `3` (0-5)
- [ ] S&P500 PBR: `4.8`
- [ ] AI CapEx 성장률: `35` (%)

- [ ] "수동 데이터 입력" 버튼 클릭
- [ ] "성공" 메시지 확인
- [ ] 대시보드로 돌아가서 데이터 표시 확인

### 8️⃣ 이메일 알림 설정
관리자 패널 → "알림 관리" 버튼:

- [ ] 이메일 주소 입력
- [ ] "알림 추가" 클릭
- [ ] 활성화 상태 확인 (토글 ON)

### 9️⃣ 첫 데이터 수집 테스트
터미널에서 실행:

```bash
curl https://your-app.railway.app/api/cron
```

- [ ] `{"success": true}` 응답 확인
- [ ] 대시보드에서 자동 수집된 데이터 확인:
  - 외국인 순매수
  - 개인 순매수
  - USD/KRW 환율
  - KOSPI PBR
  - 미국 10년물 금리

### 🔟 외부 크론 설정 (필수)

**옵션 1: Cron-job.org** (추천 - 무료)

- [ ] https://cron-job.org 가입
- [ ] "Create cronjob" 클릭
- [ ] Title: `KOSPI Daily Collection`
- [ ] URL: `https://your-app.railway.app/api/cron`
- [ ] Schedule: `0 9 * * *`
- [ ] Timezone: `Asia/Seoul`
- [ ] "Create" 클릭
- [ ] 상태 "Enabled" 확인

**옵션 2: GitHub Actions** (대안)

- [ ] `.github/workflows/daily-collect.yml` 파일 생성
- [ ] `RAILWAY_DEPLOY_GUIDE.md` 참조하여 워크플로우 설정
- [ ] GitHub Secrets에 Railway URL 추가

## ✨ 최종 확인

### 모든 기능 점검
- [ ] ✅ 대시보드 접속 및 데이터 표시
- [ ] ✅ 종합 점수 계산 (0-10)
- [ ] ✅ 시나리오 판정 (강세/중립/약세)
- [ ] ✅ 색상 코딩 (빨강/노랑/초록)
- [ ] ✅ 관리자 패널 수동 입력
- [ ] ✅ 추세 차트 표시
- [ ] ✅ 이메일 알림 활성화
- [ ] ✅ 자동 데이터 수집 (`/api/cron`)
- [ ] ✅ 외부 크론 스케줄러 설정 (매일 오전 9시)

## 🎉 배포 완료!

**축하합니다!** KOSPI 모니터링 대시보드가 성공적으로 배포되었습니다.

### 다음 단계
1. 매일 오전 9시에 자동 데이터 수집 확인
2. 알림 이메일 수신 테스트
3. 필요시 알림 조건 조정 (`lib/alerts.ts`)
4. 추세 분석을 위한 데이터 누적 (최소 7일)

### 모니터링
- Railway 대시보드에서 CPU/메모리 사용량 확인
- `/admin/alerts` 에서 알림 발송 히스토리 확인
- Railway 로그에서 에러 메시지 모니터링

### 문제 발생 시
- `RAILWAY_DEPLOY_GUIDE.md` 트러블슈팅 섹션 참조
- Railway 로그 확인: 프로젝트 → "Deployments" → 최신 배포 클릭
- 데이터베이스 연결 확인: `DATABASE_URL` 환경변수 확인

---

**프로젝트 정보**
- GitHub: https://github.com/dataofmen/kospi-dashboard
- Railway: https://railway.app
- 문서: `README.md`, `PRD.md`, `RAILWAY_DEPLOY_GUIDE.md`
