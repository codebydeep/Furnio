import { z } from 'zod'

const passwordSchema = z
  .string({ required_error: 'Password is required.' })
  .min(9, 'Password must be at least 9 characters.')
  .regex(/[A-Z]/,         'Password must contain at least one uppercase letter.')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character.')

export const registerSchema = z.object({
  name: z.string({ required_error: 'Name is required.' }).min(1),
  loginId: z
    .string({ required_error: 'Login ID is required.' })
    .min(4, 'Login ID must be at least 4 characters.')
    .max(20, 'Login ID must be at most 20 characters.')
    .regex(/^[a-zA-Z0-9_]+$/, 'Login ID can only contain letters, numbers and underscores.'),
  email:    z.string({ required_error: 'Email is required.' }).email('Invalid email.'),
  password: passwordSchema,
})

export const loginSchema = z.object({
  loginId:  z.string({ required_error: 'Login ID is required.' }).min(1),
  password: z.string({ required_error: 'Password is required.' }).min(1),
})

export const createUserSchema = z.object({
  name: z.string({ required_error: 'Name is required.' }).min(1),
  loginId: z
    .string({ required_error: 'Login ID is required.' })
    .min(4).max(20)
    .regex(/^[a-zA-Z0-9_]+$/),
  email:     z.string({ required_error: 'Email is required.' }).email(),
  password:  passwordSchema,
  role:      z.enum(['ADMIN', 'ACCOUNTANT', 'USER'], { required_error: 'Role is required.' }),
  contactId: z.number().int().positive().optional(),
})

export const updateUserSchema = z.object({
  name:     z.string().min(1).optional(),
  email:    z.string().email().optional(),
  password: passwordSchema.optional(),
}).strict()

export const changeRoleSchema = z.object({
  role: z.enum(['ADMIN', 'ACCOUNTANT', 'USER'], { required_error: 'Role is required.' }),
})

export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      const errors = result.error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
      return res.status(400).json({ message: 'Validation failed.', errors })
    }
    req.body = result.data
    next()
  }
}
