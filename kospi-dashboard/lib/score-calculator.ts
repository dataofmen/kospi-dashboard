// 종합 점수 계산 로직
import type { ScoreCalculation, IndicatorSignals } from './collectors/types'

interface FullIndicatorData {
  foreignNetBuying?: number
  usdKrwRate?: number
  kospiPbr?: number
  us10YearRate?: number
  individualNetBuying?: number
  memoryPrice?: number
  semiconductorProfit?: number
  valuationIndex?: number
  sp500Pbr?: number
  aiCapexGrowth?: number
}

export function calculateScore(data: FullIndicatorData): ScoreCalculation {
  const signals: IndicatorSignals = {}
  let bullishCount = 0
  let bearishCount = 0

  // 1. 외국인 순매수 (상승 신호)
  if (data.foreignNetBuying !== undefined) {
    if (data.foreignNetBuying > 0) {
      signals.foreignNetBuyingSignal = '매수'
      bullishCount++
    } else {
      signals.foreignNetBuyingSignal = '매도'
      bearishCount++
    }
  }

  // 2. 원/달러 환율 (1,300 이하면 강세 = 상승 신호)
  if (data.usdKrwRate !== undefined) {
    if (data.usdKrwRate < 1300) {
      signals.usdKrwRateSignal = '강세'
      bullishCount++
    } else {
      signals.usdKrwRateSignal = '약세'
      bearishCount++
    }
  }

  // 3. 코스피 PBR (1.2 이하면 저평가 = 상승 신호)
  if (data.kospiPbr !== undefined) {
    if (data.kospiPbr < 1.2) {
      signals.kospiPbrSignal = '저평가'
      bullishCount++
    } else if (data.kospiPbr >= 1.2 && data.kospiPbr < 1.5) {
      signals.kospiPbrSignal = '정상'
      // 중립
    } else {
      signals.kospiPbrSignal = '고평가'
      bearishCount++
    }
  }

  // 4. 미국 10년물 금리 (4.5% 이상이면 고금리 = 하락 신호)
  if (data.us10YearRate !== undefined) {
    if (data.us10YearRate > 4.5) {
      signals.us10YearRateSignal = '고금리'
      bearishCount++
    } else {
      signals.us10YearRateSignal = '완화'
      bullishCount++
    }
  }

  // 5. 개인 순매수 (과열 시 단기 조정 = 혼조)
  if (data.individualNetBuying !== undefined) {
    if (data.individualNetBuying > 0) {
      signals.individualNetBuyingSignal = '매수'
      // 혼조 - 점수에 영향 없음
    } else {
      signals.individualNetBuyingSignal = '매도'
      // 혼조 - 점수에 영향 없음
    }
  }

  // 6. 메모리 가격 (상승 = 상승 신호)
  if (data.memoryPrice !== undefined) {
    // 전월 대비 판단 필요 (간단 구현: 특정 기준값 사용)
    if (data.memoryPrice > 8.0) {
      signals.memoryPriceSignal = '상승'
      bullishCount++
    } else {
      signals.memoryPriceSignal = '하락'
      bearishCount++
    }
  }

  // 7. 반도체 영업이익 (증가 = 상승 신호)
  if (data.semiconductorProfit !== undefined) {
    if (data.semiconductorProfit > 10) {
      signals.semiconductorProfitSignal = '호조'
      bullishCount++
    } else {
      signals.semiconductorProfitSignal = '둔화'
      bearishCount++
    }
  }

  // 8. 밸류업 지수 (3점 이상 = 상승 신호)
  if (data.valuationIndex !== undefined) {
    if (data.valuationIndex >= 3) {
      signals.valuationIndexSignal = '진척'
      bullishCount++
    } else {
      signals.valuationIndexSignal = '정체'
      bearishCount++
    }
  }

  // 9. S&P500 PBR (5 이상이면 고평가 = 하락 신호)
  if (data.sp500Pbr !== undefined) {
    if (data.sp500Pbr > 5) {
      signals.sp500PbrSignal = '고평가'
      bearishCount++
    } else {
      signals.sp500PbrSignal = '보통'
      bullishCount++
    }
  }

  // 10. AI CapEx 성장률 (증가 = 상승 신호)
  if (data.aiCapexGrowth !== undefined) {
    if (data.aiCapexGrowth > 0) {
      signals.aiCapexGrowthSignal = '확대'
      bullishCount++
    } else {
      signals.aiCapexGrowthSignal = '축소'
      bearishCount++
    }
  }

  // 종합 점수 계산 (0-10 스케일)
  const score = bullishCount - bearishCount + 5 // 중립 기준 5점
  const finalScore = Math.max(0, Math.min(10, score))

  // 시나리오 판정
  let scenario: 'bullish' | 'bearish' | 'neutral'
  if (finalScore >= 7) {
    scenario = 'bullish'
  } else if (finalScore <= 3) {
    scenario = 'bearish'
  } else {
    scenario = 'neutral'
  }

  return {
    score: finalScore,
    scenario,
    signals
  }
}

export function getScenarioText(scenario: string): string {
  switch (scenario) {
    case 'bullish':
      return '📈 강세 시나리오 (5,000 도전)'
    case 'bearish':
      return '📉 약세 시나리오 (3,300 위험)'
    case 'neutral':
      return '⚖️ 중립: 관망 구간'
    default:
      return '⚖️ 중립: 관망 구간'
  }
}

export function getSignalColor(signal: string | undefined): string {
  if (!signal) return 'bg-gray-100'

  const bullishSignals = ['매수', '강세', '저평가', '완화', '상승', '호조', '진척', '보통', '확대']
  const bearishSignals = ['매도', '약세', '고평가', '고금리', '하락', '둔화', '정체', '축소']

  if (bullishSignals.includes(signal)) return 'bg-green-100'
  if (bearishSignals.includes(signal)) return 'bg-red-100'

  return 'bg-gray-100'
}

export function getImpactDirection(signal: string | undefined): string {
  if (!signal) return ''

  const bullishSignals = ['매수', '강세', '저평가', '완화', '상승', '호조', '진척', '보통', '확대']
  if (bullishSignals.includes(signal)) return '↑'

  return '↓'
}
