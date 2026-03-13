import fs from 'fs/promises'
import { Worker, UnrecoverableError } from 'bullmq'
import type { ConnectionOptions } from 'bullmq'
import type { Prisma } from '@/generated/prisma/client'
import { QUEUE_NAMES, createQueue } from '@/lib/queues'
import type { ImageProcessingJobData } from '@/lib/queues/job-types'
import { prisma } from '@/lib/prisma'
import { resizeImage } from '@/lib/image-processing/resize'
import { createWatermark, createThumbnail } from '@/lib/image-processing/watermark'
import {
  cleanupImageFiles,
  deleteTempOriginal,
  ensureStorageDirs,
} from '@/lib/image-processing/storage'
import '@/lib/image-processing/sharp-config'

const SHARP_CONCURRENCY = Number(process.env.SHARP_CONCURRENCY) || 2

function getConnection(): ConnectionOptions {
  return {
    host: new URL(process.env.REDIS_URL!).hostname,
    port: Number(new URL(process.env.REDIS_URL!).port) || 6379,
    maxRetriesPerRequest: null,
  }
}

const deadLetterQueue = createQueue<{
  originalQueue: string
  jobData: unknown
  error: string
}>(QUEUE_NAMES.DEAD_LETTER)

export function createImageProcessingWorker(): Worker<ImageProcessingJobData> {
  const worker = new Worker<ImageProcessingJobData>(
    QUEUE_NAMES.IMAGE_PROCESSING,
    async job => {
      const { imageId, originalPath } = job.data
      console.log(`[image-worker] Processing job ${job.id}:`, imageId)

      await ensureStorageDirs()

      // Update status to PROCESSING
      await prisma.image.update({
        where: { id: imageId },
        data: { processingStatus: 'PROCESSING' },
      })

      // Check original file exists (unrecoverable if missing)
      try {
        await fs.access(originalPath)
      } catch {
        await prisma.image.update({
          where: { id: imageId },
          data: { processingStatus: 'FAILED' },
        })
        throw new UnrecoverableError(
          'Original file not found: ' + originalPath
        )
      }

      try {
        // 1. Resize to XL/L/M/S
        const { sizesJson, fileSizesJson } = await resizeImage(
          originalPath,
          imageId
        )

        // 2. Create watermarked preview
        const watermarkUrl = await createWatermark(originalPath, imageId)

        // 3. Create thumbnail
        const thumbnailUrl = await createThumbnail(originalPath, imageId)

        // 4. Update DB with COMPLETED status and all paths
        await prisma.image.update({
          where: { id: imageId },
          data: {
            processingStatus: 'COMPLETED',
            sizesJson: sizesJson as unknown as Prisma.InputJsonValue,
            fileSizesJson: fileSizesJson as unknown as Prisma.InputJsonValue,
            watermarkUrl,
            thumbnailUrl,
          },
        })

        // 5. Delete temp original (원본은 로컬 PC에서 관리)
        await deleteTempOriginal(imageId)

        console.log(
          '[image-worker] Successfully processed image:',
          imageId
        )
      } catch (error) {
        // Cleanup generated files on failure
        await cleanupImageFiles(imageId).catch(() => {})

        // Update DB status to FAILED
        await prisma.image
          .update({
            where: { id: imageId },
            data: { processingStatus: 'FAILED' },
          })
          .catch(() => {})

        throw error // Triggers BullMQ retry (3 attempts, exponential backoff)
      }
    },
    {
      connection: getConnection(),
      concurrency: SHARP_CONCURRENCY,
    }
  )

  worker.on('failed', async (job, error) => {
    if (!job) return
    const maxAttempts = job.opts.attempts ?? 3
    if (job.attemptsMade >= maxAttempts) {
      console.error(
        `[image-worker] Job ${job.id} permanently failed, moving to DLQ`
      )
      await deadLetterQueue.add('failed-job', {
        originalQueue: QUEUE_NAMES.IMAGE_PROCESSING,
        jobData: job.data,
        error: error.message,
      })
    }
  })

  worker.on('completed', job => {
    console.log(`[image-worker] Job ${job.id} completed`)
  })

  return worker
}
