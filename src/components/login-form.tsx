'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { EyeIcon, EyeOffIcon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'

import { loginSchema, type LoginFormData } from '@/types/forms'
import { loginAction } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [isPending, startTransition] = useTransition()

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  })

  function onSubmit(data: LoginFormData) {
    startTransition(async () => {
      const result = await loginAction(data)
      if (result.success) {
        window.location.href = '/'
        return
      } else {
        form.setError('root', { message: result.error })
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">Welcome back</h2>
        <p className="mt-1.5 text-[13px] text-gray-500 dark:text-gray-400">
          계정에 로그인하여 서비스를 이용하세요
        </p>
      </div>

      <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Username or email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
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
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-y-0 space-x-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value as boolean}
                      onCheckedChange={checked =>
                        field.onChange(checked === true)
                      }
                    />
                  </FormControl>
                  <FormLabel className="cursor-pointer text-[13px] font-normal">
                    로그인 상태 유지
                  </FormLabel>
                </FormItem>
              )}
            />

            {form.formState.errors.root && (
              <p className="text-destructive text-sm">
                {form.formState.errors.root.message}
              </p>
            )}

            <Button type="submit" className="w-full text-sm font-semibold tracking-wide" disabled={isPending}>
              {isPending ? '로그인 중...' : '로그인하기'}
            </Button>
          </form>
        </Form>

    </div>
  )
}
