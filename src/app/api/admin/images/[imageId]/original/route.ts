import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { serveFile, getContentType } from '@/lib/image-serving'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ imageId: string }> }
) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { imageId } = await params

  try {
    const image = await prisma.image.findUnique({
      where: { id: imageId },
      select: { originalUrl: true, format: true },
    })

    if (!image) {
      return NextResponse.json({ error: 'Not Found' }, { status: 404 })
    }

    const storageRoot = process.env.STORAGE_ROOT ?? ''
    const absolutePath = path.join(storageRoot, image.originalUrl)
    const contentType = getContentType(image.format)

    return serveFile(
      absolutePath,
      image.originalUrl,
      contentType,
      'private, no-store'
    )
  } catch (error) {
    console.error('[GET /api/admin/images/[imageId]/original]', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
