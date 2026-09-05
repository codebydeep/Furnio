import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware.js'
import { authorize } from '../middleware/authorize.middleware.js'
import { validate } from '../validators/master.validators.js'
import {
  purchaseOrderSchema,
  vendorBillPaymentSchema,
  salesOrderSchema,
  invoicePaymentSchema,
  journalEntrySchema,
} from '../validators/transaction.validators.js'

import {
  getAllPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  confirmPurchaseOrder,
  createBillFromPO,
} from '../controllers/purchaseOrder.controllers.js'

import {
  getAllVendorBills,
  getVendorBillById,
  registerBillPayment,
} from '../controllers/vendorBill.controllers.js'

import {
  getAllSalesOrders,
  getSalesOrderById,
  createSalesOrder,
  confirmSalesOrder,
  createInvoiceFromSO,
} from '../controllers/salesOrder.controllers.js'

import {
  getAllCustomerInvoices,
  getCustomerInvoiceById,
  registerInvoicePayment,
  getMyInvoices,
  getMyBills,
  getMyPayments,
} from '../controllers/customerInvoice.controllers.js'

import {
  getAllPayments,
  getPaymentById,
} from '../controllers/payment.controllers.js'

import {
  getAllJournalEntries,
  getJournalEntryById,
  createJournalEntry,
  postJournalEntry,
  cancelJournalEntry,
} from '../controllers/journalEntry.controllers.js'

const staff   = [authenticate, authorize('ADMIN', 'ACCOUNTANT')]
const admin   = [authenticate, authorize('ADMIN')]
const authAll = authenticate

/* ── Purchase Orders ─────────────────────────────────────────── */
export const purchaseOrderRouter = Router()
purchaseOrderRouter.get   ('/',             ...staff, getAllPurchaseOrders)
purchaseOrderRouter.get   ('/:id',          ...staff, getPurchaseOrderById)
purchaseOrderRouter.post  ('/',             ...staff, validate(purchaseOrderSchema), createPurchaseOrder)
purchaseOrderRouter.patch ('/:id/confirm',  ...staff, confirmPurchaseOrder)
purchaseOrderRouter.post  ('/:id/create-bill', ...staff, createBillFromPO)

/* ── Vendor Bills ────────────────────────────────────────────── */
export const vendorBillRouter = Router()
vendorBillRouter.get   ('/',       ...staff, getAllVendorBills)
vendorBillRouter.get   ('/:id',    ...staff, getVendorBillById)
vendorBillRouter.post  ('/:id/payments', ...staff, validate(vendorBillPaymentSchema), registerBillPayment)

/* ── Sales Orders ────────────────────────────────────────────── */
export const salesOrderRouter = Router()
salesOrderRouter.get   ('/',             ...staff, getAllSalesOrders)
salesOrderRouter.get   ('/:id',          ...staff, getSalesOrderById)
salesOrderRouter.post  ('/',             ...staff, validate(salesOrderSchema), createSalesOrder)
salesOrderRouter.patch ('/:id/confirm',  ...staff, confirmSalesOrder)
salesOrderRouter.post  ('/:id/create-invoice', ...staff, createInvoiceFromSO)

/* ── Customer Invoices ───────────────────────────────────────── */
export const customerInvoiceRouter = Router()
customerInvoiceRouter.get('/my',           authAll, getMyInvoices)
customerInvoiceRouter.get('/my-bills',     authAll, getMyBills)
customerInvoiceRouter.get('/my-payments',  authAll, getMyPayments)
customerInvoiceRouter.get('/',             ...staff, getAllCustomerInvoices)
customerInvoiceRouter.get('/:id',          authAll, getCustomerInvoiceById)
customerInvoiceRouter.post('/:id/payments', authAll, validate(invoicePaymentSchema), registerInvoicePayment)
customerInvoiceRouter.post('/:id/pay',      authAll, registerInvoicePayment)

/* ── Payments ────────────────────────────────────────────────── */
export const paymentRouter = Router()
paymentRouter.get('/my',  authAll, getMyPayments)
paymentRouter.get('/',    ...staff, getAllPayments)
paymentRouter.get('/:id', ...staff, getPaymentById)

/* ── Journal Entries ─────────────────────────────────────────── */
export const journalEntryRouter = Router()
journalEntryRouter.get   ('/',          ...staff, getAllJournalEntries)
journalEntryRouter.get   ('/:id',       ...staff, getJournalEntryById)
journalEntryRouter.post  ('/',          ...staff, validate(journalEntrySchema), createJournalEntry)
journalEntryRouter.patch ('/:id/post',  ...staff, postJournalEntry)
journalEntryRouter.patch ('/:id/cancel',...admin,  cancelJournalEntry)
