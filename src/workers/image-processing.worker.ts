import { Worker } from 'bullmq'
import type { ConnectionOptions } from 'bullmq'
import { QUEUE_NAMES, createQueue } from '@/lib/queues'
import type { ImageProcessingJobData } from '@/lib/queues/job-types'

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
      console.log(`[image-worker] Processing job ${job.id}:`, job.data.imageId)
      throw new Error('Not implemented - see Task 027')
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
