import { Worker } from 'bullmq'
import type { ConnectionOptions } from 'bullmq'
import { QUEUE_NAMES, cleanupQueue } from '@/lib/queues'
import type { CleanupJobData } from '@/lib/queues/job-types'
import { prisma } from '@/lib/prisma'
import { cleanupImageFiles } from '@/lib/image-processing/storage'

function getConnection(): ConnectionOptions {
  return {
    host: new URL(process.env.REDIS_URL!).hostname,
    port: Number(new URL(process.env.REDIS_URL!).port) || 6379,
    maxRetriesPerRequest: null,
  }
}

export function createCleanupWorker(): Worker<CleanupJobData> {
  const worker = new Worker<CleanupJobData>(
    QUEUE_NAMES.CLEANUP,
    async job => {
      console.log(`[cleanup-worker] Starting cleanup job ${job.id}`)

      const inactiveImages = await prisma.image.findMany({
        where: {
          isActive: false,
          originalUrl: { not: '' },
        },
        select: { id: true, name: true },
      })

      if (inactiveImages.length === 0) {
        console.log('[cleanup-worker] No inactive images to clean up')
        return
      }

      let cleanedCount = 0

      for (const image of inactiveImages) {
        const unexpiredOrderItems = await prisma.orderItem.count({
          where: {
            imageId: image.id,
            expiresAt: { gt: new Date() },
          },
        })

        if (unexpiredOrderItems > 0) {
          continue
        }

        try {
          await cleanupImageFiles(image.id)

          await prisma.image.update({
            where: { id: image.id },
            data: {
              originalUrl: '',
              watermarkUrl: '',
              thumbnailUrl: '',
              sizesJson: {},
              fileSizesJson: {},
            },
          })

          cleanedCount++
          console.log(
            `[cleanup-worker] Cleaned files for image: ${image.id} (${image.name})`
          )
        } catch (error) {
          console.error(
            `[cleanup-worker] Failed to clean image ${image.id}:`,
            error
          )
        }
      }

      console.log(
        `[cleanup-worker] Cleanup complete: ${cleanedCount}/${inactiveImages.length} images cleaned`
      )
    },
    {
      connection: getConnection(),
      concurrency: 1,
    }
  )

  worker.on('failed', (job, error) => {
    console.error(`[cleanup-worker] Job ${job?.id} failed:`, error.message)
  })

  worker.on('completed', job => {
    console.log(`[cleanup-worker] Job ${job.id} completed`)
  })

  return worker
}

export async function registerCleanupSchedule() {
  const repeatableJobs = await cleanupQueue.getRepeatableJobs()
  const existing = repeatableJobs.find(j => j.name === 'cleanup-inactive')

  if (!existing) {
    await cleanupQueue.add(
      'cleanup-inactive',
      { triggeredAt: new Date().toISOString() },
      { repeat: { pattern: '0 3 * * *' } }
    )
    console.log('[cleanup-worker] Registered daily cleanup schedule at 03:00')
  }
}
