import { Queue } from 'bullmq'
import type { ConnectionOptions } from 'bullmq'
import type { ImageProcessingJobData, EmailJobData } from './job-types'

export const QUEUE_NAMES = {
  IMAGE_PROCESSING: 'image-processing',
  EMAIL: 'email',
  DEAD_LETTER: 'dead-letter',
} as const

const DEFAULT_JOB_OPTIONS = {
  attempts: 3,
  backoff: {
    type: 'exponential' as const,
    delay: 1000,
  },
  removeOnComplete: 100,
  removeOnFail: false,
}

function getConnection(): ConnectionOptions {
  return {
    host: new URL(process.env.REDIS_URL!).hostname,
    port: Number(new URL(process.env.REDIS_URL!).port) || 6379,
    maxRetriesPerRequest: null,
  }
}

export function createQueue<T>(name: string): Queue<T> {
  return new Queue<T>(name, {
    connection: getConnection(),
    defaultJobOptions: DEFAULT_JOB_OPTIONS,
  })
}

export const imageProcessingQueue = createQueue<ImageProcessingJobData>(
  QUEUE_NAMES.IMAGE_PROCESSING
)

export const emailQueue = createQueue<EmailJobData>(QUEUE_NAMES.EMAIL)
