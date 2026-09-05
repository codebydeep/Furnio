import { z } from 'zod'

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

export const contactSchema = z.object({
  name:         z.string({ required_error: 'Name is required.' }).min(1),
  type:         z.enum(['CUSTOMER', 'VENDOR', 'BOTH'], { required_error: 'Type is required.' }),
  email:        z.string().email('Invalid email.').optional().or(z.literal('')),
  mobile:       z.string().optional(),
  city:         z.string().optional(),
  state:        z.string().optional(),
  pincode:      z.string().optional(),
  profileImage: z.string().optional(),
})

export const productSchema = z.object({
  name:       z.string({ required_error: 'Product name is required.' }).min(1),
  type:       z.enum(['GOODS', 'SERVICE', 'COMBO'], { required_error: 'Type is required.' }),
  salesPrice: z.number({ required_error: 'Sales price is required.' }).nonnegative(),
  costPrice:  z.number({ required_error: 'Cost price is required.' }).nonnegative(),
  category:   z.string({ required_error: 'Category is required.' }).min(1),
})

export const accountSchema = z.object({
  name: z.string({ required_error: 'Account name is required.' }).min(1),
  type: z.enum(['ASSET', 'LIABILITY', 'EXPENSE', 'INCOME', 'CAPITAL'], { required_error: 'Account type is required.' }),
})

export const journalSchema = z.object({
  name:             z.string({ required_error: 'Journal name is required.' }).min(1),
  type:             z.enum(['SALES', 'PURCHASE', 'BANK', 'CASH'], { required_error: 'Journal type is required.' }),
  defaultAccountId: z.number().int().positive().optional(),
})

export const analyticAccountSchema = z.object({
  name: z.string({ required_error: 'Name is required.' }).min(1),
  type: z.enum(['INCOME', 'EXPENSES'], { required_error: 'Type is required.' }),
})

export const budgetSchema = z.object({
  name:              z.string({ required_error: 'Budget name is required.' }).min(1),
  periodStart:       z.string({ required_error: 'Period start is required.' }).datetime({ message: 'Invalid date.' }),
  periodEnd:         z.string({ required_error: 'Period end is required.' }).datetime({ message: 'Invalid date.' }),
  plannedAmount:     z.number({ required_error: 'Planned amount is required.' }).nonnegative(),
  responsiblePerson: z.string({ required_error: 'Responsible person is required.' }).min(1),
  analyticAccountId: z.number({ required_error: 'Analytic account is required.' }).int().positive(),
})
