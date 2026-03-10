import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '이미지 상세 | JiangsStock',
}

type Props = {
  params: Promise<{ id: string }>
}

export default async function ImageDetailPage({ params }: Props) {
  const { id } = await params

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">이미지 상세</h1>
      <p className="text-muted-foreground mt-2">이미지 ID: {id}</p>
      <p className="text-muted-foreground">
        TODO: 이미지 상세 페이지 구현 예정 (Task 008)
      </p>
    </div>
  )
}
