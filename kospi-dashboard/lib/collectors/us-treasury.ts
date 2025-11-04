// 미국 10년물 국채금리 수집 (FRED API)
import axios from 'axios'
import type { CollectorResult } from './types'

export async function collectUs10YearRate(): Promise<CollectorResult> {
  try {
    const apiKey = process.env.FRED_API_KEY

    if (!apiKey) {
      return {
        success: false,
        error: 'FRED_API_KEY not configured'
      }
    }

    const url = `https://api.stlouisfed.org/fred/series/observations?series_id=DGS10&api_key=${apiKey}&file_type=json&limit=1&sort_order=desc`

    const { data } = await axios.get(url, {
      timeout: 10000
    })

    if (!data.observations || data.observations.length === 0) {
      throw new Error('No observations found')
    }

    const latestRate = parseFloat(data.observations[0].value)

    if (isNaN(latestRate)) {
      throw new Error('Invalid rate value')
    }

    return {
      success: true,
      value: latestRate
    }
  } catch (error) {
    console.error('[US Treasury Collector] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
