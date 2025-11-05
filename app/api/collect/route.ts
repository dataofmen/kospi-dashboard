// 데이터 수집 API 엔드포인트
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { collectAllData } from '@/lib/collectors'
import { calculateScore } from '@/lib/score-calculator'

export async function POST() {
  try {
    console.log('[API /collect] Starting data collection...')

    // 자동 데이터 수집
    const collectedData = await collectAllData()

    // 오늘 날짜 데이터 확인
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const existing = await prisma.indicator.findUnique({
      where: { date: today }
    })

    // 기존 수동 입력 데이터 보존
    const fullData = {
      ...collectedData,
      memoryPrice: existing?.memoryPrice,
      semiconductorProfit: existing?.semiconductorProfit,
      valuationIndex: existing?.valuationIndex,
      sp500Pbr: existing?.sp500Pbr,
      aiCapexGrowth: existing?.aiCapexGrowth
    }

    // 종합 점수 계산
    const scoreResult = calculateScore(fullData)

    // DB 저장 (upsert)
    const indicator = await prisma.indicator.upsert({
      where: { date: today },
      update: {
        ...collectedData,
        score: scoreResult.score,
        scenario: scoreResult.scenario,
        ...scoreResult.signals
      },
      create: {
        date: today,
        ...collectedData,
        score: scoreResult.score,
        scenario: scoreResult.scenario,
        ...scoreResult.signals
      }
    })

    console.log('[API /collect] Data saved successfully')

    return NextResponse.json({
      success: true,
      data: indicator
    })
  } catch (error) {
    console.error('[API /collect] Error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST to trigger data collection'
  })
}
