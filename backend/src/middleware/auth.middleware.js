import jwt from 'jsonwebtoken'
import db from '../libs/db.js'

const SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-prod'

export async function authenticate(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token required.' })
  }

  const token = header.slice(7)

  let decoded
  try {
    decoded = jwt.verify(token, SECRET)
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token.' })
  }

  try {
    const user = await db.user.findUnique({
      where:  { id: decoded.id },
      select: { id: true, name: true, loginId: true, email: true, role: true, contactId: true },
    })

    if (!user) {
      return res.status(401).json({ message: 'User no longer exists.' })
    }

    req.user = user
    next()
  } catch (err) {
    console.error('[authenticate]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}
