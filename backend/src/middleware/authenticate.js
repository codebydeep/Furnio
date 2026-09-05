import jwt from 'jsonwebtoken'

/**
 * Verifies the Bearer JWT in the Authorization header.
 * On success, attaches { id, email, role } to req.user.
 */
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

/**
 * Restricts a route to users whose role is in the allowed list.
 * Must be used AFTER authenticate().
 *
 * Usage:  router.get('/admin', authenticate, authorize('admin'), handler)
 */
export function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({ message: 'You do not have permission to perform this action.' })
    }
    next()
  }
}
