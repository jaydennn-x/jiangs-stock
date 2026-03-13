import { prisma } from '@/lib/prisma'

async function main() {
  const img = await prisma.image.findFirst({
    where: { code: { startsWith: 'TEST' } },
    select: { id: true, thumbnailUrl: true, watermarkUrl: true, processingStatus: true },
  })
  console.log(img)
  await prisma.$disconnect()
}
main()
