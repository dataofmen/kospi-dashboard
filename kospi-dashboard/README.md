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

- ✅ **자동 데이터 수집**: 5개 지표 자동 수집
- ✅ **종합 점수**: 0-10 스케일 점수 자동 계산
- ✅ **시나리오 판정**: 강세/중립/약세 자동 판정
- ✅ **색상 코딩**: 상승/하락 신호 시각화
- 🚧 **관리자 UI**: 수동 데이터 입력 (개발 중)
- 🚧 **추세 차트**: 과거 데이터 그래프 (개발 중)

## 🏗️ 기술 스택

- Next.js 14, TypeScript, Tailwind CSS
- PostgreSQL + Prisma ORM
- Axios + Cheerio (웹 스크래핑)

## 📚 자세한 문서

프로젝트 루트의 `PRD.md` 파일 참조
