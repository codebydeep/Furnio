import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import db from './libs/db.js'
import authRoutes    from './routes/auth.routes.js'
import contactRoutes from './routes/contact.routes.js'
import productRoutes from './routes/product.routes.js'
import accountRoutes from './routes/account.routes.js'
import journalRoutes from './routes/journal.routes.js'

const app  = express()
const port = process.env.PORT || 3000

const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map(o => o.trim())
  : ['http://localhost:5173']

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

app.use('/api/auth',     authRoutes)
app.use('/api/contacts', contactRoutes)
app.use('/api/products', productRoutes)
app.use('/api/accounts', accountRoutes)
app.use('/api/journals', journalRoutes)

app.use((_req, res) => res.status(404).json({ message: 'Route not found.' }))

app.use((err, _req, res, _next) => {
  console.error('[unhandled]', err)
  res.status(500).json({ message: err.message || 'Internal server error.' })
})

db.$connect()
  .then(() => {
    console.log('Database connected')
    app.listen(port, () => console.log(`Server listening on port ${port}`))
  })
  .catch(err => {
    console.error('Failed to connect to database:', err)
    process.exit(1)
  })
