import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware.js'
import { authorize } from '../middleware/authorize.middleware.js'
import { CAN_MANAGE_MASTER } from '../config/roles.js'
import {
  validate,
  contactSchema,
  productSchema,
  accountSchema,
  journalSchema,
  analyticAccountSchema,
  budgetSchema,
} from '../validators/master.validators.js'

import {
  getAllContacts,
  getContactById,
  createContact,
  updateContact,
  archiveContact,
} from '../controllers/contact.controllers.js'

import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  archiveProduct,
} from '../controllers/product.controllers.js'

import {
  getAllAccounts,
  getAccountById,
  createAccount,
  updateAccount,
} from '../controllers/account.controllers.js'

import {
  getAllJournals,
  getJournalById,
  createJournal,
  updateJournal,
} from '../controllers/journal.controllers.js'

import {
  getAllAnalyticAccounts,
  getAnalyticAccountById,
  createAnalyticAccount,
  updateAnalyticAccount,
} from '../controllers/analyticAccount.controllers.js'

import {
  getAllBudgets,
  getBudgetById,
  createBudget,
  updateBudget,
  confirmBudget,
  reviseBudget,
  markBudgetDone,
  getBudgetReport,
} from '../controllers/budget.controllers.js'

const auth  = authenticate
const staff = [authenticate, authorize('ADMIN', 'ACCOUNTANT')]
const admin = [authenticate, authorize('ADMIN')]

/* ── Contacts ────────────────────────────────────────────────── */
export const contactRouter = Router()
contactRouter.get   ('/',           auth,     getAllContacts)
contactRouter.get   ('/:id',        auth,     getContactById)
contactRouter.post  ('/',           ...staff, validate(contactSchema), createContact)
contactRouter.patch ('/:id',        ...staff, updateContact)
contactRouter.patch ('/:id/archive',...admin,  archiveContact)

/* ── Products ────────────────────────────────────────────────── */
export const productRouter = Router()
productRouter.get   ('/',           ...staff, getAllProducts)
productRouter.get   ('/:id',        ...staff, getProductById)
productRouter.post  ('/',           ...staff, validate(productSchema), createProduct)
productRouter.patch ('/:id',        ...staff, updateProduct)
productRouter.patch ('/:id/archive',...admin,  archiveProduct)

/* ── Chart of Accounts ───────────────────────────────────────── */
export const accountRouter = Router()
accountRouter.get   ('/',    ...staff, getAllAccounts)
accountRouter.get   ('/:id', ...staff, getAccountById)
accountRouter.post  ('/',    ...admin, validate(accountSchema), createAccount)
accountRouter.patch ('/:id', ...admin, updateAccount)

/* ── Journals ────────────────────────────────────────────────── */
export const journalRouter = Router()
journalRouter.get   ('/',    auth, getAllJournals)
journalRouter.get   ('/:id', ...staff, getJournalById)
journalRouter.post  ('/',    ...admin, validate(journalSchema), createJournal)
journalRouter.patch ('/:id', ...admin, updateJournal)

/* ── Analytic Accounts ───────────────────────────────────────── */
export const analyticAccountRouter = Router()
analyticAccountRouter.get   ('/',    ...staff, getAllAnalyticAccounts)
analyticAccountRouter.get   ('/:id', ...staff, getAnalyticAccountById)
analyticAccountRouter.post  ('/',    ...staff, validate(analyticAccountSchema), createAnalyticAccount)
analyticAccountRouter.patch ('/:id', ...staff, updateAnalyticAccount)

/* ── Budgets ─────────────────────────────────────────────────── */
export const budgetRouter = Router()
budgetRouter.get   ('/',                ...staff, getAllBudgets)
budgetRouter.get   ('/:id',             ...staff, getBudgetById)
budgetRouter.get   ('/:id/report',      ...staff, getBudgetReport)
budgetRouter.post  ('/',                ...staff, validate(budgetSchema), createBudget)
budgetRouter.patch ('/:id',             ...staff, updateBudget)
budgetRouter.patch ('/:id/confirm',     ...staff, confirmBudget)
budgetRouter.patch ('/:id/revise',      ...staff, reviseBudget)
budgetRouter.patch ('/:id/done',        ...admin,  markBudgetDone)
