// 지표 데이터 조회 API
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')

    // 최근 N일 데이터 조회
    const indicators = await prisma.indicator.findMany({
      orderBy: { date: 'desc' },
      take: days
    })

    return NextResponse.json({
      success: true,
      data: indicators.reverse() // 오래된 순으로 정렬
    })
  } catch (error) {
    console.error('[API /indicators] Error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
