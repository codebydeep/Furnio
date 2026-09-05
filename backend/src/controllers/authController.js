import bcrypt from 'bcryptjs'
import prisma from '../db/prisma.js'
import { signToken } from '../utils/jwt.js'

const SALT_ROUNDS = 10

function sanitize(user) {
  const { password, ...safe } = user
  return safe
}

export async function register(req, res) {
  try {
    const { name, loginId, email, password } = req.body

    const existingLoginId = await prisma.user.findUnique({ where: { loginId } })
    if (existingLoginId) return res.status(409).json({ message: 'Login ID is already taken.' })

    const existingEmail = await prisma.user.findUnique({ where: { email } })
    if (existingEmail) return res.status(409).json({ message: 'A user with that email already exists.' })

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

    const user = await prisma.user.create({
      data: { name, loginId, email, password: hashedPassword, role: 'ADMIN' },
    })

    const token = signToken(user)
    return res.status(201).json({ message: 'Business Owner registered successfully.', token, user: sanitize(user) })
  } catch (err) {
    console.error('[register]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function login(req, res) {
  try {
    const { loginId, password } = req.body

    const user = await prisma.user.findUnique({ where: { loginId } })
    if (!user) return res.status(401).json({ message: 'Invalid login ID or password.' })

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return res.status(401).json({ message: 'Invalid login ID or password.' })

    const token = signToken(user)
    return res.status(200).json({ message: 'Login successful.', token, user: sanitize(user) })
  } catch (err) {
    console.error('[login]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function me(req, res) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id }, include: { contact: true } })
    if (!user) return res.status(404).json({ message: 'User not found.' })
    return res.status(200).json(sanitize(user))
  } catch (err) {
    console.error('[me]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function getAllUsers(req, res) {
  try {
    const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } })
    return res.status(200).json(users.map(sanitize))
  } catch (err) {
    console.error('[getAllUsers]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function getUserById(req, res) {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid user ID.' })

    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) return res.status(404).json({ message: 'User not found.' })
    return res.status(200).json(sanitize(user))
  } catch (err) {
    console.error('[getUserById]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function createUser(req, res) {
  try {
    const { name, loginId, email, password, role, contactId } = req.body

    const existingLoginId = await prisma.user.findUnique({ where: { loginId } })
    if (existingLoginId) return res.status(409).json({ message: 'Login ID is already taken.' })

    const existingEmail = await prisma.user.findUnique({ where: { email } })
    if (existingEmail) return res.status(409).json({ message: 'A user with that email already exists.' })

    if (role === 'USER') {
      if (!contactId) return res.status(400).json({ message: 'contactId is required for USER role.' })
      const contact = await prisma.contact.findUnique({ where: { id: contactId } })
      if (!contact) return res.status(404).json({ message: 'Contact not found.' })
      const alreadyLinked = await prisma.user.findUnique({ where: { contactId } })
      if (alreadyLinked) return res.status(409).json({ message: 'This contact already has a linked user account.' })
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

    const user = await prisma.user.create({
      data: {
        name, loginId, email,
        password: hashedPassword,
        role,
        contactId: role === 'USER' && contactId ? contactId : null,
      },
    })

    return res.status(201).json({ message: 'User created successfully.', user: sanitize(user) })
  } catch (err) {
    console.error('[createUser]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function updateUser(req, res) {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid user ID.' })

    const { name, email, password } = req.body

    const existing = await prisma.user.findUnique({ where: { id } })
    if (!existing) return res.status(404).json({ message: 'User not found.' })

    if (email && email !== existing.email) {
      const conflict = await prisma.user.findUnique({ where: { email } })
      if (conflict) return res.status(409).json({ message: 'Email is already in use by another account.' })
    }

    const data = {}
    if (name)     data.name     = name
    if (email)    data.email    = email
    if (password) data.password = await bcrypt.hash(password, SALT_ROUNDS)

    const updated = await prisma.user.update({ where: { id }, data })
    return res.status(200).json({ message: 'User updated successfully.', user: sanitize(updated) })
  } catch (err) {
    console.error('[updateUser]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function changeRole(req, res) {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid user ID.' })

    const { role } = req.body

    if (id === req.user.id) return res.status(403).json({ message: 'You cannot change your own role.' })

    const existing = await prisma.user.findUnique({ where: { id } })
    if (!existing) return res.status(404).json({ message: 'User not found.' })
    if (existing.role === role) return res.status(400).json({ message: `User already has the role: ${role}.` })

    if (role === 'USER' && !existing.contactId) {
      return res.status(400).json({ message: 'Cannot assign USER role — user has no linked contactId.' })
    }

    const data = { role }
    if (existing.role === 'USER' && role !== 'USER') data.contactId = null

    const updated = await prisma.user.update({ where: { id }, data })
    return res.status(200).json({ message: `Role updated to ${role} successfully.`, user: sanitize(updated) })
  } catch (err) {
    console.error('[changeRole]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function deleteUser(req, res) {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid user ID.' })
    if (id === req.user.id) return res.status(403).json({ message: 'You cannot delete your own account.' })

    const existing = await prisma.user.findUnique({ where: { id } })
    if (!existing) return res.status(404).json({ message: 'User not found.' })

    await prisma.user.delete({ where: { id } })
    return res.status(200).json({ message: 'User deleted successfully.' })
  } catch (err) {
    console.error('[deleteUser]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}
