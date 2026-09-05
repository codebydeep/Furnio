import db from '../libs/db.js'

export async function getAllAnalyticAccounts(req, res) {
  try {
    const accounts = await db.analyticAccount.findMany({ orderBy: { createdAt: 'desc' } })
    return res.status(200).json(accounts)
  } catch (err) {
    console.error('[getAllAnalyticAccounts]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function getAnalyticAccountById(req, res) {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid analytic account ID.' })

    const account = await db.analyticAccount.findUnique({ where: { id } })
    if (!account) return res.status(404).json({ message: 'Analytic account not found.' })
    return res.status(200).json(account)
  } catch (err) {
    console.error('[getAnalyticAccountById]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function createAnalyticAccount(req, res) {
  try {
    const { name, type } = req.body
    const account = await db.analyticAccount.create({ data: { name, type } })
    return res.status(201).json({ message: 'Analytic account created.', account })
  } catch (err) {
    console.error('[createAnalyticAccount]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function updateAnalyticAccount(req, res) {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid analytic account ID.' })

    const existing = await db.analyticAccount.findUnique({ where: { id } })
    if (!existing) return res.status(404).json({ message: 'Analytic account not found.' })

    const { name, type } = req.body
    const data = {}
    if (name !== undefined) data.name = name
    if (type !== undefined) data.type = type

    const account = await db.analyticAccount.update({ where: { id }, data })
    return res.status(200).json({ message: 'Analytic account updated.', account })
  } catch (err) {
    console.error('[updateAnalyticAccount]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}
