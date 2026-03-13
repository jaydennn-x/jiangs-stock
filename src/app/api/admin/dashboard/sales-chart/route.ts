import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getSalesChartData } from '@/lib/actions/admin-dashboard'

const VALID_MODES = ['daily', 'monthly'] as const
type ChartMode = (typeof VALID_MODES)[number]

export async function GET(request: NextRequest) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const mode = request.nextUrl.searchParams.get('mode')

  if (!mode || !VALID_MODES.includes(mode as ChartMode)) {
    return NextResponse.json(
      { error: 'Invalid mode. Use "daily" or "monthly".' },
      { status: 400 }
    )
  }

  try {
    const data = await getSalesChartData(mode as ChartMode)
    return NextResponse.json({ data })
  } catch (error) {
    console.error('[GET /api/admin/dashboard/sales-chart]', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
