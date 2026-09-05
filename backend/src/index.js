import 'dotenv/config'
import express from 'express'
import prisma from './db/prisma.js'
import userRoutes from './routes/userRoutes.js'

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello World!')
})

// User routes
app.use('/api/users', userRoutes)

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
