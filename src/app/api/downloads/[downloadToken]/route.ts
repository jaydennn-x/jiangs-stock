import { NextResponse } from 'next/server'

type Params = { params: Promise<{ downloadToken: string }> }

export async function GET(_request: Request, { params }: Params) {
  const { downloadToken } = await params
  // TODO: 보안 파일 다운로드 구현 예정 (Task 032)
  return NextResponse.json({ message: 'TODO', downloadToken }, { status: 200 })
}
