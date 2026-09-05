import jwt from 'jsonwebtoken'

export function authenticate(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token required.' })
  }

  const token  = header.slice(7)
  const secret = process.env.JWT_SECRET || 'dev-secret-change-in-prod'

  try {
    req.user = jwt.verify(token, secret)
    next()
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token.' })
  }
}
