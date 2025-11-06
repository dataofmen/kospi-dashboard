// 원/달러 환율 수집 (대체 API: exchangerate-api.com)
import axios, { AxiosError } from 'axios'
import type { CollectorResult } from './types'

// 무료 환율 API를 사용한 환율 수집
export async function collectUsdKrwRateAlternative(): Promise<CollectorResult> {
  try {
    // exchangerate-api.com의 무료 API 사용
    const url = 'https://api.exchangerate-api.com/v4/latest/USD'

    const { data } = await axios.get(url, {
      timeout: 10000,
      headers: {
        Accept: 'application/json'
      }
    })

    if (!data || !data.rates || !data.rates.KRW) {
      throw new Error('KRW rate not found in API response')
    }

    const rate = parseFloat(data.rates.KRW)

    if (isNaN(rate) || rate <= 0) {
      throw new Error(`Invalid rate value: ${data.rates.KRW}`)
    }

    console.log(`[Exchange Rate Alternative] Successfully fetched USD/KRW: ${rate}`)

    return {
      success: true,
      value: rate
    }
  } catch (error) {
    console.error('[Exchange Rate Alternative] Error:', error)

    let errorMessage = 'Unknown error'
    if (error instanceof AxiosError) {
      errorMessage = `Network error: ${error.code} - ${error.message}`
    } else if (error instanceof Error) {
      errorMessage = error.message
    }

    return {
      success: false,
      error: errorMessage
    }
  }
}

// 한국은행 API를 사용한 환율 수집 (백업)
export async function collectUsdKrwRateFromBOK(): Promise<CollectorResult> {
  try {
    // 한국은행 경제통계시스템 API
    const url = 'https://ecos.bok.or.kr/api/StatisticSearch/sample/json/kr/1/1/036Y001/DD/20231101/20231130/0000001'

    const { data } = await axios.get(url, {
      timeout: 10000,
      headers: {
        Accept: 'application/json'
      }
    })

    // API 응답 처리 로직
    // 실제 구현 시 한국은행 API 키와 정확한 파라미터 필요

    return {
      success: false,
      error: 'BOK API requires API key and proper setup'
    }
  } catch (error) {
    console.error('[Exchange Rate BOK] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
