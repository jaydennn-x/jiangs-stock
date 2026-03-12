import { Worker } from 'bullmq'
import type { ConnectionOptions } from 'bullmq'
import { QUEUE_NAMES, createQueue } from '@/lib/queues'
import type { EmailJobData } from '@/lib/queues/job-types'

const EMAIL_CONCURRENCY = 5

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

export function createEmailWorker(): Worker<EmailJobData> {
  const worker = new Worker<EmailJobData>(
    QUEUE_NAMES.EMAIL,
    async job => {
      console.log(
        `[email-worker] Processing job ${job.id}: ${job.data.type} -> ${job.data.to}`
      )
      throw new Error('Not implemented - see Task 033')
    },
    {
      connection: getConnection(),
      concurrency: EMAIL_CONCURRENCY,
    }
  )

  worker.on('failed', async (job, error) => {
    if (!job) return
    const maxAttempts = job.opts.attempts ?? 3
    if (job.attemptsMade >= maxAttempts) {
      console.error(
        `[email-worker] Job ${job.id} permanently failed, moving to DLQ`
      )
      await deadLetterQueue.add('failed-job', {
        originalQueue: QUEUE_NAMES.EMAIL,
        jobData: job.data,
        error: error.message,
      })
    }
  })

  worker.on('completed', job => {
    console.log(`[email-worker] Job ${job.id} completed`)
  })

  return worker
}
