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

const orderItemSchema = z.object({
  productId: z.number({ required_error: 'productId is required.' }).int().positive(),
  quantity:  z.number({ required_error: 'quantity is required.' }).positive(),
  unitPrice: z.number({ required_error: 'unitPrice is required.' }).nonnegative(),
})

export const purchaseOrderSchema = z.object({
  vendorId: z.number({ required_error: 'vendorId is required.' }).int().positive(),
  items:    z.array(orderItemSchema).min(1, 'At least one item is required.'),
})

export const vendorBillSchema = z.object({
  purchaseOrderId: z.number({ required_error: 'purchaseOrderId is required.' }).int().positive(),
  invoiceDate:     z.string({ required_error: 'invoiceDate is required.' }).datetime({ message: 'Invalid date.' }),
  dueDate:         z.string({ required_error: 'dueDate is required.' }).datetime({ message: 'Invalid date.' }),
})

const salesItemSchema = orderItemSchema.extend({
  tax: z.number().nonnegative().default(0),
})

export const salesOrderSchema = z.object({
  customerId: z.number({ required_error: 'customerId is required.' }).int().positive(),
  items:      z.array(salesItemSchema).min(1, 'At least one item is required.'),
})

export const customerInvoiceSchema = z.object({
  salesOrderId: z.number({ required_error: 'salesOrderId is required.' }).int().positive(),
  invoiceDate:  z.string({ required_error: 'invoiceDate is required.' }).datetime({ message: 'Invalid date.' }),
  dueDate:      z.string().datetime({ message: 'Invalid date.' }).optional(),
})

export const paymentSchema = z.object({
  amount:       z.number({ required_error: 'amount is required.' }).positive(),
  method:       z.enum(['CASH', 'BANK'], { required_error: 'method is required.' }),
  vendorBillId: z.number().int().positive().optional(),
  invoiceId:    z.number().int().positive().optional(),
}).refine((d) => d.vendorBillId || d.invoiceId, {
  message: 'Either vendorBillId or invoiceId is required.',
})

const journalItemSchema = z.object({
  accountId: z.number({ required_error: 'accountId is required.' }).int().positive(),
  debit:     z.number().nonnegative().default(0),
  credit:    z.number().nonnegative().default(0),
})

export const journalEntrySchema = z.object({
  journalId: z.number({ required_error: 'journalId is required.' }).int().positive(),
  date:      z.string({ required_error: 'date is required.' }).datetime({ message: 'Invalid date.' }),
  reference: z.string().optional(),
  items:     z.array(journalItemSchema).min(2, 'At least two journal items required for double-entry.'),
}).refine((d) => {
  const totalDebit  = d.items.reduce((s, i) => s + i.debit,  0)
  const totalCredit = d.items.reduce((s, i) => s + i.credit, 0)
  return Math.abs(totalDebit - totalCredit) < 0.001
}, { message: 'Total debits must equal total credits.' })
