import { verifyToken } from '../utils/jwt.js'

/**
 * Middleware: verify Bearer JWT.
 * On success, attaches decoded payload to req.user.
 * Usage: router.get('/protected', authenticate, handler)
 */
export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access denied. No token provided.' })
  }

  const token = authHeader.split(' ')[1]

  try {
    req.user = verifyToken(token)
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired. Please log in again.' })
    }
    return res.status(401).json({ message: 'Invalid token.' })
  }
}
