/**
 * 10장의 이미지를 고화질로 재처리하는 스크립트
 * - 실제 원본이 있는 이미지: 원본에서 1200x1200 고화질 썸네일 재생성
 * - 더미 이미지: Picsum에서 고해상도 사진 다운로드 후 썸네일 생성
 *
 * Usage: npx tsx scripts/regenerate-thumbnails.ts
 */
import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import sharp from 'sharp'
import fs from 'fs/promises'
import path from 'path'

const adapter = new PrismaPg({ connectionString: process.env['DATABASE_URL'] })
const prisma = new PrismaClient({ adapter })

const STORAGE_ROOT = process.env['STORAGE_ROOT'] ?? './storage'
const THUMBNAIL_SIZE = 1200
const WEBP_QUALITY = 95

// Picsum 시드 - 다양한 고화질 사진용
const PICSUM_SEEDS = [
  { seed: 'forest', w: 2400, h: 2400 },
  { seed: 'mountain', w: 2400, h: 2400 },
  { seed: 'ocean', w: 2400, h: 2400 },
  { seed: 'city', w: 2400, h: 2400 },
  { seed: 'flower', w: 2400, h: 2400 },
  { seed: 'sunset', w: 2400, h: 2400 },
  { seed: 'portrait', w: 2400, h: 2400 },
  { seed: 'food-dish', w: 2400, h: 2400 },
  { seed: 'building', w: 2400, h: 2400 },
  { seed: 'nature', w: 2400, h: 2400 },
]

async function downloadImage(url: string): Promise<Buffer> {
  const response = await fetch(url, { redirect: 'follow' })
  if (!response.ok) throw new Error(`Failed to download: ${url} (${response.status})`)
  return Buffer.from(await response.arrayBuffer())
}

async function createHighQualityThumbnail(
  input: string | Buffer,
  outputPath: string
): Promise<void> {
  await fs.mkdir(path.dirname(outputPath), { recursive: true })
  await sharp(input, { limitInputPixels: 300_000_000 })
    .resize(THUMBNAIL_SIZE, THUMBNAIL_SIZE, {
      fit: 'cover',
      position: 'attention',
    })
    .sharpen({ sigma: 0.5 })
    .webp({ quality: WEBP_QUALITY, effort: 6 })
    .toFile(outputPath)

  const stats = await fs.stat(outputPath)
  console.log(`  → ${path.basename(outputPath)} (${(stats.size / 1024).toFixed(1)}KB)`)
}

async function createHighQualityWatermark(
  input: string | Buffer,
  outputPath: string
): Promise<void> {
  await fs.mkdir(path.dirname(outputPath), { recursive: true })

  const metadata = await sharp(input).metadata()
  const previewWidth = Math.round(metadata.width! * 0.67)
  const previewHeight = Math.round(metadata.height! * 0.67)

  const resized = await sharp(input)
    .resize(previewWidth, previewHeight, { fit: 'inside', withoutEnlargement: true })
    .toBuffer({ resolveWithObject: true })

  const w = resized.info.width
  const h = resized.info.height
  const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <defs>
      <pattern id="wm" patternUnits="userSpaceOnUse" width="300" height="200" patternTransform="rotate(-30)">
        <text x="10" y="100" font-size="32" fill="rgba(255,255,255,0.35)" font-family="Arial,Helvetica,sans-serif" font-weight="bold">JiangsStock</text>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#wm)"/>
  </svg>`)

  await sharp(resized.data)
    .composite([{ input: svg, top: 0, left: 0 }])
    .jpeg({ quality: 92 })
    .toFile(outputPath)
}

async function main() {
  console.log('=== 고화질 썸네일 재생성 스크립트 ===\n')

  // 10장 이미지 가져오기 (활성 상태인 것 우선)
  const images = await prisma.image.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'asc' },
    take: 10,
  })

  console.log(`처리할 이미지: ${images.length}장\n`)

  let picsumIdx = 0

  for (const image of images) {
    console.log(`[${image.code}] ${image.name}`)

    const originalPath = path.resolve(STORAGE_ROOT, image.originalUrl)
    const thumbnailPath = path.join(STORAGE_ROOT, 'thumbnails', `${image.id}.webp`)
    const watermarkPath = path.join(STORAGE_ROOT, 'watermarks', `${image.id}.jpg`)

    // 실제 원본 파일이 있는지 확인
    let hasOriginal = false
    try {
      await fs.stat(originalPath)
      hasOriginal = true
    } catch {
      // 원본 없음
    }

    if (hasOriginal) {
      console.log('  원본 파일 발견 - 원본에서 재처리')
      await createHighQualityThumbnail(originalPath, thumbnailPath)
      await createHighQualityWatermark(originalPath, watermarkPath)
    } else {
      // Picsum에서 고해상도 다운로드
      const picsum = PICSUM_SEEDS[picsumIdx % PICSUM_SEEDS.length]
      const url = `https://picsum.photos/seed/${picsum.seed}/${picsum.w}/${picsum.h}`
      console.log(`  원본 없음 - Picsum 다운로드 (seed: ${picsum.seed})`)

      try {
        const buffer = await downloadImage(url)
        console.log(`  다운로드 완료 (${(buffer.length / 1024 / 1024).toFixed(1)}MB)`)

        // 원본도 저장
        const origDir = path.join(STORAGE_ROOT, 'originals')
        await fs.mkdir(origDir, { recursive: true })
        const origPath = path.join(origDir, `${image.id}.jpeg`)
        await fs.writeFile(origPath, buffer)

        await createHighQualityThumbnail(buffer, thumbnailPath)
        await createHighQualityWatermark(buffer, watermarkPath)

        // DB 원본 URL 업데이트
        await prisma.image.update({
          where: { id: image.id },
          data: {
            originalUrl: `originals/${image.id}.jpeg`,
          },
        })

        picsumIdx++
      } catch (err) {
        console.log(`  ⚠ 다운로드 실패: ${err}`)
        picsumIdx++
        continue
      }
    }

    // DB 경로 업데이트
    await prisma.image.update({
      where: { id: image.id },
      data: {
        thumbnailUrl: `thumbnails/${image.id}.webp`,
        watermarkUrl: `watermarks/${image.id}.jpg`,
      },
    })

    console.log('  완료!\n')
  }

  console.log('=== 모든 처리 완료 ===')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
