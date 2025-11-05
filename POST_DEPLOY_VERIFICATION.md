# Railway 배포 후 검증 가이드

## 📋 배포 직후 즉시 확인 (1분)

### 1. 배포 상태 확인
```bash
# Railway 대시보드에서 확인
✅ Build Status: Success
✅ Deploy Status: Active
✅ Health Check: Passing
```

### 2. 애플리케이션 접속
```
https://your-project-name.railway.app
```

**예상 화면**:
- KOSPI 모니터링 대시보드 메인 페이지
- 상단에 "KOSPI 투자 신호 모니터" 제목
- "관리자 페이지" 링크 표시

---

## 🔍 상세 검증 (5분)

### 3. 데이터베이스 연결 확인

**Railway 대시보드 → Variables 탭에서 확인**:
```env
DATABASE_URL=postgresql://postgres:...@...railway.app:5432/railway
```

**Logs 탭에서 확인**:
```
✅ "Prisma schema loaded"
✅ "Database connected"
❌ 에러 로그 없음
```

### 4. 환경 변수 확인

**Variables 탭에서 8개 변수 모두 설정되었는지 확인**:
- ✅ `FRED_API_KEY`
- ✅ `EXIM_API_KEY`
- ✅ `ADMIN_PASSWORD`
- ✅ `RESEND_API_KEY`
- ✅ `RESEND_FROM_EMAIL`
- ✅ `NODE_ENV=production`
- ✅ `DATABASE_URL` (PostgreSQL 자동 생성)
- ✅ `NEXT_PUBLIC_APP_URL=https://your-project.railway.app`

### 5. 관리자 페이지 접근 테스트

1. **접속**: `https://your-project.railway.app/admin`
2. **비밀번호 입력**: `kospi2025`
3. **예상 화면**:
   - "지표 관리" 섹션
   - "알림 관리" 섹션
   - "수동 데이터 입력" 폼

---

## 📊 기능 테스트 (10분)

### 6. 수동 데이터 입력 테스트

**관리자 페이지 → "수동 데이터 입력"**:

```
외국인 순매수: 1000
KOSPI PBR: 0.9
USD/KRW 환율: 1350
미국 10년 국채 금리: 4.5
```

**"데이터 저장" 클릭 후 확인**:
- ✅ "데이터가 저장되었습니다" 메시지
- ✅ 메인 페이지로 리다이렉트
- ✅ 입력한 데이터가 화면에 표시됨

### 7. 종합 점수 계산 확인

**메인 페이지에서 확인**:
- ✅ "종합 점수" 표시 (0-10점)
- ✅ 각 지표별 점수 표시
- ✅ "투자 신호" 메시지 (매수/중립/매도)

**예상 점수 계산**:
```
외국인 순매수 (1000): 2점
KOSPI PBR (0.9): 3점
USD/KRW (1350): 2점
미국 10년 국채 (4.5): 2점
━━━━━━━━━━━━━━━━━━━
총점: 9점 → "강한 매수 신호"
```

### 8. API 엔드포인트 테스트

**테스트 1 - 최신 지표 조회**:
```bash
curl https://your-project.railway.app/api/indicators/latest
```

**예상 응답**:
```json
{
  "id": 1,
  "foreignNetBuying": 1000,
  "kospiPbr": 0.9,
  "usdKrwRate": 1350,
  "us10YearRate": 4.5,
  "score": 9,
  "createdAt": "2025-01-15T..."
}
```

**테스트 2 - 데이터 수집 트리거 (관리자 비밀번호 필요)**:
```bash
curl -X POST https://your-project.railway.app/api/cron/collect \
  -H "Content-Type: application/json" \
  -d '{"password": "kospi2025"}'
```

**예상 응답**:
```json
{
  "success": true,
  "data": {
    "foreignNetBuying": ...,
    "kospiPbr": ...,
    "usdKrwRate": ...,
    "us10YearRate": ...
  }
}
```

---

