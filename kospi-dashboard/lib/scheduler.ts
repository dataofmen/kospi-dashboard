// 일간 자동 데이터 수집 스케줄러
import cron from 'node-cron'
import { collectAllData } from './collectors'
import { calculateScore } from './score-calculator'
import { prisma } from './prisma'

let schedulerStarted = false

export function startScheduler() {
  if (schedulerStarted) {
    console.log('[Scheduler] Already running')
    return
  }

  // 매일 오전 9시 실행 (한국 시간 기준)
  // cron 표현식: '분 시 일 월 요일'
  // '0 9 * * *' = 매일 9시 0분
  const schedule = '0 9 * * *'

  cron.schedule(schedule, async () => {
    console.log('[Scheduler] Starting daily data collection at', new Date().toISOString())

    try {
      // 자동 데이터 수집
      const collectedData = await collectAllData()

      // 오늘 날짜
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // 기존 데이터 확인 (수동 입력 데이터 보존)
      const existing = await prisma.indicator.findUnique({
        where: { date: today }
      })

      // 전체 데이터 병합
      const fullData = {
        ...collectedData,
        memoryPrice: existing?.memoryPrice,
        semiconductorProfit: existing?.semiconductorProfit,
        valuationIndex: existing?.valuationIndex,
        sp500Pbr: existing?.sp500Pbr,
        aiCapexGrowth: existing?.aiCapexGrowth
      }

      // 종합 점수 계산
      const scoreResult = calculateScore(fullData)

      // DB 저장
      const indicator = await prisma.indicator.upsert({
        where: { date: today },
        update: {
          ...collectedData,
          score: scoreResult.score,
          scenario: scoreResult.scenario,
          ...scoreResult.signals
        },
        create: {
          date: today,
          ...fullData,
          score: scoreResult.score,
          scenario: scoreResult.scenario,
          ...scoreResult.signals
        }
      })

      console.log('[Scheduler] Collection complete. Score:', indicator.score)

      // 알림 조건 체크 및 이메일 발송
      const { checkAndSendAlerts } = await import('./alerts')
      await checkAndSendAlerts(indicator)
    } catch (error) {
      console.error('[Scheduler] Collection failed:', error)

      // TODO: 에러 알림 발송
      // await sendErrorAlert(error)
    }
  })

  schedulerStarted = true
  console.log(`[Scheduler] Started. Will run daily at ${schedule}`)
}

// 수동 실행 함수 (테스트용)
export async function runCollectionNow() {
  console.log('[Manual Collection] Starting...')

  try {
    const collectedData = await collectAllData()

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const existing = await prisma.indicator.findUnique({
      where: { date: today }
    })

    const fullData = {
      ...collectedData,
      memoryPrice: existing?.memoryPrice,
      semiconductorProfit: existing?.semiconductorProfit,
      valuationIndex: existing?.valuationIndex,
      sp500Pbr: existing?.sp500Pbr,
      aiCapexGrowth: existing?.aiCapexGrowth
    }

    const scoreResult = calculateScore(fullData)

    const indicator = await prisma.indicator.upsert({
      where: { date: today },
      update: {
        ...collectedData,
        score: scoreResult.score,
        scenario: scoreResult.scenario,
        ...scoreResult.signals
      },
      create: {
        date: today,
        ...fullData,
        score: scoreResult.score,
        scenario: scoreResult.scenario,
        ...scoreResult.signals
      }
    })

    console.log('[Manual Collection] Success. Score:', indicator.score)

    // 알림 조건 체크 및 이메일 발송
    const { checkAndSendAlerts } = await import('./alerts')
    await checkAndSendAlerts(indicator)

    return { success: true, data: indicator }
  } catch (error) {
    console.error('[Manual Collection] Failed:', error)
    return { success: false, error }
  }
}
