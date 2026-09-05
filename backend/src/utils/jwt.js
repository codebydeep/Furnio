import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

/**
 * Sign a JWT for the given user.
 * Payload: { id, email, role, contactId }
 * contactId is included so CONTACT users can be ownership-checked
 * in authorizeSelf middleware without an extra DB lookup.
 */
export function signToken(user) {
  return jwt.sign(
    {
      id:        user.id,
      email:     user.email,
      role:      user.role,
      contactId: user.contactId ?? null,
    },
    SECRET,
    { expiresIn: EXPIRES_IN }
  )
}

/**
 * Verify and decode a JWT.
 * Throws if invalid or expired.
 */
export function verifyToken(token) {
  return jwt.verify(token, SECRET)
}
