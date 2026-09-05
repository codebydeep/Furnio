/**
 * authorize(...roles)
 * Restricts a route to users whose role is in the allowed list.
 * Must be used AFTER authenticate middleware.
 *
 * Usage:
 *   router.get('/contacts', authenticate, authorize('ADMIN', 'ACCOUNTANT'), handler)
 *
 * Or with role group constants:
 *   import { CAN_MANAGE_MASTER } from '../config/roles.js'
 *   router.get('/contacts', authenticate, authorize(...CAN_MANAGE_MASTER), handler)
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

/**
 * authorizeSelf(getOwnerId)
 * Allows ADMIN/ACCOUNTANT through always.
 * Allows CONTACT only if the resource belongs to them.
 *
 * getOwnerId(req) — async function that returns the contactId that owns the resource.
 * If it returns null/undefined the request is denied.
 *
 * Usage (e.g. invoice owned by customer):
 *   router.get('/invoices/:id', authenticate, authorizeSelf(
 *     async (req) => {
 *       const inv = await prisma.customerInvoice.findUnique({
 *         where: { id: req.params.id },
 *         include: { so: true }
 *       })
 *       return inv?.so?.customerId   // contactId of the customer
 *     }
 *   ), handler)
 */
export function authorizeSelf(getOwnerId) {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated.' })
    }

    // ADMIN and ACCOUNTANT always pass
    if (req.user.role === 'ADMIN' || req.user.role === 'ACCOUNTANT') {
      return next()
    }

    // CONTACT — must own the resource
    if (req.user.role === 'CONTACT') {
      try {
        const ownerId = await getOwnerId(req)
        if (!ownerId) {
          return res.status(404).json({ message: 'Resource not found.' })
        }
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
