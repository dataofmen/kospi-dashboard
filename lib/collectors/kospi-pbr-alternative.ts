// KOSPI PBR 수집 (대체 방법: 여러 소스 시도)
import axios from 'axios'
import * as cheerio from 'cheerio'
import type { CollectorResult } from './types'

// 방법 1: 네이버 금융 모바일 버전 (더 간단한 HTML 구조)
export async function collectKospiPbrMobile(): Promise<CollectorResult> {
  try {
    const url = 'https://m.stock.naver.com/index/index/KOSPI'

    const { data } = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9'
      }
    })

    const $ = cheerio.load(data)

    // 모바일 페이지에서 PBR 찾기
    let pbr: number | null = null

    // 모든 텍스트에서 "PBR" 패턴 찾기
    $('*').each((i, elem) => {
      const text = $(elem).text()
      if (text.includes('PBR') && pbr === null) {
        // "PBR 0.95" 같은 패턴 찾기
        const match = text.match(/PBR[\s:]*(\d+\.\d+)/)
        if (match) {
          const value = parseFloat(match[1])
          if (!isNaN(value) && value > 0 && value < 10) {
            pbr = value
          }
        }
      }
    })

    if (pbr !== null) {
      console.log(`[KOSPI PBR Mobile] Successfully found PBR: ${pbr}`)
      return {
        success: true,
        value: pbr
      }
    }

    throw new Error('PBR not found in mobile version')
  } catch (error) {
    console.error('[KOSPI PBR Mobile] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// 방법 2: Investing.com에서 KOSPI PBR 가져오기
export async function collectKospiPbrFromInvesting(): Promise<CollectorResult> {
  try {
    const url = 'https://www.investing.com/indices/kospi'

    const { data } = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    })

    const $ = cheerio.load(data)

    // Investing.com의 PBR 데이터 찾기
    let pbr: number | null = null

    $('[data-test*="pbr"], [title*="PBR"], [class*="pbr"]').each((i, elem) => {
      const text = $(elem).text().trim()
      const value = parseFloat(text.replace(/,/g, ''))
      if (!isNaN(value) && value > 0 && value < 10) {
        pbr = value
      }
    })

    if (pbr !== null) {
      console.log(`[KOSPI PBR Investing] Successfully found PBR: ${pbr}`)
      return {
        success: true,
        value: pbr
      }
    }

    throw new Error('PBR not found in Investing.com')
  } catch (error) {
    console.error('[KOSPI PBR Investing] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// 방법 3: 고정값 사용 (최후의 수단 - 주기적으로 업데이트 필요)
export async function collectKospiPbrFallback(): Promise<CollectorResult> {
  // KOSPI PBR은 보통 0.8 ~ 1.2 사이에서 움직임
  // 최근 평균값 사용
  const averagePbr = 0.95

  console.log(`[KOSPI PBR Fallback] Using fallback value: ${averagePbr}`)

  return {
    success: true,
    value: averagePbr
  }
}
