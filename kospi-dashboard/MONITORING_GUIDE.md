# KOSPI 모니터링 대시보드 운영 가이드

## 📊 일상 모니터링 (5분/일)

### 매일 확인 사항

#### 1. Railway 대시보드 확인 (2분)
```
https://railway.app/dashboard
→ 프로젝트 선택
→ Metrics 탭
```

**정상 상태 기준**:
- ✅ Status: Active (초록색)
- ✅ CPU: <50%
- ✅ Memory: <200MB
- ✅ Deployments: Latest deployment active
- ✅ Health Check: Passing

**이상 징후**:
- ⚠️ CPU >70% → 성능 저하 가능
- ⚠️ Memory >300MB → 메모리 누수 의심
- 🚨 Status: Error/Crashed → 즉시 대응 필요

#### 2. 데이터 수집 로그 확인 (2분)
```
Railway 대시보드 → Logs 탭
→ 필터: "Fetching foreign net buying"
```

**확인 항목**:
- ✅ 매일 18:00 UTC (한국 시간 오전 3시) 실행됨
- ✅ 4개 데이터 소스 모두 성공
- ✅ "Indicator saved with ID: X" 메시지
- ✅ "Alerts checked and sent" 메시지

**예시 로그**:
```
[2025-01-15 18:00:01] Fetching foreign net buying...
[2025-01-15 18:00:02] ✅ Foreign net buying: 1000
[2025-01-15 18:00:02] Fetching KOSPI PBR...
[2025-01-15 18:00:03] ✅ KOSPI PBR: 0.9
[2025-01-15 18:00:03] Fetching USD/KRW rate...
[2025-01-15 18:00:04] ✅ USD/KRW: 1350
[2025-01-15 18:00:04] Fetching US 10-year rate...
[2025-01-15 18:00:05] ✅ US 10-year: 4.5
[2025-01-15 18:00:05] Indicator saved with ID: 42
[2025-01-15 18:00:06] Alerts checked and sent
```

#### 3. 이메일 알림 확인 (1분)
```
등록된 이메일 → 받은편지함
→ 발신자: "KOSPI Monitor"
```

**확인 항목**:
- ✅ 조건 충족 시 이메일 도착 (1-2분 내)
- ✅ 이메일 내용 정확성
- ✅ 링크 정상 작동

---

## 🔍 주간 점검 (30분/주)

### 매주 월요일 점검 사항

#### 1. 데이터 수집 안정성 (10분)
```bash
# API로 최근 7일 데이터 확인
curl https://your-project.railway.app/api/indicators?days=7
```

**확인 항목**:
- ✅ 7개 데이터 포인트 존재
- ✅ 각 지표 값의 합리성
- ✅ 누락된 날짜 없음

**데이터 무결성 체크**:
```javascript
// 예상 범위
외국인 순매수: -10000 ~ +10000
KOSPI PBR: 0.5 ~ 2.0
USD/KRW: 1200 ~ 1500
미국 10년 국채: 3.0 ~ 6.0
```

#### 2. 이메일 발송 히스토리 (5분)
```
관리자 페이지 → "알림 관리"
→ "알림 히스토리" 확인
```

**확인 항목**:
- ✅ 발송 성공률 >95%
- ✅ 실패 사유 확인 (있는 경우)
- ✅ 조건 충족 빈도 적절성

#### 3. 성능 지표 분석 (10분)
```
Railway 대시보드 → Metrics 탭
→ Last 7 days
```

**분석 항목**:
- **CPU Usage**: 평균 <30%, 최대 <70%
- **Memory Usage**: 평균 <150MB, 최대 <250MB
- **Response Time**: 평균 <500ms, 최대 <2s
- **Request Count**: 하루 평균 50-100회

**비정상 패턴**:
- 🚨 CPU 급증 → 스크래핑 오류 또는 무한 루프
- 🚨 Memory 지속 증가 → 메모리 누수
- 🚨 Response Time >3s → 외부 API 지연

#### 4. 외부 서비스 상태 (5분)

