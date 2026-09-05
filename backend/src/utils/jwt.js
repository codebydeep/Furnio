import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

/**
 * Sign a JWT for the given user.
 * Payload: { id, email, role }
 */
export function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
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
