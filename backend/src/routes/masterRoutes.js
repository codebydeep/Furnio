import { Router } from 'express'
import { authenticate } from '../middleware/authenticate.js'
import { authorize } from '../middleware/authorize.js'
import { CAN_MANAGE_MASTER } from '../config/roles.js'
import { validate, contactSchema, productSchema, accountSchema, journalSchema, analyticAccountSchema, budgetSchema } from '../validators/masterValidators.js'

import { getAllContacts, getContactById, createContact, updateContact, deleteContact } from '../controllers/contactController.js'
import { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct } from '../controllers/productController.js'
import { getAllAccounts, getAccountById, createAccount, updateAccount, deleteAccount } from '../controllers/accountController.js'
import { getAllJournals, getJournalById, createJournal, updateJournal, deleteJournal } from '../controllers/journalController.js'
import { getAllAnalyticAccounts, getAnalyticAccountById, createAnalyticAccount, updateAnalyticAccount, deleteAnalyticAccount } from '../controllers/analyticAccountController.js'
import { getAllBudgets, getBudgetById, createBudget, updateBudget, deleteBudget } from '../controllers/budgetController.js'

const master = authenticate
const staff  = [authenticate, authorize(...CAN_MANAGE_MASTER)]

export const contactRouter = Router()
contactRouter.get   ('/',    master,   getAllContacts)
contactRouter.get   ('/:id', master,   getContactById)
contactRouter.post  ('/',    ...staff, validate(contactSchema), createContact)
contactRouter.patch ('/:id', ...staff, validate(contactSchema.partial()), updateContact)
contactRouter.delete('/:id', ...staff, deleteContact)

export const productRouter = Router()
productRouter.get   ('/',    master,   getAllProducts)
productRouter.get   ('/:id', master,   getProductById)
productRouter.post  ('/',    ...staff, validate(productSchema), createProduct)
productRouter.patch ('/:id', ...staff, validate(productSchema.partial()), updateProduct)
productRouter.delete('/:id', ...staff, deleteProduct)

export const accountRouter = Router()
accountRouter.get   ('/',    master,   getAllAccounts)
accountRouter.get   ('/:id', master,   getAccountById)
accountRouter.post  ('/',    ...staff, validate(accountSchema), createAccount)
accountRouter.patch ('/:id', ...staff, validate(accountSchema.partial()), updateAccount)
accountRouter.delete('/:id', ...staff, deleteAccount)

export const journalRouter = Router()
journalRouter.get   ('/',    master,   getAllJournals)
journalRouter.get   ('/:id', master,   getJournalById)
journalRouter.post  ('/',    ...staff, validate(journalSchema), createJournal)
journalRouter.patch ('/:id', ...staff, validate(journalSchema.partial()), updateJournal)
journalRouter.delete('/:id', ...staff, deleteJournal)

export const analyticAccountRouter = Router()
analyticAccountRouter.get   ('/',    master,   getAllAnalyticAccounts)
analyticAccountRouter.get   ('/:id', master,   getAnalyticAccountById)
analyticAccountRouter.post  ('/',    ...staff, validate(analyticAccountSchema), createAnalyticAccount)
analyticAccountRouter.patch ('/:id', ...staff, validate(analyticAccountSchema.partial()), updateAnalyticAccount)
analyticAccountRouter.delete('/:id', ...staff, deleteAnalyticAccount)

export const budgetRouter = Router()
budgetRouter.get   ('/',    master,   getAllBudgets)
budgetRouter.get   ('/:id', master,   getBudgetById)
budgetRouter.post  ('/',    ...staff, validate(budgetSchema), createBudget)
budgetRouter.patch ('/:id', ...staff, validate(budgetSchema.partial()), updateBudget)
budgetRouter.delete('/:id', ...staff, deleteBudget)
