import { Router } from 'express'
import { authenticate } from '../middleware/authenticate.js'
import { authorize } from '../middleware/authorize.js'
import { CAN_MANAGE_TRANSACTIONS, CAN_MANAGE_INVOICES, CAN_MANAGE_PAYMENTS, CAN_VIEW_REPORTS } from '../config/roles.js'
import { validate, purchaseOrderSchema, vendorBillSchema, salesOrderSchema, customerInvoiceSchema, paymentSchema, journalEntrySchema } from '../validators/transactionValidators.js'

import { getAllPurchaseOrders, getPurchaseOrderById, createPurchaseOrder, deletePurchaseOrder } from '../controllers/purchaseController.js'
import { getAllVendorBills, getVendorBillById, createVendorBill, deleteVendorBill } from '../controllers/vendorBillController.js'
import { getAllSalesOrders, getSalesOrderById, createSalesOrder, deleteSalesOrder } from '../controllers/salesController.js'
import { getAllInvoices, getInvoiceById, createInvoice, deleteInvoice, getMyInvoices, invoiceOwnerCheck } from '../controllers/invoiceController.js'
import { getAllPayments, getPaymentById, createPayment, deletePayment } from '../controllers/paymentController.js'
import { getAllJournalEntries, getJournalEntryById, createJournalEntry, deleteJournalEntry } from '../controllers/journalEntryController.js'
import { getProfitAndLoss, getBalanceSheet, getBudgetReport, getLedger } from '../controllers/reportsController.js'

const staff = [authenticate, authorize(...CAN_MANAGE_TRANSACTIONS)]
const invoiceStaff = [authenticate, authorize(...CAN_MANAGE_INVOICES)]
const paymentStaff = [authenticate, authorize(...CAN_MANAGE_PAYMENTS)]
const reportStaff  = [authenticate, authorize(...CAN_VIEW_REPORTS)]

export const purchaseOrderRouter = Router()
purchaseOrderRouter.get   ('/',    ...staff, getAllPurchaseOrders)
purchaseOrderRouter.get   ('/:id', ...staff, getPurchaseOrderById)
purchaseOrderRouter.post  ('/',    ...staff, validate(purchaseOrderSchema), createPurchaseOrder)
purchaseOrderRouter.delete('/:id', ...staff, deletePurchaseOrder)

export const vendorBillRouter = Router()
vendorBillRouter.get   ('/',    ...invoiceStaff, getAllVendorBills)
vendorBillRouter.get   ('/:id', ...invoiceStaff, getVendorBillById)
vendorBillRouter.post  ('/',    ...invoiceStaff, validate(vendorBillSchema), createVendorBill)
vendorBillRouter.delete('/:id', ...invoiceStaff, deleteVendorBill)

export const salesOrderRouter = Router()
salesOrderRouter.get   ('/',    ...staff, getAllSalesOrders)
salesOrderRouter.get   ('/:id', ...staff, getSalesOrderById)
salesOrderRouter.post  ('/',    ...staff, validate(salesOrderSchema), createSalesOrder)
salesOrderRouter.delete('/:id', ...staff, deleteSalesOrder)

export const invoiceRouter = Router()
invoiceRouter.get('/my',     authenticate,    getMyInvoices)
invoiceRouter.get('/',       ...invoiceStaff, getAllInvoices)
invoiceRouter.get('/:id',    authenticate, invoiceOwnerCheck, getInvoiceById)
invoiceRouter.post('/',      ...invoiceStaff, validate(customerInvoiceSchema), createInvoice)
invoiceRouter.delete('/:id', ...invoiceStaff, deleteInvoice)

export const paymentRouter = Router()
paymentRouter.get   ('/',    ...paymentStaff, getAllPayments)
paymentRouter.get   ('/:id', ...paymentStaff, getPaymentById)
paymentRouter.post  ('/',    ...paymentStaff, validate(paymentSchema), createPayment)
paymentRouter.delete('/:id', ...paymentStaff, deletePayment)

export const journalEntryRouter = Router()
journalEntryRouter.get   ('/',    ...staff, getAllJournalEntries)
journalEntryRouter.get   ('/:id', ...staff, getJournalEntryById)
journalEntryRouter.post  ('/',    ...staff, validate(journalEntrySchema), createJournalEntry)
journalEntryRouter.delete('/:id', ...staff, deleteJournalEntry)

export const reportsRouter = Router()
reportsRouter.get('/profit-loss',   ...reportStaff, getProfitAndLoss)
reportsRouter.get('/balance-sheet', ...reportStaff, getBalanceSheet)
reportsRouter.get('/budget',        ...reportStaff, getBudgetReport)
reportsRouter.get('/ledger/:accountId', ...reportStaff, getLedger)
