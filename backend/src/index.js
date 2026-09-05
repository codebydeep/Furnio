import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import db from './libs/db.js'

/* ── Route files ────────────────────────────────────────────── */
import authRoutes from './routes/auth.routes.js'
import {
  contactRouter,
  productRouter,
  accountRouter,
  journalRouter,
  analyticAccountRouter,
  budgetRouter,
} from './routes/master.routes.js'
import {
  purchaseOrderRouter,
  vendorBillRouter,
  salesOrderRouter,
  customerInvoiceRouter,
  paymentRouter,
  journalEntryRouter,
} from './routes/transaction.routes.js'
import { reportsRouter }   from './routes/reports.routes.js'
import { dashboardRouter } from './routes/dashboard.routes.js'

const app  = express()
const port = process.env.PORT || 3000


const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  ...(process.env.CLIENT_URL ?? '')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean),
]

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (curl, Postman, mobile)
    if (!origin) return cb(null, true)
    if (allowedOrigins.includes(origin)) return cb(null, true)
    cb(new Error(`CORS: origin ${origin} not allowed`))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

app.use(express.json())

/* ── Health check ───────────────────────────────────────────── */
app.get('/', (_req, res) => res.json({ status: 'ok', service: 'DealFlow API' }))

/* ── Routes ─────────────────────────────────────────────────── */
app.use('/api/auth',              authRoutes)
app.use('/api/dashboard',         dashboardRouter)

// Master data
app.use('/api/contacts',          contactRouter)
app.use('/api/products',          productRouter)
app.use('/api/accounts',          accountRouter)
app.use('/api/journals',          journalRouter)
app.use('/api/analytic-accounts', analyticAccountRouter)
app.use('/api/budgets',           budgetRouter)

// Transactions
app.use('/api/purchase-orders',    purchaseOrderRouter)
app.use('/api/vendor-bills',       vendorBillRouter)
app.use('/api/sales-orders',       salesOrderRouter)
app.use('/api/customer-invoices',  customerInvoiceRouter)
app.use('/api/payments',           paymentRouter)
app.use('/api/journal-entries',    journalEntryRouter)

// Reports
app.use('/api/reports', reportsRouter)

/* ── 404 ────────────────────────────────────────────────────── */
app.use((_req, res) => res.status(404).json({ message: 'Route not found.' }))

/* ── Global error handler ───────────────────────────────────── */
app.use((err, _req, res, _next) => {
  console.error('[unhandled]', err)
  res.status(err.status ?? 500).json({ message: err.message || 'Internal server error.' })
})

/* ── Start ──────────────────────────────────────────────────── */
db.$connect()
  .then(() => {
    console.log('✅ Database connected')
    app.listen(port, () => console.log(`🚀 Server listening on port ${port}`))
  })
  .catch(err => {
    console.error('❌ Failed to connect to database:', err)
    process.exit(1)
  })
