// 알림 관리 API
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createAlert, toggleAlert } from '@/lib/alerts'

// 알림 목록 조회
export async function GET() {
  try {
    const alerts = await prisma.alert.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: alerts
    })
  } catch (error) {
    console.error('[API /alerts] GET error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch alerts' },
      { status: 500 }
    )
  }
}

// 알림 생성
export async function POST(request: Request) {
  try {
    const { email, name } = await request.json()

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 })
    }

    const alert = await createAlert(email, name)

    return NextResponse.json({
      success: true,
      data: alert
    })
  } catch (error) {
    console.error('[API /alerts] POST error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create alert' },
      { status: 500 }
    )
  }
}

// 알림 활성화/비활성화
export async function PATCH(request: Request) {
  try {
    const { id, isActive } = await request.json()

    if (!id || typeof isActive !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'Invalid parameters' },
        { status: 400 }
      )
    }

    const alert = await toggleAlert(id, isActive)

    return NextResponse.json({
      success: true,
      data: alert
    })
  } catch (error) {
    console.error('[API /alerts] PATCH error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update alert' },
      { status: 500 }
    )
  }
}

// 알림 삭제
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'Alert ID required' }, { status: 400 })
    }

    await prisma.alert.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Alert deleted successfully'
    })
  } catch (error) {
    console.error('[API /alerts] DELETE error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete alert' },
      { status: 500 }
    )
  }
}
