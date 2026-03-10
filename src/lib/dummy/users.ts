import type { User } from '@/types/models'

const now = new Date()

export const dummyUsers: User[] = [
  {
    id: 'user-001',
    email: 'alice@example.com',
    passwordHash: '$2b$12$dummyhashforalicea1b2c3d4e5f6g7h8i9j0k',
    name: '김지수',
    country: 'KR',
    birthYear: 1992,
    role: 'USER',
    agreedTermsAt: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
    createdAt: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'user-002',
    email: 'bob@example.com',
    passwordHash: '$2b$12$dummyhashforbobb1c2d3e4f5g6h7i8j9k0l',
    name: '이민준',
    country: 'KR',
    birthYear: 1988,
    role: 'USER',
    agreedTermsAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
    createdAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'user-003',
    email: 'carol@example.com',
    passwordHash: '$2b$12$dummyhashforcarolc1d2e3f4g5h6i7j8k9l0',
    name: '박서연',
    country: 'KR',
    birthYear: 1995,
    role: 'USER',
    agreedTermsAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
  },
]
