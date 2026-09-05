import { z } from 'zod'
import { validate } from './auth.validator.js'

// Re-export validate so route files only need one import
export { validate }

// ---------------------------------------------------------------------------
// Contact
// ---------------------------------------------------------------------------

export const createContactSchema = z.object({
  name: z
    .string({ required_error: 'Name is required.' })
    .min(1, 'Name cannot be empty.'),
  type: z.enum(['CUSTOMER', 'VENDOR', 'BOTH'], {
    required_error: 'Type is required.',
    invalid_type_error: 'Type must be CUSTOMER, VENDOR, or BOTH.',
  }),
  email:        z.string().email('Invalid email address.').optional(),
  mobile:       z.string().max(15, 'Mobile number too long.').optional(),
  city:         z.string().optional(),
  state:        z.string().optional(),
  pincode:      z.string().max(10, 'Pincode too long.').optional(),
  profileImage: z.string().url('Invalid image URL.').optional(),
})

export const updateContactSchema = createContactSchema.partial()

// ---------------------------------------------------------------------------
// Product
// ---------------------------------------------------------------------------

export const createProductSchema = z.object({
  name: z
    .string({ required_error: 'Name is required.' })
    .min(1, 'Name cannot be empty.'),
  type: z.enum(['GOODS', 'SERVICE', 'COMBO'], {
    required_error: 'Type is required.',
    invalid_type_error: 'Type must be GOODS, SERVICE, or COMBO.',
  }),
  salesPrice: z
    .number({ required_error: 'Sales price is required.' })
    .nonnegative('Sales price must be 0 or more.'),
  costPrice: z
    .number({ required_error: 'Cost price is required.' })
    .nonnegative('Cost price must be 0 or more.'),
  category: z.string().optional(),
})

export const updateProductSchema = createProductSchema.partial()

// ---------------------------------------------------------------------------
// Account (Chart of Accounts)
// ---------------------------------------------------------------------------

export const createAccountSchema = z.object({
  name: z
    .string({ required_error: 'Account name is required.' })
    .min(1, 'Account name cannot be empty.'),
  type: z.enum(['ASSET', 'LIABILITY', 'INCOME', 'EXPENSE', 'CAPITAL'], {
    required_error: 'Account type is required.',
    invalid_type_error: 'Type must be ASSET, LIABILITY, INCOME, EXPENSE, or CAPITAL.',
  }),
})

export const updateAccountSchema = createAccountSchema.partial()

// ---------------------------------------------------------------------------
// Journal
// ---------------------------------------------------------------------------

export const createJournalSchema = z.object({
  name: z
    .string({ required_error: 'Journal name is required.' })
    .min(1, 'Journal name cannot be empty.'),
  type: z.enum(['SALES', 'PURCHASE', 'BANK', 'CASH'], {
    required_error: 'Journal type is required.',
    invalid_type_error: 'Type must be SALES, PURCHASE, BANK, or CASH.',
  }),
  defaultAccountId: z.string().uuid('Invalid account ID.').optional(),
})

export const updateJournalSchema = createJournalSchema.partial()
