import jwt from 'jsonwebtoken'

const SECRET     = process.env.JWT_SECRET
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

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

export function verifyToken(token) {
  return jwt.verify(token, SECRET)
}
