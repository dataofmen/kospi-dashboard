// 모든 데이터 수집기 통합
import { collectUsdKrwRate } from './exchange-rate'
import { collectUs10YearRate } from './us-treasury'
import {
  collectForeignNetBuying,
  collectIndividualNetBuying,
  collectKospiPbr
} from './naver-finance'
import { prisma } from '../prisma'
import type { IndicatorData } from './types'

export async function collectAllData(): Promise<IndicatorData> {
  console.log('[Data Collector] Starting data collection...')

  const results = await Promise.allSettled([
    collectForeignNetBuying(),
    collectUsdKrwRate(),
    collectKospiPbr(),
    collectUs10YearRate(),
    collectIndividualNetBuying()
  ])

  const data: IndicatorData = {}

  // 외국인 순매수
  if (results[0].status === 'fulfilled' && results[0].value.success) {
    data.foreignNetBuying = results[0].value.value
    await logCollection('foreignNetBuying', true, results[0].value.value?.toString())
  } else {
    const error = results[0].status === 'rejected' ? results[0].reason : results[0].value.error
    await logCollection('foreignNetBuying', false, undefined, error)
  }

  // 환율
  if (results[1].status === 'fulfilled' && results[1].value.success) {
    data.usdKrwRate = results[1].value.value
    await logCollection('usdKrwRate', true, results[1].value.value?.toString())
  } else {
    const error = results[1].status === 'rejected' ? results[1].reason : results[1].value.error
    await logCollection('usdKrwRate', false, undefined, error)
  }

  // 코스피 PBR
  if (results[2].status === 'fulfilled' && results[2].value.success) {
    data.kospiPbr = results[2].value.value
    await logCollection('kospiPbr', true, results[2].value.value?.toString())
  } else {
    const error = results[2].status === 'rejected' ? results[2].reason : results[2].value.error
    await logCollection('kospiPbr', false, undefined, error)
  }

  // 미국 금리
  if (results[3].status === 'fulfilled' && results[3].value.success) {
    data.us10YearRate = results[3].value.value
    await logCollection('us10YearRate', true, results[3].value.value?.toString())
  } else {
    const error = results[3].status === 'rejected' ? results[3].reason : results[3].value.error
    await logCollection('us10YearRate', false, undefined, error)
  }

  // 개인 순매수
  if (results[4].status === 'fulfilled' && results[4].value.success) {
    data.individualNetBuying = results[4].value.value
    await logCollection('individualNetBuying', true, results[4].value.value?.toString())
  } else {
    const error = results[4].status === 'rejected' ? results[4].reason : results[4].value.error
    await logCollection('individualNetBuying', false, undefined, error)
  }

  console.log('[Data Collector] Collection complete:', data)
  return data
}

async function logCollection(
  indicator: string,
  success: boolean,
  value?: string,
  error?: string
) {
  try {
    await prisma.collectionLog.create({
      data: {
        date: new Date(),
        indicator,
        success,
        value,
        error
      }
    })
  } catch (err) {
    console.error('[Collection Log] Error:', err)
  }
}

export * from './types'
