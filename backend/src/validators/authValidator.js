import { z } from 'zod'

const passwordSchema = z
  .string({ required_error: 'Password is required.' })
  .min(9, 'Password must be more than 8 characters.')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter.')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character.')

const loginIdSchema = z
  .string({ required_error: 'Login ID is required.' })
  .min(3, 'Login ID must be at least 3 characters.')
  .max(20, 'Login ID must be at most 20 characters.')
  .regex(/^[a-zA-Z0-9_]+$/, 'Login ID can only contain letters, numbers, and underscores.')

export const registerSchema = z.object({
  name:     z.string({ required_error: 'Name is required.' }).min(2, 'Name must be at least 2 characters.'),
  loginId:  loginIdSchema,
  email:    z.string({ required_error: 'Email is required.' }).email('Invalid email address.'),
  password: passwordSchema,
})

export const loginSchema = z.object({
  loginId:  z.string({ required_error: 'Login ID is required.' }).min(1),
  password: z.string({ required_error: 'Password is required.' }).min(1),
})

export const createUserSchema = z.object({
  name:      z.string({ required_error: 'Name is required.' }).min(2, 'Name must be at least 2 characters.'),
  loginId:   loginIdSchema,
  email:     z.string({ required_error: 'Email is required.' }).email('Invalid email address.'),
  password:  passwordSchema,
  role:      z.enum(['ADMIN', 'ACCOUNTANT', 'USER'], { required_error: 'Role is required.' }),
  contactId: z.number().int().positive().optional(),
})

export const changeRoleSchema = z.object({
  role: z.enum(['ADMIN', 'ACCOUNTANT', 'USER'], { required_error: 'Role is required.' }),
})

export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      const errors = result.error.errors.map((e) => ({ field: e.path.join('.'), message: e.message }))
      return res.status(400).json({ message: 'Validation failed.', errors })
    }
    req.body = result.data
    next()
  }
}