**Cron-job.org 확인**:
```
https://cron-job.org/
→ "Cronjobs" 탭
→ "KOSPI Daily Collection" 확인
```

**확인 항목**:
- ✅ Status: Enabled
- ✅ Last Execution: Success (200 OK)
- ✅ Next Execution: 올바른 시간 설정
- ✅ Execution History: 성공률 >95%

**API 키 유효성**:
```bash
# FRED API 테스트
curl "https://api.stlouisfed.org/fred/series/observations?series_id=DGS10&api_key=YOUR_KEY&limit=1&sort_order=desc&file_type=json"

# EXIM API 테스트
curl "https://www.koreaexim.go.kr/site/program/financial/exchangeJSON?authkey=YOUR_KEY&data=AP01"

# Resend API 테스트
curl -X GET https://api.resend.com/api-keys \
  -H "Authorization: Bearer YOUR_KEY"
```

---

## 📅 월간 유지보수 (2시간/월)

### 매월 1일 작업 사항

#### 1. 데이터베이스 정리 (30분)

**오래된 데이터 아카이빙**:
```sql
-- 6개월 이상 된 데이터 확인
SELECT COUNT(*) FROM "Indicator"
WHERE "createdAt" < NOW() - INTERVAL '6 months';

-- 필요 시 백업 후 삭제
-- (현재는 데이터 크기가 작아 삭제 불필요)
```

**알림 히스토리 정리**:
```sql
-- 3개월 이상 된 알림 히스토리 확인
SELECT COUNT(*) FROM "AlertHistory"
WHERE "createdAt" < NOW() - INTERVAL '3 months';
```

#### 2. 보안 점검 (30분)

**API 키 로테이션 체크**:
- [ ] FRED API 키 유효성 (만료일 확인)
- [ ] EXIM API 키 유효성
- [ ] Resend API 키 유효성
- [ ] 관리자 비밀번호 변경 고려 (6개월마다)

**환경 변수 보안**:
```
Railway 대시보드 → Variables 탭
→ 모든 키 값 마스킹 확인
→ 로그에 키 노출 여부 확인
```

**의존성 보안 업데이트**:
```bash
# 보안 취약점 스캔
npm audit

# 중요 업데이트만 적용
npm audit fix --only=prod
```

#### 3. 성능 최적화 (30분)

**데이터베이스 인덱스 분석**:
```sql
-- 느린 쿼리 확인 (Railway PostgreSQL Insights)
SELECT * FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

**캐싱 전략 검토**:
- [ ] 최신 지표 조회 빈도 확인
- [ ] 캐싱 도입 고려 (Redis 또는 In-memory)

**스크래핑 성능 체크**:
```
Logs 탭 → 필터: "Fetching"
→ 각 소스별 응답 시간 확인
```

**기준**:
- 외국인 순매수: <3초
- KOSPI PBR: <3초
- USD/KRW 환율: <1초
- 미국 10년 국채: <1초

#### 4. 사용자 피드백 분석 (30분)

**이메일 알림 효과 분석**:
```sql
-- 알림 발송 통계
SELECT
  COUNT(*) as total_alerts,
  AVG(ARRAY_LENGTH("conditionsMet", 1)) as avg_conditions,
  SUM(CASE WHEN "emailSent" THEN 1 ELSE 0 END) as success_count
FROM "AlertHistory"
WHERE "createdAt" > NOW() - INTERVAL '1 month';
```

**투자 신호 정확도**:
- [ ] 강한 매수 신호 횟수
- [ ] 강한 매도 신호 횟수
- [ ] 신호와 실제 KOSPI 등락 상관관계

---

## 🚨 장애 대응 매뉴얼

### 1단계: 장애 감지

**자동 알림 설정** (Railway 대시보드):
```
Settings → Notifications
→ Enable: "Deployment failed"
→ Enable: "Service crashed"
→ Enable: "Health check failed"
```

**수동 확인 방법**:
```bash
# 헬스 체크
curl https://your-project.railway.app/