## 📧 이메일 알림 테스트 (5분)

### 9. 이메일 알림 등록

**관리자 페이지 → "알림 관리" → "새 알림 추가"**:
```
이메일: your-test-email@example.com
```

**"추가" 클릭 후 확인**:
- ✅ 알림 목록에 추가됨
- ✅ "활성" 상태로 표시

### 10. 이메일 알림 발송 테스트

**방법 1 - 수동 데이터 입력으로 트리거**:
```
관리자 페이지 → "수동 데이터 입력"
→ 종합 점수 7점 이상 되도록 입력
→ "데이터 저장" 클릭
```

**방법 2 - API 직접 호출**:
```bash
curl -X POST https://your-project.railway.app/api/cron/collect \
  -H "Content-Type: application/json" \
  -d '{"password": "kospi2025"}'
```

**이메일 확인 (1-2분 내)**:
- ✅ 제목: "🚨 KOSPI 투자 알림"
- ✅ 내용: 각 지표 점수 + 종합 점수 + 투자 신호
- ✅ 발신자: "KOSPI Monitor <onboarding@resend.dev>"

---

## 🤖 자동 데이터 수집 설정 (5분)

### 11. Cron-job.org 설정

**주의**: Railway는 스케줄링 기능이 없으므로 외부 서비스 필요

1. **Cron-job.org 접속** → https://cron-job.org/
2. **계정 생성** (무료)
3. **새 Cronjob 생성**:
   ```
   Title: KOSPI Daily Collection
   URL: https://your-project.railway.app/api/cron/collect
   Method: POST
   Headers:
     Content-Type: application/json
   Body:
     {"password": "kospi2025"}
   Schedule: Every day at 18:00 (한국 시간 오전 3시)
   ```
4. **"Create cronjob" 클릭**

### 12. 첫 자동 수집 테스트

**Cron-job.org → "Execute now" 클릭**:

**성공 응답 확인**:
- ✅ Status Code: 200
- ✅ Response Body: `{"success": true, "data": {...}}`

**Railway Logs 확인**:
```
✅ "Fetching foreign net buying..."
✅ "Fetching KOSPI PBR..."
✅ "Fetching USD/KRW rate..."
✅ "Fetching US 10-year rate..."
✅ "Indicator saved with ID: ..."
✅ "Alerts checked and sent"
```

---

## ✅ 최종 검증 체크리스트

### 배포 상태
- [ ] Railway 프로젝트 "Active" 상태
- [ ] PostgreSQL 데이터베이스 연결됨
- [ ] 8개 환경 변수 모두 설정됨
- [ ] 빌드 에러 없음
- [ ] 런타임 에러 없음

### 기본 기능
- [ ] 메인 페이지 정상 로드
- [ ] 관리자 페이지 비밀번호 인증
- [ ] 수동 데이터 입력 작동
- [ ] 종합 점수 계산 정확
- [ ] 최신 지표 API 응답

### 데이터 수집
- [ ] API 엔드포인트 정상 작동
- [ ] 외국인 순매수 스크래핑 성공
- [ ] KOSPI PBR 스크래핑 성공
- [ ] USD/KRW 환율 API 호출 성공
- [ ] 미국 10년 국채 API 호출 성공

### 이메일 알림
- [ ] 알림 등록 가능
- [ ] 알림 활성화/비활성화 가능
- [ ] 이메일 발송 성공 (Resend)
- [ ] 알림 히스토리 저장됨

### 자동화
- [ ] Cron-job.org 설정 완료
- [ ] 일일 자동 수집 스케줄 설정
- [ ] 테스트 실행 성공

---

## 🐛 문제 해결

### 문제 1: "Database connection failed"

**원인**: PostgreSQL 미설정 또는 환경 변수 오류

**해결**:
1. Railway 대시보드 → "+ New" → "Database" → "Add PostgreSQL"
2. Variables 탭에서 `DATABASE_URL` 자동 생성 확인
3. 프로젝트 재배포: Settings → "Restart"

