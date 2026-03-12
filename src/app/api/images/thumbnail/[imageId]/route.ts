import { NextRequest } from 'next/server'
import path from 'path'
import { prisma } from '@/lib/prisma'
import { serveFile, getContentType } from '@/lib/image-serving'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ imageId: string }> }
) {
  const { imageId } = await params

  try {
    const image = await prisma.image.findUnique({
      where: { id: imageId },
      select: { thumbnailUrl: true, format: true },
    })

    if (!image) {
      return new Response('Not Found', { status: 404 })
    }

    const storageRoot = process.env.STORAGE_ROOT ?? ''
    const absolutePath = path.join(storageRoot, image.thumbnailUrl)
    const contentType = getContentType(image.format)

    return serveFile(
      absolutePath,
      image.thumbnailUrl,
      contentType,
      'public, max-age=86400, immutable'
    )
  } catch (error) {
    console.error('[GET /api/images/thumbnail/[imageId]]', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}
