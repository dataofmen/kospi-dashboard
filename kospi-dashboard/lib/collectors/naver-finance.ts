// 네이버 금융 데이터 수집 (웹 스크래핑)
import axios from 'axios'
import * as cheerio from 'cheerio'
import type { CollectorResult } from './types'

// 외국인 순매수
export async function collectForeignNetBuying(): Promise<CollectorResult> {
  try {
    const url = 'https://finance.naver.com/sise/sise_quant.naver?sosok=0'

    const { data } = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    })

    const $ = cheerio.load(data)

    // 외국인 순매수 합계 찾기
    const table = $('.type_2')
    const rows = table.find('tr')

    let totalNetBuying = 0
    rows.each((i, row) => {
      const cols = $(row).find('td')
      if (cols.length > 0) {
        // 외국인 순매수 컬럼 (일반적으로 7번째 컬럼)
        const netBuyingText = $(cols[6]).text().trim()
        if (netBuyingText && netBuyingText !== '') {
          const value = parseFloat(netBuyingText.replace(/,/g, ''))
          if (!isNaN(value)) {
            totalNetBuying += value
          }
        }
      }
    })

    return {
      success: true,
      value: totalNetBuying
    }
  } catch (error) {
    console.error('[Foreign Net Buying Collector] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// 개인 순매수
export async function collectIndividualNetBuying(): Promise<CollectorResult> {
  try {
    const url = 'https://finance.naver.com/sise/sise_quant.naver?sosok=0'

    const { data } = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    })

    const $ = cheerio.load(data)

    // 개인 순매수 합계 찾기
    const table = $('.type_2')
    const rows = table.find('tr')

    let totalNetBuying = 0
    rows.each((i, row) => {
      const cols = $(row).find('td')
      if (cols.length > 0) {
        // 개인 순매수 컬럼 (일반적으로 5번째 컬럼)
        const netBuyingText = $(cols[4]).text().trim()
        if (netBuyingText && netBuyingText !== '') {
          const value = parseFloat(netBuyingText.replace(/,/g, ''))
          if (!isNaN(value)) {
            totalNetBuying += value
          }
        }
      }
    })

    return {
      success: true,
      value: totalNetBuying
    }
  } catch (error) {
    console.error('[Individual Net Buying Collector] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// 코스피 PBR
export async function collectKospiPbr(): Promise<CollectorResult> {
  try {
    const url = 'https://finance.naver.com/sise/sise_index.nhn?code=KOSPI'

    const { data } = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    })

    const $ = cheerio.load(data)

    // PBR 값 찾기 (정확한 셀렉터는 실제 페이지 구조에 따라 조정 필요)
    const pbrElement = $('#_per').text().trim()
    const pbr = parseFloat(pbrElement.replace(/,/g, ''))

    if (isNaN(pbr)) {
      throw new Error('PBR value not found or invalid')
    }

    return {
      success: true,
      value: pbr
    }
  } catch (error) {
    console.error('[KOSPI PBR Collector] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
