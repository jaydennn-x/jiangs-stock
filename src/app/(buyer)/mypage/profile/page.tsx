import { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import { getMyProfile } from '@/lib/actions/mypage'
import { ProfilePageClient } from './profile-client'

export const metadata: Metadata = {
  title: '내 정보 | JiangsStock',
}

export default async function MyProfilePage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login')
  }

  const result = await getMyProfile()
  if (!result.success) {
    redirect('/login')
  }

  return <ProfilePageClient profile={result.profile} />
}
