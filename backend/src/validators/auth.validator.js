import { z } from 'zod'

// ── Register ────────────────────────────────────────────────────────────────
// Business Owner signs up themselves (role = ADMIN).
// Admin creates Accountant/Contact users from the dashboard with any role.
// loginId is always provided by the person creating the account.

export const registerSchema = z.object({
  name: z
    .string({ required_error: 'Name is required.' })
    .min(1, 'Name cannot be empty.'),
  loginId: z
    .string({ required_error: 'Login ID is required.' })
    .min(4,  'Login ID must be at least 4 characters.')
    .max(20, 'Login ID must be at most 20 characters.')
    .regex(/^[a-zA-Z0-9_]+$/, 'Login ID can only contain letters, numbers, and underscores.'),
  email: z
    .string({ required_error: 'Email is required.' })
    .email('Invalid email address.'),
  password: z
    .string({ required_error: 'Password is required.' })
    .min(9,  'Password must be more than 8 characters.')
    .regex(/[a-z]/,          'Password must contain at least one lowercase letter.')
    .regex(/[A-Z]/,          'Password must contain at least one uppercase letter.')
    .regex(/[^a-zA-Z0-9]/,  'Password must contain at least one special character.'),
  role: z.enum(['ADMIN', 'ACCOUNTANT', 'CONTACT'], {
    required_error:    'Role is required.',
    invalid_type_error: 'Role must be ADMIN, ACCOUNTANT, or CONTACT.',
  }),
  // Required only when role === 'CONTACT'
  contactId: z.string().uuid('Invalid contactId.').optional(),
})

// ── Login ────────────────────────────────────────────────────────────────────
// User can log in with either loginId OR email — whichever they remember.

export const loginSchema = z.object({
  identifier: z
    .string({ required_error: 'Login ID or email is required.' })
    .min(1, 'Login ID or email is required.'),
  password: z
    .string({ required_error: 'Password is required.' })
    .min(1, 'Password is required.'),
})

// ── Update User (Admin patching another user's details) ──────────────────────

export const updateUserSchema = z.object({
  name: z.string().min(1, 'Name cannot be empty.').optional(),
  email: z.string().email('Invalid email address.').optional(),
  password: z
    .string()
    .min(9,  'Password must be more than 8 characters.')
    .regex(/[a-z]/,         'Password must contain at least one lowercase letter.')
    .regex(/[A-Z]/,         'Password must contain at least one uppercase letter.')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character.')
    .optional(),
}).strict()

// ── Change Role ──────────────────────────────────────────────────────────────

export const changeRoleSchema = z.object({
  role: z.enum(['ADMIN', 'ACCOUNTANT', 'CONTACT'], {
    required_error:    'Role is required.',
    invalid_type_error: 'Role must be ADMIN, ACCOUNTANT, or CONTACT.',
  }),
})

// ── Validate middleware factory ───────────────────────────────────────────────

export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field:   e.path.join('.'),
        message: e.message,
      }))
      return res.status(400).json({ message: 'Validation failed.', errors })
    }
    req.body = result.data
    next()
  }
}
