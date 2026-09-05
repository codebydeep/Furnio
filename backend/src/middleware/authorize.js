/**
 * Middleware factory: restrict route to specific roles.
 * Must be used AFTER authenticate middleware.
 *
 * Usage:
 *   router.delete('/users/:id', authenticate, authorize('ADMIN'), handler)
 *   router.get('/reports',      authenticate, authorize('ADMIN', 'ACCOUNTANT'), handler)
 */
export function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated.' })
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}.`,
      })
    }

    next()
  }
}
