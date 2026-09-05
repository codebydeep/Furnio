import prisma from '../db/prisma.js'

export async function createAccount(req, res) {
  try {
    const { name, type } = req.body

    const existing = await prisma.account.findFirst({ where: { name, type } })
    if (existing) {
      return res.status(409).json({ message: `An account named "${name}" of type ${type} already exists.` })
    }

    const account = await prisma.account.create({ data: { name, type } })

    return res.status(201).json({ message: 'Account created successfully.', account })
  } catch (err) {
    console.error('[createAccount]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function getAllAccounts(req, res) {
  try {
    const { type, archived } = req.query

    const where = {}
    if (type)                where.type     = type
    if (archived === 'true') where.archived = true
    else                     where.archived = false

    const accounts = await prisma.account.findMany({
      where,
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
    })

    return res.status(200).json(accounts)
  } catch (err) {
    console.error('[getAllAccounts]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function getAccountById(req, res) {
  try {
    const account = await prisma.account.findUnique({ where: { id: req.params.id } })

    if (!account) {
      return res.status(404).json({ message: 'Account not found.' })
    }

    return res.status(200).json(account)
  } catch (err) {
    console.error('[getAccountById]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function updateAccount(req, res) {
  try {
    const { id } = req.params

    const existing = await prisma.account.findUnique({ where: { id } })
    if (!existing) {
      return res.status(404).json({ message: 'Account not found.' })
    }
    if (existing.archived) {
      return res.status(400).json({ message: 'Cannot update an archived account.' })
    }

    const account = await prisma.account.update({
      where: { id },
      data: req.body,
    })

    return res.status(200).json({ message: 'Account updated successfully.', account })
  } catch (err) {
    console.error('[updateAccount]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function archiveAccount(req, res) {
  try {
    const { id } = req.params

    const existing = await prisma.account.findUnique({ where: { id } })
    if (!existing) {
      return res.status(404).json({ message: 'Account not found.' })
    }
    if (existing.archived) {
      return res.status(400).json({ message: 'Account is already archived.' })
    }

    const account = await prisma.account.update({
      where: { id },
      data: { archived: true },
    })

    return res.status(200).json({ message: 'Account archived successfully.', account })
  } catch (err) {
    console.error('[archiveAccount]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function unarchiveAccount(req, res) {
  try {
    const { id } = req.params

    const existing = await prisma.account.findUnique({ where: { id } })
    if (!existing) {
      return res.status(404).json({ message: 'Account not found.' })
    }
    if (!existing.archived) {
      return res.status(400).json({ message: 'Account is not archived.' })
    }

    const account = await prisma.account.update({
      where: { id },
      data: { archived: false },
    })

    return res.status(200).json({ message: 'Account restored successfully.', account })
  } catch (err) {
    console.error('[unarchiveAccount]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}
