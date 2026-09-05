export function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated.' })
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: `Access denied. Required role: ${allowedRoles.join(' or ')}.` })
    }
    next()
  }
}

export function authorizeSelf(getOwnerId) {
  return async (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated.' })

    if (req.user.role === 'ADMIN' || req.user.role === 'ACCOUNTANT') return next()

    if (req.user.role === 'USER') {
      try {
        const ownerId = await getOwnerId(req)
        if (!ownerId) return res.status(404).json({ message: 'Resource not found.' })
        if (ownerId !== req.user.contactId) {
          return res.status(403).json({ message: 'Access denied. This resource does not belong to you.' })
        }
        return next()
      } catch (err) {
        console.error('[authorizeSelf]', err)
        return res.status(500).json({ message: 'Internal server error.' })
      }
    }

    return res.status(403).json({ message: 'Access denied.' })
  }
}
