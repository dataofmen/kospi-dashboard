// 데이터 수집 관련 타입 정의

export interface CollectorResult {
  success: boolean
  value?: number
  error?: string
}

export interface IndicatorData {
  foreignNetBuying?: number
  usdKrwRate?: number
  kospiPbr?: number
  us10YearRate?: number
  individualNetBuying?: number
}

export interface IndicatorSignals {
  foreignNetBuyingSignal?: string
  usdKrwRateSignal?: string
  kospiPbrSignal?: string
  us10YearRateSignal?: string
  individualNetBuyingSignal?: string
  memoryPriceSignal?: string
  semiconductorProfitSignal?: string
  valuationIndexSignal?: string
  sp500PbrSignal?: string
  aiCapexGrowthSignal?: string
}

export interface ScoreCalculation {
  score: number
  scenario: 'bullish' | 'bearish' | 'neutral'
  signals: IndicatorSignals
}
