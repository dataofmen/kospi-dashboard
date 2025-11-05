// 수동 데이터 입력 API
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateScore } from '@/lib/score-calculator'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { date, memoryPrice, semiconductorProfit, valuationIndex, sp500Pbr, aiCapexGrowth } =
      body

    // 날짜 파싱
    const targetDate = new Date(date)
    targetDate.setHours(0, 0, 0, 0)

    // 기존 데이터 조회 (자동 수집 데이터 보존)
    const existing = await prisma.indicator.findUnique({
      where: { date: targetDate }
    })

    // 전체 데이터 병합 (자동 + 수동)
    const fullData = {
      foreignNetBuying: existing?.foreignNetBuying,
      usdKrwRate: existing?.usdKrwRate,
      kospiPbr: existing?.kospiPbr,
      us10YearRate: existing?.us10YearRate,
      individualNetBuying: existing?.individualNetBuying,
      memoryPrice: memoryPrice !== undefined ? memoryPrice : existing?.memoryPrice,
      semiconductorProfit:
        semiconductorProfit !== undefined ? semiconductorProfit : existing?.semiconductorProfit,
      valuationIndex: valuationIndex !== undefined ? valuationIndex : existing?.valuationIndex,
      sp500Pbr: sp500Pbr !== undefined ? sp500Pbr : existing?.sp500Pbr,
      aiCapexGrowth: aiCapexGrowth !== undefined ? aiCapexGrowth : existing?.aiCapexGrowth
    }

    // 종합 점수 재계산
    const scoreResult = calculateScore(fullData)

    // DB 저장 (upsert)
    const indicator = await prisma.indicator.upsert({
      where: { date: targetDate },
      update: {
        memoryPrice: fullData.memoryPrice,
        semiconductorProfit: fullData.semiconductorProfit,
        valuationIndex: fullData.valuationIndex,
        sp500Pbr: fullData.sp500Pbr,
        aiCapexGrowth: fullData.aiCapexGrowth,
        score: scoreResult.score,
        scenario: scoreResult.scenario,
        ...scoreResult.signals
      },
      create: {
        date: targetDate,
        ...fullData,
        score: scoreResult.score,
        scenario: scoreResult.scenario,
        ...scoreResult.signals
      }
    })

    console.log('[Manual Input] Data saved:', indicator.id)

    return NextResponse.json({
      success: true,
      data: indicator
    })
  } catch (error) {
    console.error('[Manual Input] Error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save data'
      },
      { status: 500 }
    )
  }
}
