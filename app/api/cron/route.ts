// 크론 작업 수동 트리거 API (테스트용)
import { NextResponse } from 'next/server'
import { runCollectionNow } from '@/lib/scheduler'

export async function GET() {
  try {
    console.log('[API /cron] Manual trigger requested')

    const result = await runCollectionNow()

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Collection completed successfully',
        data: result.data
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Collection failed',
          details: result.error
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('[API /cron] Error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
