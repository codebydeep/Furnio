import db from '../libs/db.js'

const BUDGET_INCLUDE = {
  analyticAccount: true,
  account:         true,
  lines:           true,
}

export async function getAllBudgets(req, res) {
  try {
    const budgets = await db.budget.findMany({
      include: BUDGET_INCLUDE,
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

    const budget = await db.budget.findUnique({ where: { id }, include: BUDGET_INCLUDE })
    if (!budget) return res.status(404).json({ message: 'Budget not found.' })
    return res.status(200).json(budget)
  } catch (err) {
    console.error('[getBudgetById]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function createBudget(req, res) {
  try {
    const {
      name, budgetType, periodStart, periodEnd,
      responsiblePerson, analyticAccountId, accountId, lines,
    } = req.body

    const aa = await db.analyticAccount.findUnique({ where: { id: analyticAccountId } })
    if (!aa) return res.status(404).json({ message: 'Analytic account not found.' })

    if (accountId) {
      const acc = await db.account.findUnique({ where: { id: accountId } })
      if (!acc) return res.status(404).json({ message: 'Account not found.' })
    }

    const budget = await db.budget.create({
      data: {
        name,
        budgetType:        budgetType ?? 'Project Budget',
        periodStart:       new Date(periodStart),
        periodEnd:         new Date(periodEnd),
        responsiblePerson,
        analyticAccountId,
        accountId:         accountId ?? null,
        lines: lines?.length
          ? {
              create: lines.map(l => ({
                startDate:       new Date(l.startDate),
                endDate:         new Date(l.endDate),
                committedAmount: l.committedAmount,
                allocatedAmount: l.allocatedAmount,
              })),
            }
          : undefined,
      },
      include: BUDGET_INCLUDE,
    })
    return res.status(201).json({ message: 'Budget created.', budget })
  } catch (err) {
    console.error('[createBudget]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function updateBudget(req, res) {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid budget ID.' })

    const existing = await db.budget.findUnique({ where: { id } })
    if (!existing) return res.status(404).json({ message: 'Budget not found.' })
    if (existing.status === 'DONE') return res.status(400).json({ message: 'Cannot edit a DONE budget.' })

    const {
      name, budgetType, periodStart, periodEnd,
      responsiblePerson, analyticAccountId, accountId,
    } = req.body
    const data = {}
    if (name              !== undefined) data.name              = name
    if (budgetType        !== undefined) data.budgetType        = budgetType
    if (periodStart       !== undefined) data.periodStart       = new Date(periodStart)
    if (periodEnd         !== undefined) data.periodEnd         = new Date(periodEnd)
    if (responsiblePerson !== undefined) data.responsiblePerson = responsiblePerson
    if (analyticAccountId !== undefined) data.analyticAccountId = analyticAccountId
    if (accountId         !== undefined) data.accountId         = accountId

    const budget = await db.budget.update({ where: { id }, data, include: BUDGET_INCLUDE })
    return res.status(200).json({ message: 'Budget updated.', budget })
  } catch (err) {
    console.error('[updateBudget]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function confirmBudget(req, res) {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid budget ID.' })

    const existing = await db.budget.findUnique({ where: { id } })
    if (!existing) return res.status(404).json({ message: 'Budget not found.' })
    if (existing.status !== 'DRAFT') return res.status(400).json({ message: 'Budget must be in DRAFT to confirm.' })

    const budget = await db.budget.update({
      where: { id },
      data:  { status: 'CONFIRMED' },
      include: BUDGET_INCLUDE,
    })
    return res.status(200).json({ message: 'Budget confirmed.', budget })
  } catch (err) {
    console.error('[confirmBudget]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function reviseBudget(req, res) {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid budget ID.' })

    const existing = await db.budget.findUnique({ where: { id } })
    if (!existing) return res.status(404).json({ message: 'Budget not found.' })
    if (existing.status !== 'CONFIRMED') return res.status(400).json({ message: 'Budget must be CONFIRMED to revise.' })

    const budget = await db.budget.update({
      where: { id },
      data:  { status: 'REVISED' },
      include: BUDGET_INCLUDE,
    })
    return res.status(200).json({ message: 'Budget set to REVISED.', budget })
  } catch (err) {
    console.error('[reviseBudget]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function markBudgetDone(req, res) {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid budget ID.' })

    const existing = await db.budget.findUnique({ where: { id } })
    if (!existing) return res.status(404).json({ message: 'Budget not found.' })

    const budget = await db.budget.update({
      where: { id },
      data:  { status: 'DONE' },
      include: BUDGET_INCLUDE,
    })
    return res.status(200).json({ message: 'Budget marked as DONE.', budget })
  } catch (err) {
    console.error('[markBudgetDone]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

/**
 * GET /api/budgets/:id/report
 *
 * Returns Committed vs Allocated vs Actual-from-ledger.
 * Actuals are pulled live from posted JournalItems tagged with this budget's analyticAccount.
 */
export async function getBudgetReport(req, res) {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid budget ID.' })

    const budget = await db.budget.findUnique({ where: { id }, include: { ...BUDGET_INCLUDE } })
    if (!budget) return res.status(404).json({ message: 'Budget not found.' })

    // Pull actuals from posted journal items for this analytic account
    const journalItems = await db.journalItem.findMany({
      where: {
        analyticAccountId: budget.analyticAccountId,
        journalEntry:      { status: 'POSTED' },
      },
    })

    const actualIncome  = journalItems.reduce((s, i) => s + Number(i.credit) - Number(i.debit),  0)
    const actualExpense = journalItems.reduce((s, i) => s + Number(i.debit)  - Number(i.credit), 0)
    const actual = budget.analyticAccount?.type === 'INCOME' ? actualIncome : Math.max(actualExpense, 0)

    const totalCommitted  = budget.lines.reduce((s, l) => s + Number(l.committedAmount),  0)
    const totalAllocated  = budget.lines.reduce((s, l) => s + Number(l.allocatedAmount), 0)
    const achievedPercent = totalCommitted > 0 ? (actual / totalCommitted) * 100 : 0

    // Pie chart data: allocated vs spent
    const pieData = [
      { label: 'Allocated',  value: totalAllocated },
      { label: 'Spent',      value: actual },
      { label: 'Remaining',  value: Math.max(totalAllocated - actual, 0) },
    ]

    return res.status(200).json({
      budget: {
        id:                budget.id,
        name:              budget.name,
        status:            budget.status,
        periodStart:       budget.periodStart,
        periodEnd:         budget.periodEnd,
        responsiblePerson: budget.responsiblePerson,
        analyticAccount:   budget.analyticAccount,
      },
      lines:            budget.lines,
      totalCommitted,
      totalAllocated,
      actual,
      achievedPercent:  Number(achievedPercent.toFixed(2)),
      pieData,
    })
  } catch (err) {
    console.error('[getBudgetReport]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}
