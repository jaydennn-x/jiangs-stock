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
      select: { watermarkUrl: true, format: true },
    })

    if (!image) {
      return new Response('Not Found', { status: 404 })
    }

    const storageRoot = process.env.STORAGE_ROOT ?? ''
    const absolutePath = path.join(storageRoot, image.watermarkUrl)
    const ext = path.extname(image.watermarkUrl).slice(1) || image.format
    const contentType = getContentType(ext)

    return serveFile(
      absolutePath,
      image.watermarkUrl,
      contentType,
      'public, max-age=3600'
    )
  } catch (error) {
    console.error('[GET /api/images/preview/[imageId]]', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}
