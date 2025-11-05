// 원/달러 환율 수집 (한국수출입은행 API)
import axios from 'axios'
import type { CollectorResult } from './types'

export async function collectUsdKrwRate(): Promise<CollectorResult> {
  try {
    const apiKey = process.env.EXIM_API_KEY

    if (!apiKey) {
      return {
        success: false,
        error: 'EXIM_API_KEY not configured'
      }
    }

    const today = new Date().toISOString().split('T')[0].replace(/-/g, '')
    const url = `https://www.koreaexim.go.kr/site/program/financial/exchangeJSON?authkey=${apiKey}&data=AP01&searchdate=${today}`

    const { data } = await axios.get(url, {
      timeout: 10000
    })

    // USD 데이터 찾기
    const usdData = data.find((item: any) => item.cur_unit === 'USD')

    if (!usdData || !usdData.deal_bas_r) {
      throw new Error('USD rate not found in API response')
    }

    // 문자열에서 숫자만 추출 (콤마 제거)
    const rate = parseFloat(usdData.deal_bas_r.replace(/,/g, ''))

    return {
      success: true,
      value: rate
    }
  } catch (error) {
    console.error('[Exchange Rate Collector] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
