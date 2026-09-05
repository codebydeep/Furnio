import prisma from '../db/prisma.js'

export async function getAllAnalyticAccounts(req, res) {
  try {
    const accounts = await prisma.analyticAccount.findMany({ orderBy: { createdAt: 'desc' } })
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

    const account = await prisma.analyticAccount.findUnique({ where: { id }, include: { budgets: true } })
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
    const account = await prisma.analyticAccount.create({ data: { name, type } })
    return res.status(201).json({ message: 'Analytic account created successfully.', account })
  } catch (err) {
    console.error('[createAnalyticAccount]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function updateAnalyticAccount(req, res) {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid analytic account ID.' })

    const existing = await prisma.analyticAccount.findUnique({ where: { id } })
    if (!existing) return res.status(404).json({ message: 'Analytic account not found.' })

    const { name, type } = req.body
    const data = {}
    if (name !== undefined) data.name = name
    if (type !== undefined) data.type = type

    const account = await prisma.analyticAccount.update({ where: { id }, data })
    return res.status(200).json({ message: 'Analytic account updated successfully.', account })
  } catch (err) {
    console.error('[updateAnalyticAccount]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function deleteAnalyticAccount(req, res) {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid analytic account ID.' })

    const existing = await prisma.analyticAccount.findUnique({ where: { id } })
    if (!existing) return res.status(404).json({ message: 'Analytic account not found.' })

    await prisma.analyticAccount.delete({ where: { id } })
    return res.status(200).json({ message: 'Analytic account deleted successfully.' })
  } catch (err) {
    console.error('[deleteAnalyticAccount]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}
