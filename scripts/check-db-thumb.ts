import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
  const p = new PrismaClient({ adapter })
  const r = await p.image.findMany({
    select: { id: true, name: true, thumbnailUrl: true, processingStatus: true },
  })
  console.log(JSON.stringify(r, null, 2))
  await p.$disconnect()
}

main()
