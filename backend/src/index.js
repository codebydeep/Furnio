import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import prisma from './db/prisma.js'

import authRoutes from './routes/authRoutes.js'
import { contactRouter, productRouter, accountRouter, journalRouter, analyticAccountRouter, budgetRouter } from './routes/masterRoutes.js'
import { purchaseOrderRouter, vendorBillRouter, salesOrderRouter, invoiceRouter, paymentRouter, journalEntryRouter, reportsRouter } from './routes/transactionRoutes.js'

const app  = express()
const port = process.env.PORT || 3000

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5174')
  .split(',')
  .map(o => o.trim())

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true)
    cb(new Error(`CORS: origin ${origin} not allowed`))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

app.use(express.json())

app.get('/', (_req, res) => res.json({ status: 'ok', message: 'DealFlow API is running.' }))

app.use('/api/auth',             authRoutes)
app.use('/api/contacts',         contactRouter)
app.use('/api/products',         productRouter)
app.use('/api/accounts',         accountRouter)
app.use('/api/journals',         journalRouter)
app.use('/api/analytic-accounts', analyticAccountRouter)
app.use('/api/budgets',          budgetRouter)
app.use('/api/purchase-orders',  purchaseOrderRouter)
app.use('/api/vendor-bills',     vendorBillRouter)
app.use('/api/sales-orders',     salesOrderRouter)
app.use('/api/invoices',         invoiceRouter)
app.use('/api/payments',         paymentRouter)
app.use('/api/journal-entries',  journalEntryRouter)
app.use('/api/reports',          reportsRouter)

app.use((_req, res) => res.status(404).json({ message: 'Route not found.' }))

app.use((err, _req, res, _next) => {
  console.error('[unhandled]', err)
  res.status(500).json({ message: err.message || 'Internal server error.' })
})

prisma.$connect()
  .then(() => {
    console.log('✓ Database connected')
    app.listen(port, () => console.log(`✓ Server listening on port ${port}`))
  })
  .catch(err => {
    console.error('✗ Failed to connect to database:', err)
    process.exit(1)
  })
