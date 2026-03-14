import { z } from 'zod'

const CURRENT_YEAR = new Date().getFullYear()

const PASSWORD_REGEX = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/
const PASSWORD_MESSAGE = '영문, 숫자, 특수문자(!@#$%^&*)를 모두 포함해야 합니다'
const SHOOT_DATE_REGEX = /^\d{4}$/

const passwordField = z
  .string()
  .min(8, '비밀번호는 최소 8자 이상이어야 합니다')
  .regex(PASSWORD_REGEX, PASSWORD_MESSAGE)

export const signupSchema = z
  .object({
    email: z.string().email('올바른 이메일 형식이 아닙니다'),
    password: passwordField,
    passwordConfirm: z.string(),
    name: z.string().optional(),
    country: z.string().optional(),
    birthYear: z.coerce.number().min(1900).max(CURRENT_YEAR).optional(),
    agreedTerms: z.literal(true, {
      error: () => ({ message: '이용약관에 동의해주세요' }),
    }),
    agreedPrivacy: z.literal(true, {
      error: () => ({ message: '개인정보 수집에 동의해주세요' }),
    }),
  })
  .refine(data => data.password === data.passwordConfirm, {
    message: '비밀번호가 일치하지 않습니다',
    path: ['passwordConfirm'],
  })

export type SignupFormData = z.infer<typeof signupSchema>

export const loginSchema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다'),
  password: z.string().min(1, '비밀번호를 입력해주세요'),
  rememberMe: z.boolean().optional(),
})

export type LoginFormData = z.infer<typeof loginSchema>

export const productSchema = z.object({
  name: z
    .string()
    .min(1, '상품명을 입력해주세요')
    .max(100, '상품명은 100자 이하여야 합니다'),
  description: z.string().optional(),
  tags: z.array(z.string()).min(1, '태그를 최소 1개 입력해주세요'),
  colorTags: z.array(z.string()),
  basePrice: z.coerce.number().positive('기준 가격은 0보다 커야 합니다'),
  shootDate: z
    .string()
    .regex(SHOOT_DATE_REGEX, '촬영 연월은 4자리 숫자여야 합니다')
    .optional(),
})

export type ProductFormData = z.infer<typeof productSchema>

export const productUpdateSchema = productSchema

export type ProductUpdateFormData = z.infer<typeof productUpdateSchema>

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, '현재 비밀번호를 입력해주세요'),
    newPassword: passwordField,
    newPasswordConfirm: z.string(),
  })
  .refine(data => data.newPassword === data.newPasswordConfirm, {
    message: '새 비밀번호가 일치하지 않습니다',
    path: ['newPasswordConfirm'],
  })

export type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>

export const profileUpdateSchema = z.object({
  name: z.string().optional(),
  country: z.string().optional(),
  birthYear: z.coerce.number().min(1900).max(CURRENT_YEAR).optional(),
})

export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>
