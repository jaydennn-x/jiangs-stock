import fs from 'fs'
import { Readable } from 'stream'
import path from 'path'

function getContentType(format: string): string {
  switch (format.toLowerCase()) {
    case 'png':
      return 'image/png'
    case 'tiff':
    case 'tif':
      return 'image/tiff'
    case 'webp':
      return 'image/webp'
    default:
      return 'image/jpeg'
  }
}

export { getContentType }

export async function serveFile(
  absolutePath: string,
  relativePath: string,
  contentType: string,
  cacheControl: string
): Promise<Response> {
  const storageRoot = process.env.STORAGE_ROOT
  if (!storageRoot) {
    return new Response('Storage not configured', { status: 500 })
  }

  const normalizedAbsolute = path.resolve(absolutePath)
  const normalizedRoot = path.resolve(storageRoot)
  if (!normalizedAbsolute.startsWith(normalizedRoot)) {
    return new Response('Forbidden', { status: 403 })
  }

  if (process.env.NODE_ENV === 'production') {
    return new Response(null, {
      headers: {
        'X-Accel-Redirect': `/internal/${relativePath}`,
        'Content-Type': contentType,
        'Cache-Control': cacheControl,
        'Referrer-Policy': 'no-referrer',
      },
    })
  }

  try {
    await fs.promises.stat(normalizedAbsolute)
  } catch {
    return new Response('Not Found', { status: 404 })
  }

  const nodeStream = fs.createReadStream(normalizedAbsolute)
  const webStream = Readable.toWeb(nodeStream) as ReadableStream
  return new Response(webStream, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': cacheControl,
      'Referrer-Policy': 'no-referrer',
    },
  })
}
