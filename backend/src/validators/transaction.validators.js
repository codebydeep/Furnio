import { z } from 'zod'

const lineSchema = z.object({
  productId:         z.number().int().positive(),
  analyticAccountId: z.number().int().positive().optional(),
  quantity:          z.number().int().positive(),
  unitPrice:         z.number().nonnegative(),
})

export const purchaseOrderSchema = z.object({
  vendorId: z.number().int().positive({ message: 'Vendor is required.' }),
  poDate:   z.string().optional(),
  items:    z.array(lineSchema).min(1, 'At least one line item is required.'),
})

export const salesOrderSchema = z.object({
  customerId: z.number().int().positive({ message: 'Customer is required.' }),
  soDate:     z.string().optional(),
  items: z.array(
    lineSchema.extend({
      taxRate: z.number().min(0).max(100).optional(),
    })
  ).min(1, 'At least one line item is required.'),
})

export const vendorBillPaymentSchema = z.object({
  journalId:   z.number().int().positive().optional(),
  journalType: z.enum(['BANK', 'CASH']).optional(),
  amount:      z.number().positive({ message: 'Amount must be positive.' }),
  date:        z.string().optional(),
}).refine(d => d.journalId || d.journalType, { message: 'Journal (Bank/Cash) is required.' })

export const invoicePaymentSchema = z.object({
  journalId:   z.number().int().positive().optional(),
  journalType: z.enum(['BANK', 'CASH']).optional(),
  amount:      z.number().positive({ message: 'Amount must be positive.' }),
  date:        z.string().optional(),
}).refine(d => d.journalId || d.journalType, { message: 'Journal (Bank/Cash) is required.' })

const journalItemSchema = z.object({
  accountId:         z.number().int().positive(),
  partnerId:         z.number().int().positive().optional(),
  debit:             z.number().nonnegative().optional(),
  credit:            z.number().nonnegative().optional(),
  analyticAccountId: z.number().int().positive().optional(),
})

export const journalEntrySchema = z.object({
  journalId:      z.number().int().positive({ message: 'Journal is required.' }),
  partnerId:      z.number().int().positive().optional(),
  accountingDate: z.string().optional(),
  items:          z.array(journalItemSchema).min(2, 'At least two journal items (debit + credit) are required.'),
})