# 상태 코드 확인
# 200 OK: 정상
# 500 Error: 서버 오류
# 503 Unavailable: 서비스 다운
```

### 2단계: 장애 분류

#### 장애 유형 A - 배포 실패
**증상**: Deployment status: Failed

**확인**:
```
Railway 대시보드 → Deployments 탭
→ 최신 배포 클릭
→ Build Logs 확인
```

**일반적 원인**:
1. 코드 문법 오류
2. 의존성 설치 실패
3. 빌드 스크립트 오류

**해결**:
```bash
# 로컬에서 빌드 테스트
npm install
npm run build

# 문제 없으면 이전 배포로 롤백
Railway 대시보드 → Deployments
→ 이전 성공 배포 선택
→ "Redeploy"
```

#### 장애 유형 B - 런타임 에러
**증상**: Service crashed, Status: Error

**확인**:
```
Railway 대시보드 → Logs 탭
→ 필터: "error" OR "Error" OR "ERROR"
```

**일반적 원인**:
1. 환경 변수 누락/오타
2. 데이터베이스 연결 실패
3. 외부 API 오류

**해결 순서**:
```
1. Variables 탭 → 모든 환경 변수 확인
2. PostgreSQL 상태 확인 (Metrics)
3. 외부 API 테스트 (FRED, EXIM, Resend)
4. 프로젝트 재시작: Settings → "Restart"
```

#### 장애 유형 C - 데이터 수집 실패
**증상**: 로그에 "Fetching" 에러, 데이터 누락

**확인**:
```bash
# 수동 데이터 수집 트리거
curl -X POST https://your-project.railway.app/api/cron/collect \
  -H "Content-Type: application/json" \
  -d '{"password": "kospi2025"}'
```

**일반적 원인**:
1. 웹사이트 구조 변경 (네이버 금융)
2. API 키 만료 (FRED, EXIM)
3. API 요청 제한 초과
4. 네트워크 타임아웃

**해결**:
```
1. 각 소스 개별 테스트
2. API 키 갱신 (필요 시)
3. 스크래핑 코드 업데이트 (구조 변경 시)
4. 타임아웃 설정 증가 (필요 시)
```

#### 장애 유형 D - 이메일 발송 실패
**증상**: AlertHistory에 emailSent: false

**확인**:
```
관리자 페이지 → "알림 히스토리"
→ "에러 메시지" 컬럼 확인
```

**일반적 원인**:
1. Resend API 키 만료
2. 발신 이메일 미인증
3. 수신 이메일 형식 오류
4. Resend 서비스 장애

**해결**:
```bash
# Resend 상태 확인
curl https://status.resend.com/

# API 키 테스트
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "KOSPI Monitor <onboarding@resend.dev>",
    "to": "test@example.com",
    "subject": "Test",
    "html": "<p>Test</p>"
  }'
```

### 3단계: 긴급 조치

**즉시 롤백**:
```
Railway 대시보드 → Deployments
→ 마지막 정상 배포 선택
→ "Redeploy"
→ 2-3분 내 복구
```

**수동 데이터 입력**:
```
관리자 페이지 → "수동 데이터 입력"
→ 당일 지표 수동 입력
→ 자동 수집 복구될 때까지 사용
```

**사용자 공지**:
```
이메일 알림 사용자에게:
"일시적인 시스템 점검으로 오늘의 알림이 지연될 수 있습니다.
서비스는 정상 운영 중이며, 조속히 복구하겠습니다."
```

---

## 📈 성능 개선 가이드

### 1. 데이터베이스 최적화

**인덱스 추가** (느린 쿼리 발견 시):
```sql
-- 날짜별 조회 최적화
CREATE INDEX idx_indicator_created_at
ON "Indicator"("createdAt" DESC);

-- 알림 히스토리 조회 최적화
CREATE INDEX idx_alert_history_alert_id
ON "AlertHistory"("alertId");
```

**쿼리 최적화**:
```typescript
// 변경 전 (N+1 문제)
const alerts = await prisma.alert.findMany()
for (const alert of alerts) {
  const history = await prisma.alertHistory.findMany({
    where: { alertId: alert.id }
  })
}

