'use client'

import { useState } from 'react'
import Link from 'next/link'
import { EyeIcon, EyeOffIcon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { signupSchema } from '@/types/forms'

type SignupFormData = {
  email: string
  password: string
  passwordConfirm: string
  name?: string
  country?: string
  birthYear?: number
  agreedTerms: true
  agreedPrivacy: true
}
import {
  calcPasswordStrength,
  getStrengthInfo,
  getStrengthPercent,
} from '@/lib/password-strength'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

const COUNTRIES = ['한국', '미국', '일본', '중국', '영국', '독일', '프랑스', '캐나다', '호주', '기타']
const CURRENT_YEAR = new Date().getFullYear()
const BIRTH_YEARS = Array.from(
  { length: CURRENT_YEAR - 14 - 1950 + 1 },
  (_, i) => CURRENT_YEAR - 14 - i
)

interface PasswordStrengthBarProps {
  password: string
}

function PasswordStrengthBar({ password }: PasswordStrengthBarProps) {
  if (!password) return null
  const score = calcPasswordStrength(password)
  const info = getStrengthInfo(score)
  const percent = getStrengthPercent(score)
  return (
    <div className="space-y-1">
      <Progress value={percent} className="h-1.5" />
      {info.label && (
        <p className={`text-xs font-medium ${info.colorClass}`}>
          비밀번호 강도: {info.label}
        </p>
      )}
    </div>
  )
}

export function SignupForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null)

  const form = useForm<SignupFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(signupSchema) as any,
    defaultValues: {
      email: '',
      password: '',
      passwordConfirm: '',
      name: '',
      country: '',
      agreedTerms: undefined,
      agreedPrivacy: undefined,
    },
  })

  const passwordValue = form.watch('password') ?? ''

  function onSubmit(data: SignupFormData) {
    console.log('회원가입:', data)
  }

  function handleEmailBlur() {
    const email = form.getValues('email')
    if (email && /\S+@\S+\.\S+/.test(email)) {
      setEmailAvailable(true)
    }
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">회원가입</CardTitle>
        <CardDescription>새 계정을 만들어 서비스를 시작하세요</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* 이메일 */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>이메일 *</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      {...field}
                      onBlur={() => {
                        field.onBlur()
                        handleEmailBlur()
                      }}
                    />
                  </FormControl>
                  {emailAvailable === true && (
                    <p className="text-xs font-medium text-green-600">
                      사용 가능한 이메일입니다
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 비밀번호 */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>비밀번호 *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="비밀번호를 입력하세요"
                        className="pr-10"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(prev => !prev)}
                      >
                        {showPassword ? (
                          <EyeOffIcon className="h-4 w-4" />
                        ) : (
                          <EyeIcon className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormDescription>
                    최소 8자, 영문+숫자+특수문자(!@#$%^&amp;*) 포함
                  </FormDescription>
                  <PasswordStrengthBar password={passwordValue} />
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 비밀번호 확인 */}
            <FormField
              control={form.control}
              name="passwordConfirm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>비밀번호 확인 *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPasswordConfirm ? 'text' : 'password'}
                        placeholder="비밀번호를 다시 입력하세요"
                        className="pr-10"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPasswordConfirm(prev => !prev)}
                      >
                        {showPasswordConfirm ? (
                          <EyeOffIcon className="h-4 w-4" />
                        ) : (
                          <EyeIcon className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 이름 (선택) */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>이름 (선택)</FormLabel>
                  <FormControl>
                    <Input placeholder="홍길동" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 국가 (선택) */}
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>국가 (선택)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="국가를 선택하세요" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {COUNTRIES.map(country => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 출생연도 (선택) */}
            <FormField
              control={form.control}
              name="birthYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>출생연도 (선택)</FormLabel>
                  <Select
                    onValueChange={val => field.onChange(Number(val))}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="출생연도를 선택하세요" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {BIRTH_YEARS.map(year => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}년
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 이용약관 동의 */}
            <FormField
              control={form.control}
              name="agreedTerms"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value === true}
                      onCheckedChange={checked => field.onChange(checked === true ? true : undefined)}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="cursor-pointer font-normal">
                      <Link href="/terms" className="text-primary underline-offset-4 hover:underline">
                        이용약관
                      </Link>
                      에 동의합니다 *
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            {/* 개인정보처리방침 동의 */}
            <FormField
              control={form.control}
              name="agreedPrivacy"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value === true}
                      onCheckedChange={checked => field.onChange(checked === true ? true : undefined)}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="cursor-pointer font-normal">
                      <Link href="/privacy" className="text-primary underline-offset-4 hover:underline">
                        개인정보처리방침
                      </Link>
                      에 동의합니다 *
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              회원가입하기
            </Button>
          </form>
        </Form>

        <div className="mt-6 text-center">
          <p className="text-muted-foreground text-sm">
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className="text-primary underline-offset-4 hover:underline">
              로그인
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
