/**
 * Test script for Task 027: Image Processing Pipeline
 *
 * Usage: npx tsx --env-file=.env.local -r tsconfig-paths/register scripts/test-image-pipeline.ts
 */
import fs from 'fs/promises'
import path from 'path'
import sharp from 'sharp'
import { prisma } from '@/lib/prisma'
import { uploadImage } from '@/lib/services/image-upload.service'

const TEST_IMAGE_PATH = 'E:/jiangsstock/200705_IMG_6830.jpg'

async function main() {
  console.log('=== Image Processing Pipeline Test ===\n')

  // 1. Read test image and extract metadata
  console.log(`[1/3] Reading test image: ${TEST_IMAGE_PATH}`)
  const fileBuffer = await fs.readFile(TEST_IMAGE_PATH)
  const metadata = await sharp(fileBuffer).metadata()
  console.log(
    `  Format: ${metadata.format}, Size: ${metadata.width}x${metadata.height}, File: ${(fileBuffer.length / 1024 / 1024).toFixed(1)}MB`
  )

  // 2. Call uploadImage service (atomic: DB -> disk -> BullMQ)
  console.log('\n[2/3] Calling uploadImage service...')
  const image = await uploadImage({
    file: fileBuffer,
    code: `TEST-${Date.now()}`,
    name: 'Test Stock Photo - Sunset',
    description: 'Pipeline test with real stock photo',
    orientation: metadata.width! > metadata.height! ? 'LANDSCAPE' : metadata.width! < metadata.height! ? 'PORTRAIT' : 'SQUARE',
    width: metadata.width!,
    height: metadata.height!,
    format: metadata.format || 'jpeg',
    basePrice: 50000,
    tags: ['test', 'stock', 'photo'],
    colorTags: ['blue', 'orange'],
  })

  console.log(`  DB Record created: ${image.id}`)
  console.log(`  Processing Status: ${image.processingStatus}`)

  // 3. Verify original file saved
  const storageRoot = process.env.STORAGE_ROOT || './storage'
  const originalPath = path.join(
    storageRoot,
    'originals',
    `${image.id}.${metadata.format || 'jpeg'}`
  )
  const exists = await fs
    .stat(originalPath)
    .then(() => true)
    .catch(() => false)
  console.log(`  Original file saved: ${exists ? 'YES' : 'NO'} (${originalPath})`)

  // 4. Check BullMQ job was enqueued
  console.log('\n[3/3] BullMQ job enqueued. Run worker to process:')
  console.log('  npx tsx --env-file=.env.local -r tsconfig-paths/register src/workers/index.ts')
  console.log('\n  Then check DB status with:')
  console.log(`  SELECT "processingStatus", "watermarkUrl", "thumbnailUrl" FROM "Image" WHERE id = '${image.id}';`)

  // 5. Poll for completion (wait up to 30 seconds)
  console.log('\n  Waiting for worker to process (30s timeout)...')
  const startTime = Date.now()
  while (Date.now() - startTime < 30_000) {
    const updated = await prisma.image.findUnique({
      where: { id: image.id },
      select: {
        processingStatus: true,
        watermarkUrl: true,
        thumbnailUrl: true,
        sizesJson: true,
        fileSizesJson: true,
      },
    })

    if (updated?.processingStatus === 'COMPLETED') {
      console.log('\n  === PROCESSING COMPLETED ===')
      console.log(`  Watermark: ${updated.watermarkUrl}`)
      console.log(`  Thumbnail: ${updated.thumbnailUrl}`)
      console.log(`  Sizes: ${JSON.stringify(updated.sizesJson, null, 2)}`)
      console.log(`  File Sizes: ${JSON.stringify(updated.fileSizesJson, null, 2)}`)

      // Verify files exist
      const files = [
        path.join(storageRoot, String(updated.watermarkUrl)),
        path.join(storageRoot, String(updated.thumbnailUrl)),
        ...['XL', 'L', 'M', 'S'].map(s =>
          path.join(storageRoot, 'downloads', image.id, `${s}.jpg`)
        ),
      ]
      console.log('\n  File verification:')
      for (const f of files) {
        const stat = await fs.stat(f).catch(() => null)
        console.log(
          `    ${stat ? 'OK' : 'MISSING'} ${path.basename(f)} ${stat ? `(${(stat.size / 1024).toFixed(0)}KB)` : ''}`
        )
      }
      break
    } else if (updated?.processingStatus === 'FAILED') {
      console.log('\n  === PROCESSING FAILED ===')
      break
    }

    await new Promise(r => setTimeout(r, 1000))
    process.stdout.write('.')
  }

  await prisma.$disconnect()
}

main().catch(err => {
  console.error('Test failed:', err)
  process.exit(1)
})
