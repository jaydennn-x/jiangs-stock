import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { cleanupImageFiles } from '../src/lib/image-processing/storage'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  const inactive = await prisma.image.findMany({
    where: { isActive: false },
    select: { id: true, name: true },
  })

  console.log(`Found ${inactive.length} inactive images to clean up`)

  for (const img of inactive) {
    console.log(`Deleting: ${img.name} (${img.id})`)
    await cleanupImageFiles(img.id)
    await prisma.cartItem.deleteMany({ where: { imageId: img.id } })
    await prisma.wishlist.deleteMany({ where: { imageId: img.id } })
    await prisma.orderItem.deleteMany({ where: { imageId: img.id } })
    await prisma.image.delete({ where: { id: img.id } })
    console.log(`  Done`)
  }

  console.log('Cleanup complete')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
