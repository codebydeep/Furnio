import bcrypt from 'bcryptjs'
import db from '../libs/db.js'
import { signToken } from '../utils/jwt.js'

const SALT_ROUNDS = 10

// Strip password before sending to client
function sanitize(user) {
  const { password, ...safe } = user
  return safe
}

// ── REGISTER ─────────────────────────────────────────────────────────────────
// Used for:
//   1. Initial sign-up (Business Owner → role ADMIN)
//   2. Admin creating Accountant/Contact users from the dashboard

export async function register(req, res) {
  try {
    const { name, loginId, email, password, role, contactId } = req.body

    // Check loginId uniqueness
    const existingLoginId = await db.user.findUnique({ where: { loginId } })
    if (existingLoginId) {
      return res.status(409).json({ message: 'Login ID is already taken.' })
    }

    // Check email uniqueness
    const existingEmail = await db.user.findUnique({ where: { email } })
    if (existingEmail) {
      return res.status(409).json({ message: 'A user with that email already exists.' })
    }

    // CONTACT role requires a valid, unlinked contactId
    if (role === 'CONTACT') {
      if (!contactId) {
        return res.status(400).json({ message: 'contactId is required for CONTACT role.' })
      }
      const contact = await db.contact.findUnique({ where: { id: contactId } })
      if (!contact) {
        return res.status(404).json({ message: 'Contact not found.' })
      }
      const linked = await db.user.findUnique({ where: { contactId } })
      if (linked) {
        return res.status(409).json({ message: 'This contact already has a linked user account.' })
      }
    }

    const hashed = await bcrypt.hash(password, SALT_ROUNDS)

    const user = await db.user.create({
      data: {
        name,
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

// ── LOGIN ─────────────────────────────────────────────────────────────────────
// Accepts loginId OR email as `identifier` field.

export async function login(req, res) {
  try {
    const { identifier, password } = req.body

    // Determine if identifier looks like an email
    const isEmail = identifier.includes('@')

    const user = isEmail
      ? await db.user.findUnique({ where: { email: identifier } })
      : await db.user.findUnique({ where: { loginId: identifier } })

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' })
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return res.status(401).json({ message: 'Invalid credentials.' })
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

// ── ME ────────────────────────────────────────────────────────────────────────
// Returns the current authenticated user (with linked contact if CONTACT role).

export async function me(req, res) {
  try {
    const user = await db.user.findUnique({
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

// ── GET ALL USERS ─────────────────────────────────────────────────────────────

export async function getAllUsers(req, res) {
  try {
    const users = await db.user.findMany({ orderBy: { createdAt: 'desc' } })
    return res.status(200).json(users.map(sanitize))
  } catch (err) {
    console.error('[getAllUsers]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

// ── GET USER BY ID ────────────────────────────────────────────────────────────

export async function getUserById(req, res) {
  try {
    const user = await db.user.findUnique({
      where:   { id: req.params.id },
      include: { contact: true },
    })
    if (!user) {
      return res.status(404).json({ message: 'User not found.' })
    }
    return res.status(200).json(sanitize(user))
  } catch (err) {
    console.error('[getUserById]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

// ── UPDATE USER ───────────────────────────────────────────────────────────────
// Admin can update name, email, password of any user.

export async function updateUser(req, res) {
  try {
    const { id } = req.params
    const { name, email, password } = req.body

    const existing = await db.user.findUnique({ where: { id } })
    if (!existing) {
      return res.status(404).json({ message: 'User not found.' })
    }

    if (email && email !== existing.email) {
      const conflict = await db.user.findUnique({ where: { email } })
      if (conflict) {
        return res.status(409).json({ message: 'Email is already in use by another account.' })
      }
    }

    const data = {}
    if (name)     data.name     = name
    if (email)    data.email    = email
    if (password) data.password = await bcrypt.hash(password, SALT_ROUNDS)

    const updated = await db.user.update({ where: { id }, data })
    return res.status(200).json({ message: 'User updated successfully.', user: sanitize(updated) })
  } catch (err) {
    console.error('[updateUser]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

// ── CHANGE ROLE ───────────────────────────────────────────────────────────────

export async function changeRole(req, res) {
  try {
    const { id }  = req.params
    const { role } = req.body

    if (id === req.user.id) {
      return res.status(403).json({ message: 'You cannot change your own role.' })
    }

    const existing = await db.user.findUnique({ where: { id } })
    if (!existing) {
      return res.status(404).json({ message: 'User not found.' })
    }

    if (existing.role === role) {
      return res.status(400).json({ message: `User already has the role: ${role}.` })
    }

    if (role === 'CONTACT' && !existing.contactId) {
      return res.status(400).json({
        message: 'Cannot assign CONTACT role — user has no linked contactId. Update the user with a contactId first.',
      })
    }

    const data = { role }
    // If moving away from CONTACT, unlink the contact
    if (existing.role === 'CONTACT' && role !== 'CONTACT') {
      data.contactId = null
    }

    const updated = await db.user.update({ where: { id }, data })
    return res.status(200).json({
      message: `Role updated to ${role} successfully.`,
      user:    sanitize(updated),
    })
  } catch (err) {
    console.error('[changeRole]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

// ── DELETE USER ───────────────────────────────────────────────────────────────

export async function deleteUser(req, res) {
  try {
    const { id } = req.params

    const existing = await db.user.findUnique({ where: { id } })
    if (!existing) {
      return res.status(404).json({ message: 'User not found.' })
    }

    await db.user.delete({ where: { id } })
    return res.status(200).json({ message: 'User deleted successfully.' })
  } catch (err) {
    console.error('[deleteUser]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}
