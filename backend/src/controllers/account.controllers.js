import db from '../libs/db.js'

export async function getAllAccounts(req, res) {
  try {
    const accounts = await db.account.findMany({
      where:   { archived: false },
      include: { defaultForJournals: true },
      orderBy: { name: 'asc' },
    })
    return res.status(200).json(accounts)
  } catch (err) {
    console.error('[getAllAccounts]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function getAccountById(req, res) {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid account ID.' })
    const account = await db.account.findUnique({ where: { id }, include: { defaultForJournals: true } })
    if (!account) return res.status(404).json({ message: 'Account not found.' })
    return res.status(200).json(account)
  } catch (err) {
    console.error('[getAccountById]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function createAccount(req, res) {
  try {
    const { name, type } = req.body
    const account = await db.account.create({ data: { name, type } })
    return res.status(201).json({ message: 'Account created successfully.', account })
  } catch (err) {
    console.error('[createAccount]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function updateAccount(req, res) {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid account ID.' })
    const existing = await db.account.findUnique({ where: { id } })
    if (!existing) return res.status(404).json({ message: 'Account not found.' })

    const { name, type } = req.body
    const data = {}
    if (name !== undefined) data.name = name
    if (type !== undefined) data.type = type

    const account = await db.account.update({ where: { id }, data })
    return res.status(200).json({ message: 'Account updated successfully.', account })
  } catch (err) {
    console.error('[updateAccount]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}
