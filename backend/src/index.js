cls
git statusimport 'dotenv/config'
import express from 'express'
import cors from 'cors'
import prisma from './db/prisma.js'
import authRoutes from './routes/authRoutes.js'
import { contactRouter, productRouter, accountRouter, journalRouter } from './routes/masterRoutes.js'

const app  = express()
const port = process.env.PORT || 3000

/* ── CORS ──────────────────────────────────────────────────────
   Allow requests from the Vite dev server and production origin.
   Add more origins to the array if needed.
─────────────────────────────────────────────────────────────── */
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5174')
  .split(',')
  .map(o => o.trim())

app.use(cors({
  origin: (origin, cb) => {
    // Allow server-to-server calls (no origin) and listed origins
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true)
    cb(new Error(`CORS: origin ${origin} not allowed`))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello World!')
})

// User routes
app.use('/api/users', userRoutes)

/* ── 404 ────────────────────────────────────────────────────── */
app.use((_req, res) => res.status(404).json({ message: 'Route not found.' }))

/* ── Global error handler ───────────────────────────────────── */
app.use((err, _req, res, _next) => {
  console.error('[unhandled]', err)
  res.status(500).json({ message: err.message || 'Internal server error.' })
})

/* ── Start ──────────────────────────────────────────────────── */
prisma.$connect()
  .then(() => {
    console.log('✓ Database connected')
    app.listen(port, () => console.log(`✓ Server listening on port ${port}`))
  })
  .catch(err => {
    console.error('✗ Failed to connect to database:', err)
    process.exit(1)
  })