// 변경 후 (Join 사용)
const alerts = await prisma.alert.findMany({
  include: { history: true }
})
```

### 2. 캐싱 전략

**Redis 도입 고려** (트래픽 증가 시):
```typescript
// 최신 지표 캐싱 (5분)
import Redis from 'ioredis'
const redis = new Redis(process.env.REDIS_URL)

export async function getLatestIndicator() {
  const cached = await redis.get('latest_indicator')
  if (cached) return JSON.parse(cached)

  const indicator = await prisma.indicator.findFirst({
    orderBy: { createdAt: 'desc' }
  })

  await redis.setex('latest_indicator', 300, JSON.stringify(indicator))
  return indicator
}
```

### 3. 스크래핑 최적화

**병렬 처리**:
```typescript
// 변경 전 (순차 실행, 총 10초)
const foreignNetBuying = await fetchForeignNetBuying()
const kospiPbr = await fetchKospiPbr()
const usdKrwRate = await fetchUsdKrwRate()
const us10YearRate = await fetchUs10YearRate()

// 변경 후 (병렬 실행, 총 3초)
const [foreignNetBuying, kospiPbr, usdKrwRate, us10YearRate] =
  await Promise.all([
    fetchForeignNetBuying(),
    fetchKospiPbr(),
    fetchUsdKrwRate(),
    fetchUs10YearRate()
  ])
```

### 4. 프론트엔드 최적화

**이미지 최적화** (추가 시):
```javascript
// next.config.js
module.exports = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
  }
}
```

**정적 페이지 생성**:
```typescript
// app/page.tsx
export const revalidate = 300 // 5분마다 재생성
```

---

## 🔧 유지보수 체크리스트

### 일일 체크리스트 (5분)
- [ ] Railway 서비스 상태: Active
- [ ] 데이터 수집 성공 (Logs 확인)
- [ ] 이메일 발송 정상 (조건 충족 시)

### 주간 체크리스트 (30분)
- [ ] 7일간 데이터 무결성 확인
- [ ] 이메일 발송 성공률 >95%
- [ ] 성능 지표 정상 범위
- [ ] Cron-job.org 실행 이력 확인
- [ ] 외부 API 키 유효성 테스트

### 월간 체크리스트 (2시간)
- [ ] 데이터베이스 정리 및 최적화
- [ ] API 키 로테이션 검토
- [ ] 의존성 보안 업데이트
- [ ] 성능 최적화 기회 탐색
- [ ] 사용자 피드백 분석

### 분기별 체크리스트 (4시간)
- [ ] 전체 시스템 보안 감사
- [ ] 백업 및 복구 절차 테스트
- [ ] 스케일링 필요성 검토
- [ ] 새로운 기능 우선순위 결정
- [ ] 기술 부채 평가 및 해소 계획

---

## 📞 지원 및 문의

### Railway 지원
- **문서**: https://docs.railway.app/
- **Discord**: https://discord.gg/railway
- **상태 페이지**: https://status.railway.app/

### API 제공자
- **FRED API**: https://fred.stlouisfed.org/docs/api/
- **EXIM API**: https://www.koreaexim.go.kr/
- **Resend**: https://resend.com/docs

### 프로젝트
- **GitHub**: https://github.com/dataofmen/kospi-dashboard
- **Issues**: https://github.com/dataofmen/kospi-dashboard/issues

---

## 📚 추가 문서

- `README.md` - 프로젝트 개요 및 로컬 개발 가이드
- `RAILWAY_DEPLOY_GUIDE.md` - Railway 배포 상세 가이드
- `DEPLOY_CHECKLIST.md` - 배포 단계별 체크리스트
- `POST_DEPLOY_VERIFICATION.md` - 배포 후 검증 가이드

---

✅ **안정적인 서비스 운영을 위해 정기적으로 모니터링하세요!**
