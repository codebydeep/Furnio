import { Router } from 'express'
import { authenticate } from '../middleware/authenticate.js'
import { authorize } from '../middleware/authorize.js'
import { CAN_MANAGE_MASTER, CAN_MANAGE_USERS } from '../config/roles.js'

import {
  createContact, getAllContacts, getContactById,
  updateContact, archiveContact, unarchiveContact,
} from '../controllers/contactController.js'

import {
  createProduct, getAllProducts, getProductById,
  updateProduct, archiveProduct, unarchiveProduct,
} from '../controllers/productController.js'

import {
  createAccount, getAllAccounts, getAccountById,
  updateAccount, archiveAccount, unarchiveAccount,
} from '../controllers/accountController.js'

import {
  createJournal, getAllJournals, getJournalById,
  updateJournal, deleteJournal,
} from '../controllers/journalController.js'

import {
  createContactSchema, updateContactSchema,
  createProductSchema, updateProductSchema,
  createAccountSchema, updateAccountSchema,
  createJournalSchema, updateJournalSchema,
  validate,
} from '../validators/masterValidators.js'

const router = Router()
router.use(authenticate)

router.post  ('/',              authorize(...CAN_MANAGE_MASTER), validate(createContactSchema), createContact)
router.get   ('/',              authorize(...CAN_MANAGE_MASTER), getAllContacts)
router.get   ('/:id',           authorize(...CAN_MANAGE_MASTER), getContactById)
router.patch ('/:id',           authorize(...CAN_MANAGE_MASTER), validate(updateContactSchema), updateContact)
router.patch ('/:id/archive',   authorize(...CAN_MANAGE_USERS),  archiveContact)
router.patch ('/:id/unarchive', authorize(...CAN_MANAGE_USERS),  unarchiveContact)

export const contactRouter = router

const productRouter = Router()
productRouter.use(authenticate)

productRouter.post  ('/',              authorize(...CAN_MANAGE_MASTER), validate(createProductSchema), createProduct)
productRouter.get   ('/',              authorize(...CAN_MANAGE_MASTER), getAllProducts)
productRouter.get   ('/:id',           authorize(...CAN_MANAGE_MASTER), getProductById)
productRouter.patch ('/:id',           authorize(...CAN_MANAGE_MASTER), validate(updateProductSchema), updateProduct)
productRouter.patch ('/:id/archive',   authorize(...CAN_MANAGE_USERS),  archiveProduct)
productRouter.patch ('/:id/unarchive', authorize(...CAN_MANAGE_USERS),  unarchiveProduct)

export { productRouter }

const accountRouter = Router()
accountRouter.use(authenticate)

accountRouter.post  ('/',              authorize(...CAN_MANAGE_MASTER), validate(createAccountSchema), createAccount)
accountRouter.get   ('/',              authorize(...CAN_MANAGE_MASTER), getAllAccounts)
accountRouter.get   ('/:id',           authorize(...CAN_MANAGE_MASTER), getAccountById)
accountRouter.patch ('/:id',           authorize(...CAN_MANAGE_MASTER), validate(updateAccountSchema), updateAccount)
accountRouter.patch ('/:id/archive',   authorize(...CAN_MANAGE_USERS),  archiveAccount)
accountRouter.patch ('/:id/unarchive', authorize(...CAN_MANAGE_USERS),  unarchiveAccount)

export { accountRouter }

const journalRouter = Router()
journalRouter.use(authenticate)

journalRouter.post  ('/',    authorize(...CAN_MANAGE_MASTER), validate(createJournalSchema), createJournal)
journalRouter.get   ('/',    authorize(...CAN_MANAGE_MASTER), getAllJournals)
journalRouter.get   ('/:id', authorize(...CAN_MANAGE_MASTER), getJournalById)
journalRouter.patch ('/:id', authorize(...CAN_MANAGE_MASTER), validate(updateJournalSchema), updateJournal)
journalRouter.delete('/:id', authorize(...CAN_MANAGE_USERS),  deleteJournal)

export { journalRouter }
