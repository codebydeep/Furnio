import { z } from 'zod'

export const registerSchema = z.object({
  email: z
    .string({ required_error: 'Email is required.' })
    .email('Invalid email address.'),
  password: z
    .string({ required_error: 'Password is required.' })
    .min(9, 'Password must be more than 8 characters.')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter.')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character.'),
  role: z.enum(['ADMIN', 'ACCOUNTANT', 'CONTACT'], {
    required_error: 'Role is required.',
    invalid_type_error: 'Role must be ADMIN, ACCOUNTANT, or CONTACT.',
  }),
  contactId: z.string().uuid('Invalid contactId.').optional(),
})

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required.' })
    .email('Invalid email address.'),
  password: z
    .string({ required_error: 'Password is required.' })
    .min(1, 'Password is required.'),
})

export const changeRoleSchema = z.object({
  role: z.enum(['ADMIN', 'ACCOUNTANT', 'CONTACT'], {
    required_error: 'Role is required.',
    invalid_type_error: 'Role must be ADMIN, ACCOUNTANT, or CONTACT.',
  }),
})

export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }))
      return res.status(400).json({ message: 'Validation failed.', errors })
    }
    req.body = result.data
    next()
  }
}
