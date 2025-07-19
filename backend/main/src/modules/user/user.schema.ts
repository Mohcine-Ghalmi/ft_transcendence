import { z } from 'zod'
import { buildJsonSchemas } from 'fastify-zod'
import {
  sendEmailBody,
  resetOtpSchema,
  resetPasswordSchema,
  OtpSchema,
} from '../Mail/mail.schema'

// user :  {
//   first_name: 'Mohamed',
//   last_name: 'Sarda',
//   email: 'msarda@student.1337.ma',
//   avatar: 'https://cdn.intra.42.fr/users/bc95ebcdf28f6bfccca53360bc341a32/msarda.jpg',
//   isOnline: true,
//   type: 2,
//   login: 'msarda',
//   level: 1,
//   resetOtp: '',
//   resetOtpExpireAt: ''
// }

const userCore = {
  username: z
    .string()
    .min(3)
    .nonempty('username is required')
    .regex(/^[A-Za-z]+$/, 'Only letters are allowed')
    .refine((value) => !/\s/.test(value), {
      message: 'No whitespace allowed',
    }),
  email: z
    .string()
    .email('Invalid email format')
    .refine((value) => !/\s/.test(value), {
      message: 'No whitespace allowed',
    }),
  avatar: z.string().default('default.avif'),
  type: z.number().default(1),
  level: z.number().default(1),
  xp: z.number().default(0),
  login: z.string().default(''),
  resetOtp: z.string().max(6).default(''),
  resetOtpExpireAt: z.string().default(''),
}

const googleSchema = z.object({
  ...userCore,
})

const createUserSchema = z.object({
  ...userCore,
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .refine((value) => !/\s/.test(value), {
      message: 'No whitespace allowed',
    }),
})

export const createUserResponseSchema = z.object({
  id: z.number(),
  ...userCore,
})

const loginSchema = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .refine((value) => !/\s/.test(value), {
      message: 'No whitespace allowed',
    }),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .refine((value) => !/\s/.test(value), {
      message: 'No whitespace allowed',
    }),
})

const loginResponseSchema = z.object({
  ...userCore,
  accessToken: z.string(),
  id: z.number(),
})

export type CreateUserInput = z.infer<typeof createUserSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type loginResponse = z.infer<typeof loginResponseSchema>

export const { schemas: userSchemas, $ref } = buildJsonSchemas(
  {
    googleSchema,
    createUserSchema,
    createUserResponseSchema,
    loginSchema,
    loginResponseSchema,
    sendEmailBody,
    resetOtpSchema,
    resetPasswordSchema,
    OtpSchema,
  },
  { $id: 'userSchemas' }
)
