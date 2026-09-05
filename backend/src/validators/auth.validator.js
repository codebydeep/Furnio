import { z } from 'zod'

// Zod v4 compatible — uses .issues not .errors

const passwordSchema = z
  .string({ required_error: 'Password is required.' })
  .min(9, 'Password must be at least 9 characters.')
  .regex(/[A-Z]/,         'Must contain at least one uppercase letter.')
  .regex(/[^a-zA-Z0-9]/, 'Must contain at least one special character.')

// Public self-registration — always creates ADMIN (business owner)
export const registerSchema = z.object({
  name: z.string({ required_error: 'Name is required.' }).min(1, 'Name is required.'),
  loginId: z
    .string({ required_error: 'Login ID is required.' })
    .min(4, 'Login ID must be at least 4 characters.')
    .max(20, 'Login ID must be at most 20 characters.')
    .regex(/^[a-zA-Z0-9_]+$/, 'Login ID can only contain letters, numbers and underscores.'),
  email:    z.string({ required_error: 'Email is required.' }).email('Invalid email address.'),
  password: passwordSchema,
})

// Login — only loginId + password (frontend uses loginId field)
export const loginSchema = z.object({
  loginId:  z.string({ required_error: 'Login ID is required.' }).min(1, 'Login ID is required.'),
  password: z.string({ required_error: 'Password is required.' }).min(1, 'Password is required.'),
})

// Admin creates Accountant / Portal users
export const createUserSchema = z.object({
  name: z.string({ required_error: 'Name is required.' }).min(1),
  loginId: z
    .string({ required_error: 'Login ID is required.' })
    .min(4).max(20)
    .regex(/^[a-zA-Z0-9_]+$/),
  email:     z.string({ required_error: 'Email is required.' }).email(),
  password:  passwordSchema,
  role:      z.enum(['ADMIN', 'ACCOUNTANT', 'USER'], { error: 'Role must be ADMIN, ACCOUNTANT or USER.' }),
  contactId: z.number().int().positive().optional(),
})

export const updateUserSchema = z.object({
  name:     z.string().min(1).optional(),
  email:    z.string().email().optional(),
  password: passwordSchema.optional(),
})

export const changeRoleSchema = z.object({
  role: z.enum(['ADMIN', 'ACCOUNTANT', 'USER'], { error: 'Role must be ADMIN, ACCOUNTANT or USER.' }),
})

// Zod v4: issues is the field (errors is v3 compat alias that may not exist)
export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      const issues = result.error.issues ?? []
      const errors = issues.map(e => ({
        field:   Array.isArray(e.path) ? e.path.join('.') : String(e.path ?? ''),
        message: e.message,
      }))
      return res.status(400).json({
        message: errors[0]?.message ?? 'Validation failed.',
        errors,
      })
    }
    req.body = result.data
    next()
  }
}
