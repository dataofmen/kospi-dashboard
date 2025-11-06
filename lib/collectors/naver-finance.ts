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
      timeout: 15000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache'
      }
    })

    const $ = cheerio.load(data)

    // PBR 값 찾기 - 여러 셀렉터 시도
    let pbr: number | null = null

    // 방법 1: #_pbr 셀렉터 시도
    const pbrElement1 = $('#_pbr').text().trim()
    if (pbrElement1) {
      const value = parseFloat(pbrElement1.replace(/,/g, ''))
      if (!isNaN(value)) {
        pbr = value
      }
    }

    // 방법 2: 테이블에서 "PBR" 텍스트가 있는 행 찾기
    if (pbr === null) {
      $('tr').each((i, row) => {
        const rowText = $(row).text()
        if (rowText.includes('PBR') || rowText.includes('주가순자산비율')) {
          const cells = $(row).find('td')
          cells.each((j, cell) => {
            const cellText = $(cell).text().trim()
            const value = parseFloat(cellText.replace(/,/g, ''))
            if (!isNaN(value) && value > 0 && value < 10) {
              // PBR은 일반적으로 0~10 사이
              pbr = value
            }
          })
        }
      })
    }

    // 방법 3: dl/dt/dd 구조에서 찾기
    if (pbr === null) {
      $('dl').each((i, dl) => {
        const dt = $(dl).find('dt').text()
        if (dt.includes('PBR') || dt.includes('주가순자산비율')) {
          const dd = $(dl).find('dd').text().trim()
          const value = parseFloat(dd.replace(/,/g, ''))
          if (!isNaN(value)) {
            pbr = value
          }
        }
      })
    }

    if (pbr === null || isNaN(pbr)) {
      console.error('[KOSPI PBR] HTML structure:', data.substring(0, 500))
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
