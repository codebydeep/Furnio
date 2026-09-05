import prisma from '../db/prisma.js'

export async function getAllBudgets(req, res) {
  try {
    const budgets = await prisma.budget.findMany({
      include: { analyticAccount: true },
      orderBy: { createdAt: 'desc' },
    })
    return res.status(200).json(budgets)
  } catch (err) {
    console.error('[getAllBudgets]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function getBudgetById(req, res) {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid budget ID.' })

    const budget = await prisma.budget.findUnique({ where: { id }, include: { analyticAccount: true } })
    if (!budget) return res.status(404).json({ message: 'Budget not found.' })
    return res.status(200).json(budget)
  } catch (err) {
    console.error('[getBudgetById]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function createBudget(req, res) {
  try {
    const { name, periodStart, periodEnd, plannedAmount, responsiblePerson, analyticAccountId } = req.body

    const analyticAccount = await prisma.analyticAccount.findUnique({ where: { id: analyticAccountId } })
    if (!analyticAccount) return res.status(404).json({ message: 'Analytic account not found.' })

    const budget = await prisma.budget.create({
      data: {
        name,
        periodStart:       new Date(periodStart),
        periodEnd:         new Date(periodEnd),
        plannedAmount,
        responsiblePerson,
        analyticAccountId,
      },
      include: { analyticAccount: true },
    })
    return res.status(201).json({ message: 'Budget created successfully.', budget })
  } catch (err) {
    console.error('[createBudget]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function updateBudget(req, res) {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid budget ID.' })

    const existing = await prisma.budget.findUnique({ where: { id } })
    if (!existing) return res.status(404).json({ message: 'Budget not found.' })

    const { name, periodStart, periodEnd, plannedAmount, responsiblePerson, analyticAccountId } = req.body
    const data = {}
    if (name              !== undefined) data.name              = name
    if (periodStart       !== undefined) data.periodStart       = new Date(periodStart)
    if (periodEnd         !== undefined) data.periodEnd         = new Date(periodEnd)
    if (plannedAmount     !== undefined) data.plannedAmount     = plannedAmount
    if (responsiblePerson !== undefined) data.responsiblePerson = responsiblePerson
    if (analyticAccountId !== undefined) data.analyticAccountId = analyticAccountId

    const budget = await prisma.budget.update({ where: { id }, data, include: { analyticAccount: true } })
    return res.status(200).json({ message: 'Budget updated successfully.', budget })
  } catch (err) {
    console.error('[updateBudget]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function deleteBudget(req, res) {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid budget ID.' })

    const existing = await prisma.budget.findUnique({ where: { id } })
    if (!existing) return res.status(404).json({ message: 'Budget not found.' })

    await prisma.budget.delete({ where: { id } })
    return res.status(200).json({ message: 'Budget deleted successfully.' })
  } catch (err) {
    console.error('[deleteBudget]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}
