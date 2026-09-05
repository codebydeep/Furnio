import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware.js'
import { authorize } from '../middleware/authorize.middleware.js'
import {
  getBalanceSheet,
  getProfitAndLoss,
  getBudgetReport,
} from '../controllers/reports.controllers.js'

const staff = [authenticate, authorize('ADMIN', 'ACCOUNTANT')]

export const reportsRouter = Router()
reportsRouter.get('/balance-sheet', ...staff, getBalanceSheet)
reportsRouter.get('/profit-loss',   ...staff, getProfitAndLoss)
reportsRouter.get('/budget',        ...staff, getBudgetReport)
