import { Redis } from 'ioredis'

export type { Redis }

export function createRedisConnection(): Redis {
  return new Redis(process.env.REDIS_URL!, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  })
}

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined
}

export const redis = globalForRedis.redis ?? createRedisConnection()

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis
}