### 문제 2: "FRED API error" / "EXIM API error"

**원인**: API 키 오류 또는 API 제한

**확인**:
```bash
# FRED API 테스트
curl "https://api.stlouisfed.org/fred/series/observations?series_id=DGS10&api_key=YOUR_KEY&limit=1&sort_order=desc&file_type=json"

# EXIM API 테스트
curl "https://www.koreaexim.go.kr/site/program/financial/exchangeJSON?authkey=YOUR_KEY&data=AP01"
```

**해결**:
- API 키 재확인
- Variables 탭에서 정확한 키 입력
- 프로젝트 재배포

### 문제 3: 이메일 발송 실패

**원인**: Resend API 키 오류 또는 발신자 이메일 미인증

**확인**:
```bash
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer YOUR_RESEND_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "KOSPI Monitor <onboarding@resend.dev>",
    "to": "test@example.com",
    "subject": "Test",
    "html": "<p>Test email</p>"
  }'
```

**해결**:
- Resend 대시보드에서 API 키 확인
- `onboarding@resend.dev` 사용 (Resend 테스트 도메인)
- 프로덕션용 도메인 사용 시 도메인 인증 필요

### 문제 4: 스크래핑 실패

**원인**: 웹사이트 구조 변경 또는 접근 제한

**확인**:
```bash
# 외국인 순매수 스크래핑 테스트
curl "https://finance.naver.com/sise/sise_foreign.naver"

# KOSPI PBR 스크래핑 테스트
curl "https://finance.naver.com/sise/sise_market_sum.naver"
```

**해결**:
- Railway Logs에서 상세 에러 확인
- 필요 시 User-Agent 헤더 추가
- 대체 데이터 소스 고려

### 문제 5: Cron job 실행 실패

**원인**: 비밀번호 오류 또는 URL 오타

**확인**:
```bash
curl -X POST https://your-project.railway.app/api/cron/collect \
  -H "Content-Type: application/json" \
  -d '{"password": "kospi2025"}' \
  -v
```

**해결**:
- Cron-job.org에서 URL 재확인
- Body에 올바른 비밀번호 입력
- Railway Logs에서 요청 로그 확인

---

## 📈 성능 모니터링

### Railway 대시보드 확인 항목

1. **Metrics 탭**:
   - CPU Usage: <50% (정상)
   - Memory Usage: <200MB (정상)
   - Request Count: 하루 평균 24회 (자동 수집) + 사용자 접속

2. **Logs 탭**:
   - 에러 로그 없음
   - 데이터 수집 로그 확인 (매일 18:00 UTC)
   - 이메일 발송 로그 확인

3. **Deployments 탭**:
   - 최신 배포 "Active" 상태
   - 이전 배포 롤백 가능

---

## 🎯 다음 단계

### 배포 후 24시간 이내
- [ ] 첫 자동 데이터 수집 성공 확인
- [ ] 이메일 알림 정상 발송 확인
- [ ] 에러 로그 모니터링

### 배포 후 1주일 이내
- [ ] 데이터 수집 안정성 확인 (7/7 성공)
- [ ] 이메일 발송 안정성 확인
- [ ] 성능 메트릭 분석

### 장기 운영
- [ ] 월간 데이터 분석
- [ ] API 키 갱신 (필요 시)
- [ ] 사용자 피드백 반영
- [ ] 기능 개선 및 확장

---

## 📞 지원

**문제 발생 시 확인 순서**:
1. Railway Logs 탭 확인
2. 이 가이드의 "문제 해결" 섹션 참고
3. GitHub Issues: https://github.com/dataofmen/kospi-dashboard/issues

**추가 문서**:
- `RAILWAY_DEPLOY_GUIDE.md` - 배포 상세 가이드
- `DEPLOY_CHECKLIST.md` - 배포 체크리스트
- `README.md` - 프로젝트 개요

---

✅ **검증 완료 후 프로젝트 안정화!**
