import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'
import prisma from '../db/prisma.js'
import { signToken } from '../utils/jwt.js'

const SALT_ROUNDS = 10

/** Strip password before sending user to client */
function sanitize(user) {
  const { password, ...safe } = user
  return safe
}

/**
 * Auto-generate a unique loginId from the email prefix.
 * Format: first 6 chars of email local part + 4 random hex chars
 * e.g. deepan@example.com → "deepan3f2a"
 */
async function generateLoginId(email) {
  const prefix = email.split('@')[0].slice(0, 6).toLowerCase().replace(/[^a-z0-9]/g, '')
  const padded = prefix.padEnd(4, 'x')

  for (let attempt = 0; attempt < 5; attempt++) {
    const suffix = randomBytes(2).toString('hex')
    const loginId = (padded + suffix).slice(0, 12)
    const exists = await prisma.user.findUnique({ where: { loginId } })
    if (!exists) return loginId
  }

  return randomBytes(5).toString('hex')
}

// ---------------------------------------------------------------------------
// POST /api/auth/register
// Body: { email, password, role, contactId? }
// ---------------------------------------------------------------------------
export async function register(req, res) {
  try {
    const { email, password, role, contactId } = req.body

    const existingEmail = await prisma.user.findUnique({ where: { email } })
    if (existingEmail) {
      return res.status(409).json({ message: 'A user with that email already exists.' })
    }

    if (role === 'CONTACT') {
      if (!contactId) {
        return res.status(400).json({ message: 'contactId is required for CONTACT role.' })
      }
      const contact = await prisma.contact.findUnique({ where: { id: contactId } })
      if (!contact) {
        return res.status(404).json({ message: 'Contact not found.' })
      }
      const linked = await prisma.user.findUnique({ where: { contactId } })
      if (linked) {
        return res.status(409).json({ message: 'This contact already has a linked user account.' })
      }
    }

    const [hashed, loginId] = await Promise.all([
      bcrypt.hash(password, SALT_ROUNDS),
      generateLoginId(email),
    ])

    const user = await prisma.user.create({
      data: {
        loginId,
        email,
        password: hashed,
        role,
        contactId: role === 'CONTACT' ? contactId : null,
      },
    })

    const token = signToken(user)

    return res.status(201).json({
      message: 'User registered successfully.',
      token,
      user: sanitize(user),
    })
  } catch (err) {
    console.error('[register]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

// ---------------------------------------------------------------------------
// POST /api/auth/login
// Body: { email, password }
// ---------------------------------------------------------------------------
export async function login(req, res) {
  try {
    const { email, password } = req.body

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' })
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return res.status(401).json({ message: 'Invalid email or password.' })
    }

    const token = signToken(user)

    return res.status(200).json({
      message: 'Login successful.',
      token,
      user: sanitize(user),
    })
  } catch (err) {
    console.error('[login]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

// ---------------------------------------------------------------------------
// GET /api/auth/me  — get own profile
// ---------------------------------------------------------------------------
export async function me(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { contact: true },
    })

    if (!user) {
      return res.status(404).json({ message: 'User not found.' })
    }

    return res.status(200).json(sanitize(user))
  } catch (err) {
    console.error('[me]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

// ---------------------------------------------------------------------------
// GET /api/auth/users  — list all users (ADMIN only)
// ---------------------------------------------------------------------------
export async function getAllUsers(req, res) {
  try {
    const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } })
    return res.status(200).json(users.map(sanitize))
  } catch (err) {
    console.error('[getAllUsers]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

// ---------------------------------------------------------------------------
// GET /api/auth/users/:id  — get user by id (ADMIN only)
// ---------------------------------------------------------------------------
export async function getUserById(req, res) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } })
    if (!user) {
      return res.status(404).json({ message: 'User not found.' })
    }
    return res.status(200).json(sanitize(user))
  } catch (err) {
    console.error('[getUserById]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

// ---------------------------------------------------------------------------
// PATCH /api/auth/users/:id  — update user (ADMIN only)
// Body: { email?, password?, role? }
// ---------------------------------------------------------------------------
export async function updateUser(req, res) {
  try {
    const { id } = req.params
    const { email, password, role } = req.body

    const existing = await prisma.user.findUnique({ where: { id } })
    if (!existing) {
      return res.status(404).json({ message: 'User not found.' })
    }

    if (email && email !== existing.email) {
      const conflict = await prisma.user.findUnique({ where: { email } })
      if (conflict) {
        return res.status(409).json({ message: 'Email is already in use by another account.' })
      }
    }

    const data = {}
    if (email)    data.email    = email
    if (role)     data.role     = role
    if (password) data.password = await bcrypt.hash(password, SALT_ROUNDS)

    const updated = await prisma.user.update({ where: { id }, data })
    return res.status(200).json({ message: 'User updated successfully.', user: sanitize(updated) })
  } catch (err) {
    console.error('[updateUser]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

// ---------------------------------------------------------------------------
// PATCH /api/auth/users/:id/role  — change a user's role (ADMIN only)
// Body: { role }
// Rules:
//   - Cannot change your own role (prevent self-lockout)
//   - Changing TO CONTACT requires a contactId on the user
//   - Changing FROM CONTACT clears contactId
// ---------------------------------------------------------------------------
export async function changeRole(req, res) {
  try {
    const { id } = req.params
    const { role } = req.body

    // Prevent self role-change
    if (id === req.user.id) {
      return res.status(403).json({ message: 'You cannot change your own role.' })
    }

    const existing = await prisma.user.findUnique({ where: { id } })
    if (!existing) {
      return res.status(404).json({ message: 'User not found.' })
    }

    if (existing.role === role) {
      return res.status(400).json({ message: `User already has the role: ${role}.` })
    }

    // Changing TO CONTACT requires contactId to be set on the user
    if (role === 'CONTACT' && !existing.contactId) {
      return res.status(400).json({
        message: 'Cannot assign CONTACT role — user has no linked contactId. Update the user with a contactId first.',
      })
    }

    const data = { role }

    // Changing FROM CONTACT → clear contactId
    if (existing.role === 'CONTACT' && role !== 'CONTACT') {
      data.contactId = null
    }

    const updated = await prisma.user.update({ where: { id }, data })

    return res.status(200).json({
      message: `Role updated to ${role} successfully.`,
      user: sanitize(updated),
    })
  } catch (err) {
    console.error('[changeRole]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/auth/users/:id  — delete user (ADMIN only)
// ---------------------------------------------------------------------------
export async function deleteUser(req, res) {
  try {
    const { id } = req.params

    const existing = await prisma.user.findUnique({ where: { id } })
    if (!existing) {
      return res.status(404).json({ message: 'User not found.' })
    }

    await prisma.user.delete({ where: { id } })
    return res.status(200).json({ message: 'User deleted successfully.' })
  } catch (err) {
    console.error('[deleteUser]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}
