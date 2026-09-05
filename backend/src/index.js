import 'dotenv/config'
import express from 'express'
import prisma from './db/prisma.js'
import authRoutes from './routes/authRoutes.js'
import { contactRouter, productRouter, accountRouter, journalRouter } from './routes/masterRoutes.js'

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'DealFlow API is running.' })
})

// Auth routes
app.use('/api/auth', authRoutes)

// Master data routes
app.use('/api/contacts', contactRouter)
app.use('/api/products', productRouter)
app.use('/api/accounts', accountRouter)
app.use('/api/journals', journalRouter)

// Verify DB connection then start server
prisma.$connect()
  .then(() => {
    console.log('Database connected')
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`)
    })
  })
  .catch((err) => {
    console.error('Failed to connect to database:', err)
    process.exit(1)
  })
