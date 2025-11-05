// 이메일 알림 시스템
import { Resend } from 'resend'
import { prisma } from './prisma'
import type { Indicator } from '@prisma/client'

const resend = new Resend(process.env.RESEND_API_KEY)

interface AlertCondition {
  type: 'score' | 'foreignNetBuying' | 'usdKrwRate' | 'kospiPbr' | 'us10YearRate'
  operator: 'above' | 'below'
  threshold: number
  message: string
}

// 기본 알림 조건
const DEFAULT_CONDITIONS: AlertCondition[] = [
  {
    type: 'score',
    operator: 'above',
    threshold: 7,
    message: '종합 점수가 7점 이상입니다. 강한 매수 신호입니다.'
  },
  {
    type: 'score',
    operator: 'below',
    threshold: 3,
    message: '종합 점수가 3점 이하입니다. 강한 매도 신호입니다.'
  },
  {
    type: 'foreignNetBuying',
    operator: 'above',
    threshold: 500000000000, // 5000억 이상
    message: '외국인 순매수가 5000억 원을 초과했습니다.'
  },
  {
    type: 'usdKrwRate',
    operator: 'above',
    threshold: 1400,
    message: '원/달러 환율이 1,400원을 돌파했습니다. 약세 우려'
  },
  {
    type: 'kospiPbr',
    operator: 'below',
    threshold: 0.9,
    message: 'KOSPI PBR이 0.9 미만입니다. 저평가 구간 진입'
  }
]

// 알림 조건 확인
function checkConditions(indicator: Indicator): AlertCondition[] {
  const triggered: AlertCondition[] = []

  for (const condition of DEFAULT_CONDITIONS) {
    const value = indicator[condition.type]

    if (value === null || value === undefined) continue

    if (condition.operator === 'above' && value > condition.threshold) {
      triggered.push(condition)
    } else if (condition.operator === 'below' && value < condition.threshold) {
      triggered.push(condition)
    }
  }

  return triggered
}

// 이메일 전송
async function sendAlertEmail(
  toEmail: string,
  indicator: Indicator,
  conditions: AlertCondition[]
) {
  const date = indicator.date.toLocaleDateString('ko-KR')
  const scenario =
    indicator.scenario === 'bullish'
      ? '강세 (5000 시나리오)'
      : indicator.scenario === 'bearish'
        ? '약세 (3300 시나리오)'
        : '중립'

  const conditionList = conditions.map((c) => `• ${c.message}`).join('\n')

  const emailHtml = `
    <h2>📊 KOSPI 모니터링 알림</h2>
    <p><strong>날짜:</strong> ${date}</p>
    <p><strong>종합 점수:</strong> ${indicator.score}/10</p>
    <p><strong>시나리오:</strong> ${scenario}</p>

    <h3>⚠️ 트리거된 조건:</h3>
    <pre>${conditionList}</pre>

    <h3>📈 주요 지표:</h3>
    <ul>
      <li>외국인 순매수: ${indicator.foreignNetBuying ? (indicator.foreignNetBuying / 100000000).toFixed(0) + '억 원' : 'N/A'}</li>
      <li>원/달러 환율: ${indicator.usdKrwRate ? indicator.usdKrwRate.toFixed(2) + '원' : 'N/A'}</li>
      <li>KOSPI PBR: ${indicator.kospiPbr ? indicator.kospiPbr.toFixed(2) + '배' : 'N/A'}</li>
      <li>미 10년물 금리: ${indicator.us10YearRate ? indicator.us10YearRate.toFixed(2) + '%' : 'N/A'}</li>
    </ul>

    <p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}">대시보드 보기</a></p>
  `

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'KOSPI Monitor <onboarding@resend.dev>',
      to: [toEmail],
      subject: `[KOSPI 알림] ${scenario} - 점수 ${indicator.score}/10`,
      html: emailHtml
    })

    if (error) {
      console.error('[Email] Send failed:', error)
      return { success: false, error }
    }

    console.log('[Email] Sent successfully:', data?.id)
    return { success: true, data }
  } catch (error) {
    console.error('[Email] Exception:', error)
    return { success: false, error }
  }
}

// 알림 확인 및 전송 메인 함수
export async function checkAndSendAlerts(indicator: Indicator) {
  // 활성화된 알림 설정 조회
  const activeAlerts = await prisma.alert.findMany({
    where: { isActive: true }
  })

  if (activeAlerts.length === 0) {
    console.log('[Alerts] No active alerts configured')
    return
  }

  // 조건 확인
  const triggeredConditions = checkConditions(indicator)

  if (triggeredConditions.length === 0) {
    console.log('[Alerts] No conditions triggered')
    return
  }

  console.log(`[Alerts] ${triggeredConditions.length} conditions triggered`)

  // 각 활성 알림에 대해 이메일 전송
  for (const alert of activeAlerts) {
    const result = await sendAlertEmail(alert.email, indicator, triggeredConditions)

    // 알림 히스토리 기록
    await prisma.alertHistory.create({
      data: {
        alertId: alert.id,
        indicatorId: indicator.id,
        conditionsMet: JSON.stringify(triggeredConditions.map((c) => c.message)),
        emailSent: result.success,
        errorMessage: result.success ? null : JSON.stringify(result.error)
      }
    })
  }
}

// 알림 생성
export async function createAlert(email: string, name?: string) {
  return await prisma.alert.create({
    data: {
      email,
      name: name || email
    }
  })
}

// 알림 토글
export async function toggleAlert(alertId: string, isActive: boolean) {
  return await prisma.alert.update({
    where: { id: alertId },
    data: { isActive }
  })
}
