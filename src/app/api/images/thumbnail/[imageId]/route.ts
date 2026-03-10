import { NextResponse } from 'next/server'

type Params = { params: Promise<{ imageId: string }> }

export async function GET(_request: Request, { params }: Params) {
  const { imageId } = await params
  // TODO: 썸네일 이미지 서빙 구현 예정 (Task 023)
  return NextResponse.json({ message: 'TODO', imageId }, { status: 200 })
}
