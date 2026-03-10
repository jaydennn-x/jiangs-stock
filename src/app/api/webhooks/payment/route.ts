import { NextResponse } from 'next/server'

export async function POST(_request: Request) {
  // TODO: 결제 웹훅 처리 구현 예정 (Task 031)
  return NextResponse.json({ received: true })
}
