import { createHash, randomBytes, timingSafeEqual } from 'crypto'
import jwt from 'jsonwebtoken'
import prisma from '../db/prisma.js'

/* ── helpers ─────────────────────────────────────────────────── */
function hashPassword(plain) {
  const salt = randomBytes(16).toString('hex')
  const hash = createHash('sha256').update(salt + plain).digest('hex')
  return `${salt}:${hash}`
}

function verifyPassword(plain, stored) {
  const [salt, storedHash] = stored.split(':')
  if (!salt || !storedHash) return false
  const attemptHash = createHash('sha256').update(salt + plain).digest('hex')
  return timingSafeEqual(Buffer.from(storedHash, 'hex'), Buffer.from(attemptHash, 'hex'))
}

/** Strip password before sending to client */
function sanitize(user) {
  const { password, ...safe } = user
  return safe
}

/**
 * Sign a JWT containing { id, email, role }.
 * Secret + expiry come from env vars with safe fallbacks.
 */
function signToken(user) {
  const secret  = process.env.JWT_SECRET  || 'dev-secret-change-in-prod'
  const expires = process.env.JWT_EXPIRES_IN || '7d'
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    secret,
    { expiresIn: expires }
  )
}


export async function registerUser(req, res) {
  try {
    const { name, email, password, role, image } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return res.status(409).json({ message: 'A user with that email already exists.' })
    }

    
    const allowedRoles = ['admin', 'accountant', 'contact']
    const assignedRole = allowedRoles.includes(role) ? role : 'accountant'

    const user = await prisma.user.create({
      data: {
        name:     name  ?? null,
        email,
        password: hashPassword(password),
        role:     assignedRole,
        image:    image ?? null,
      },
    })

    const token = signToken(user)

    return res.status(201).json({
      message: 'User registered successfully.',
      token,
      user: sanitize(user),
    })
  } catch (err) {
    console.error('[registerUser]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

/* ── LOGIN ───────────────────────────────────────────────────── */
export async function loginUser(req, res) {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !verifyPassword(password, user.password)) {
      return res.status(401).json({ message: 'Invalid email or password.' })
    }

    const token = signToken(user)

    return res.status(200).json({
      message: 'Login successful.',
      token,
      user: sanitize(user),
    })
  } catch (err) {
    console.error('[loginUser]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

/* ── GET ALL USERS (admin only — enforced in route) ─────────── */
export async function getAllUsers(req, res) {
  try {
    const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } })
    return res.status(200).json(users.map(sanitize))
  } catch (err) {
    console.error('[getAllUsers]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

/* ── GET BY ID ───────────────────────────────────────────────── */
export async function getUserById(req, res) {
  try {
    const { id } = req.params
    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) return res.status(404).json({ message: 'User not found.' })
    return res.status(200).json(sanitize(user))
  } catch (err) {
    console.error('[getUserById]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

/* ── UPDATE ──────────────────────────────────────────────────── */
export async function updateUser(req, res) {
  try {
    const { id } = req.params
    const { name, email, image, password, role } = req.body

    const existing = await prisma.user.findUnique({ where: { id } })
    if (!existing) return res.status(404).json({ message: 'User not found.' })

    if (email && email !== existing.email) {
      const conflict = await prisma.user.findUnique({ where: { email } })
      if (conflict) return res.status(409).json({ message: 'Email is already in use.' })
    }

    const data = {}
    if (name  !== undefined) data.name  = name
    if (email !== undefined) data.email = email
    if (image !== undefined) data.image = image
    if (role  !== undefined) {
      const allowedRoles = ['admin', 'accountant', 'contact']
      if (allowedRoles.includes(role)) data.role = role
    }
    if (password) data.password = hashPassword(password)

    const updated = await prisma.user.update({ where: { id }, data })
    return res.status(200).json({ message: 'User updated successfully.', user: sanitize(updated) })
  } catch (err) {
    console.error('[updateUser]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

/* ── DELETE ──────────────────────────────────────────────────── */
export async function deleteUser(req, res) {
  try {
    const { id } = req.params
    const existing = await prisma.user.findUnique({ where: { id } })
    if (!existing) return res.status(404).json({ message: 'User not found.' })
    await prisma.user.delete({ where: { id } })
    return res.status(200).json({ message: 'User deleted successfully.' })
  } catch (err) {
    console.error('[deleteUser]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

/* ── ME (get current user from token) ───────────────────────── */
export async function getMe(req, res) {
  try {
    // req.user set by authenticate middleware
    const user = await prisma.user.findUnique({ where: { id: req.user.id } })
    if (!user) return res.status(404).json({ message: 'User not found.' })
    return res.status(200).json(sanitize(user))
  } catch (err) {
    console.error('[getMe]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}
