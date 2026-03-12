'use client'

import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

import {
  passwordChangeSchema,
  profileUpdateSchema,
  type PasswordChangeFormData,
  type ProfileUpdateFormData,
} from '@/types/forms'
import { changePassword, updateProfile } from '@/lib/actions/mypage'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'

const COUNTRY_OPTIONS = [
  { value: 'KR', label: '대한민국' },
  { value: 'US', label: '미국' },
  { value: 'JP', label: '일본' },
  { value: 'CN', label: '중국' },
  { value: 'OTHER', label: '기타' },
]

interface ProfilePageClientProps {
  profile: {
    email: string
    name: string | null
    country: string | null
    birthYear: number | null
  }
}

export function ProfilePageClient({ profile }: ProfilePageClientProps) {
  const passwordForm = useForm<PasswordChangeFormData>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      newPasswordConfirm: '',
    },
  })

  const profileForm = useForm<ProfileUpdateFormData>({
    resolver: zodResolver(profileUpdateSchema) as never,
    defaultValues: {
      name: profile.name ?? '',
      country: profile.country ?? '',
      birthYear: profile.birthYear ?? undefined,
    },
  })

  async function onPasswordSubmit(data: PasswordChangeFormData) {
    const result = await changePassword(data)
    if (result.success) {
      toast.success('비밀번호가 변경되었습니다')
      passwordForm.reset()
    } else {
      toast.error(result.error)
    }
  }

  async function onProfileSubmit(data: ProfileUpdateFormData) {
    const result = await updateProfile(data)
    if (result.success) {
      toast.success('정보가 저장되었습니다')
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 마이페이지 탭 네비게이션 */}
      <nav className="mb-6 flex gap-1 border-b">
        <Link
          href="/mypage/orders"
          className="text-muted-foreground hover:text-foreground px-4 pb-3 text-sm transition-colors"
        >
          구매 내역
        </Link>
        <Link
          href="/mypage/profile"
          className="border-foreground border-b-2 px-4 pb-3 text-sm font-semibold"
        >
          내 정보
        </Link>
      </nav>

      <h1 className="mb-6 text-2xl font-bold">내 정보</h1>

      <div className="max-w-xl space-y-6">
        {/* 이메일 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">계정 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p className="text-sm font-medium">이메일</p>
              <Input value={profile.email} disabled />
              <p className="text-muted-foreground text-xs">
                이메일은 변경할 수 없습니다.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 비밀번호 변경 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">비밀번호 변경</CardTitle>
            <CardDescription className="text-xs">
              최소 8자, 영문·숫자·특수문자(!@#$%^&*)를 모두 포함해야 합니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...passwordForm}>
              <form
                onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={passwordForm.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>현재 비밀번호</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="현재 비밀번호"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={passwordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>새 비밀번호</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="새 비밀번호"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={passwordForm.control}
                  name="newPasswordConfirm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>새 비밀번호 확인</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="새 비밀번호 확인"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  비밀번호 변경
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Separator />

        {/* 프로필 정보 수정 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">프로필 정보</CardTitle>
            <CardDescription className="text-xs">
              선택 정보를 수정할 수 있습니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...profileForm}>
              <form
                onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={profileForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>이름</FormLabel>
                      <FormControl>
                        <Input placeholder="이름 (선택)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>국가</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="국가 선택 (선택)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {COUNTRY_OPTIONS.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="birthYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>출생연도</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="예: 1990"
                          {...field}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  저장
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
