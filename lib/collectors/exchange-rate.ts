// 원/달러 환율 수집 (한국수출입은행 API)
import axios, { AxiosError } from 'axios'
import https from 'https'
import type { CollectorResult } from './types'

// 재시도 헬퍼 함수
async function retryRequest<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error')
      console.log(
        `[Retry ${attempt}/${maxRetries}] Request failed:`,
        lastError.message
      )

      if (attempt < maxRetries) {
        // 지수 백오프: 1초, 2초, 4초...
        const delay = delayMs * Math.pow(2, attempt - 1)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError
}

export async function collectUsdKrwRate(): Promise<CollectorResult> {
  try {
    const apiKey = process.env.EXIM_API_KEY

    if (!apiKey) {
      return {
        success: false,
        error: 'EXIM_API_KEY not configured'
      }
    }

    // 오늘 날짜로 시도, 실패하면 어제 날짜로 재시도
    const dates = [
      new Date(), // 오늘
      new Date(Date.now() - 24 * 60 * 60 * 1000), // 어제
      new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 그저께
    ]

    let data: any = null
    let lastError: Error | null = null

    for (const date of dates) {
      const searchDate = date.toISOString().split('T')[0].replace(/-/g, '')
      const url = `https://www.koreaexim.go.kr/site/program/financial/exchangeJSON?authkey=${apiKey}&data=AP01&searchdate=${searchDate}`

      try {
        const response = await retryRequest(
          () =>
            axios.get(url, {
              timeout: 15000,
              headers: {
                'User-Agent':
                  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                Accept: 'application/json, text/plain, */*',
                'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7'
              },
              // SSL 인증서 검증 비활성화 (한국수출입은행 API의 인증서 문제 우회)
              httpsAgent: new https.Agent({
                rejectUnauthorized: false
              })
            }),
          2, // 2번 재시도
          1000 // 1초 지연
        )

        data = response.data
        console.log(`[Exchange Rate] Successfully fetched data for ${searchDate}`)
        break
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error')
        console.log(`[Exchange Rate] Failed for ${searchDate}:`, lastError.message)
        continue
      }
    }

    if (!data) {
      throw lastError || new Error('Failed to fetch exchange rate for recent dates')
    }

    // USD 데이터 찾기
    const usdData = data.find((item: any) => item.cur_unit === 'USD')

    if (!usdData || !usdData.deal_bas_r) {
      console.error('[Exchange Rate] API Response:', JSON.stringify(data).substring(0, 200))
      throw new Error('USD rate not found in API response')
    }

    // 문자열에서 숫자만 추출 (콤마 제거)
    const rate = parseFloat(usdData.deal_bas_r.replace(/,/g, ''))

    if (isNaN(rate)) {
      throw new Error(`Invalid rate value: ${usdData.deal_bas_r}`)
    }

    return {
      success: true,
      value: rate
    }
  } catch (error) {
    console.error('[Exchange Rate Collector] Error:', error)

    // 상세한 에러 정보 제공
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
