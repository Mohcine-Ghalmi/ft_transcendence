import { z } from 'zod'

export const sendEmailBody = z.object({
  to: z.string().email('Invalid email format'),
  subject: z.string(),
  html: z.string(),
})

export const resetPasswordSchema = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .refine((value) => !/\s/.test(value), {
      message: 'No whitespace allowed',
    }),
  otp: z.string().max(6).default(''),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .refine((value) => !/\s/.test(value), {
      message: 'No whitespace allowed',
    }),
})

export const resetOtpSchema = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .refine((value) => !/\s/.test(value), {
      message: 'No whitespace allowed',
    }),
})

export const OtpSchema = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .refine((value) => !/\s/.test(value), {
      message: 'No whitespace allowed',
    }),
  otp: z.string().max(6).default(''),
})

export type sendEmailBodyType = z.infer<typeof sendEmailBody>
export type resetPasswordType = z.infer<typeof resetPasswordSchema>
export type resetOtpType = z.infer<typeof resetOtpSchema>
export type OtpType = z.infer<typeof OtpSchema>
