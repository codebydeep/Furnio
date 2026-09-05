import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware.js'
import { getDashboardSummary } from '../controllers/dashboard.controllers.js'

export const dashboardRouter = Router()
dashboardRouter.get('/summary', authenticate, getDashboardSummary)
