import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ imageId: string }> }
) {
  await params
  // 원본은 서버에 저장하지 않음 (로컬 PC D:\jiangsstock 에서 관리)
  return NextResponse.json(
    { error: '원본 이미지는 서버에 보관하지 않습니다' },
    { status: 410 }
  )
}
