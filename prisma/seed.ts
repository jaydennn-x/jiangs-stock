import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

const adapter = new PrismaPg({ connectionString: process.env['DATABASE_URL'] })
const prisma = new PrismaClient({ adapter })

const CATEGORIES = [
  { name: '자연/풍경', slug: 'nature-landscape' },
  { name: '인물', slug: 'people' },
  { name: '비즈니스', slug: 'business' },
  { name: '음식', slug: 'food' },
  { name: '건축', slug: 'architecture' },
  { name: '기타', slug: 'other' },
] as const

async function seedCategories() {
  console.log('카테고리 seed 중...')
  for (let i = 0; i < CATEGORIES.length; i++) {
    const cat = CATEGORIES[i]
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: { name: cat.name, slug: cat.slug, sortOrder: i },
    })
  }
  console.log(`카테고리 ${CATEGORIES.length}건 완료`)
}

async function seedSystemConfig() {
  console.log('SystemConfig seed 중...')
  const configs = [
    {
      key: 'EXTENDED_LICENSE_MULTIPLIER',
      value: '3',
      description: '확장 라이선스 가격 배율',
    },
    {
      key: 'DOWNLOAD_LIMIT',
      value: '3',
      description: '기본 다운로드 횟수 제한',
    },
    {
      key: 'DOWNLOAD_EXPIRES_DAYS',
      value: '7',
      description: '다운로드 링크 만료일(일)',
    },
    {
      key: 'IMAGE_UPLOAD_MAX_SIZE_MB',
      value: '50',
      description: '이미지 업로드 최대 크기(MB)',
    },
    { key: 'SHARP_CONCURRENCY', value: '2', description: 'Sharp 동시 처리 수' },
    { key: 'SHARP_JPEG_QUALITY', value: '90', description: 'JPEG 출력 품질' },
    { key: 'SHARP_WEBP_QUALITY', value: '85', description: 'WebP 출력 품질' },
  ]
  for (const config of configs) {
    await prisma.systemConfig.upsert({
      where: { key: config.key },
      update: {},
      create: config,
    })
  }
  console.log(`SystemConfig ${configs.length}건 완료`)
}

async function seedAdminUser() {
  console.log('관리자 계정 seed 중...')
  const passwordHash = await bcrypt.hash('Admin1234!', 12)
  await prisma.user.upsert({
    where: { email: 'admin@jiangsstock.com' },
    update: {},
    create: {
      email: 'admin@jiangsstock.com',
      passwordHash,
      name: '관리자',
      role: 'ADMIN',
      agreedTermsAt: new Date(),
    },
  })
  console.log('관리자 계정 완료')
}

async function seedDummyUsers() {
  console.log('더미 사용자 seed 중...')
  const users = [
    { email: 'user1@example.com', name: '김철수' },
    { email: 'user2@example.com', name: '이영희' },
    { email: 'user3@example.com', name: '박민준' },
  ]
  for (const u of users) {
    const passwordHash = await bcrypt.hash('User1234!', 10)
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        passwordHash,
        name: u.name,
        country: 'KR',
        role: 'USER',
        agreedTermsAt: new Date(),
      },
    })
  }
  console.log(`더미 사용자 ${users.length}건 완료`)
}

const DUMMY_TAGS = [
  ['자연', '풍경', '하늘'],
  ['인물', '포트레이트'],
  ['비즈니스', '사무실', '팀'],
  ['음식', '요리'],
  ['건축', '도시', '건물'],
  ['기타'],
]

const DUMMY_COLOR_TAGS = [
  ['파랑', '초록'],
  ['빨강', '주황'],
  ['흰색', '회색'],
  ['갈색', '노랑'],
  ['검정', '흰색'],
  ['다색'],
]

async function seedDummyImages() {
  console.log('더미 이미지 seed 중...')
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
  })

  for (let i = 1; i <= 30; i++) {
    const catIdx = (i - 1) % categories.length
    const cat = categories[catIdx]
    const code = `IMG-${String(i).padStart(4, '0')}`
    await prisma.image.upsert({
      where: { code },
      update: {},
      create: {
        code,
        name: `더미 이미지 ${i}`,
        description: `${cat.name} 카테고리 더미 이미지 ${i}번`,
        categoryId: cat.id,
        orientation:
          i % 3 === 0 ? 'SQUARE' : i % 2 === 0 ? 'PORTRAIT' : 'LANDSCAPE',
        width: 6000,
        height: 4000,
        format: 'jpeg',
        basePrice: (5000 + (i % 5) * 1000).toString(),
        originalUrl: `storage/originals/${code}.jpg`,
        watermarkUrl: `storage/watermarks/${code}.jpg`,
        thumbnailUrl: `storage/thumbnails/${code}.jpg`,
        sizesJson: {
          XL: { path: `storage/xl/${code}.jpg`, width: 6000, height: 4000 },
          L: { path: `storage/l/${code}.jpg`, width: 2700, height: 1800 },
          M: { path: `storage/m/${code}.jpg`, width: 1200, height: 800 },
          S: { path: `storage/s/${code}.jpg`, width: 420, height: 280 },
        },
        fileSizesJson: { XL: 8500000, L: 3200000, M: 900000, S: 180000 },
        tags: DUMMY_TAGS[catIdx] ?? ['기타'],
        colorTags: DUMMY_COLOR_TAGS[catIdx] ?? ['다색'],
        processingStatus: 'COMPLETED',
        isActive: true,
      },
    })
  }
  console.log('더미 이미지 30건 완료')
}

async function seedDummyOrders() {
  console.log('더미 주문 seed 중...')
  const users = await prisma.user.findMany({ where: { role: 'USER' }, take: 3 })
  const images = await prisma.image.findMany({ take: 10 })

  for (let i = 1; i <= 5; i++) {
    const user = users[(i - 1) % users.length]
    const image = images[(i - 1) % images.length]
    const orderNumber = `ORD-2026-${String(i).padStart(5, '0')}`

    const existing = await prisma.order.findUnique({ where: { orderNumber } })
    if (existing) continue

    const order = await prisma.order.create({
      data: {
        orderNumber,
        idempotencyKey: crypto.randomUUID(),
        userId: user.id,
        totalAmount: '5000',
        status: 'COMPLETED',
        paymentMethod: 'card',
        paidAt: new Date(),
      },
    })
    await prisma.orderItem.create({
      data: {
        orderId: order.id,
        imageId: image.id,
        size: 'L',
        licenseType: 'STANDARD',
        price: '5000',
        downloadToken: crypto.randomUUID(),
        downloadLimit: 3,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    })
  }
  console.log('더미 주문 5건 완료')
}

async function main() {
  console.log('Seed 시작...')
  await seedCategories()
  await seedSystemConfig()
  await seedAdminUser()
  await seedDummyUsers()
  await seedDummyImages()
  await seedDummyOrders()
  console.log('Seed 완료!')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
