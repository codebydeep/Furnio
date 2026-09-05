import db from '../libs/db.js'

/**
 * GET /api/reports/balance-sheet?asOf=YYYY-MM-DD
 *
 * SUM(debit – credit) per JournalItem grouped by Account (ASSET/LIABILITY/CAPITAL),
 * filtered to posted entries on or before asOf date.
 */
export async function getBalanceSheet(req, res) {
  try {
    const asOf = req.query.asOf ? new Date(req.query.asOf + 'T23:59:59.999Z') : new Date()

    const items = await db.journalItem.findMany({
      where: {
        journalEntry: {
          status:        'POSTED',
          accountingDate: { lte: asOf },
        },
        account: {
          type: { in: ['ASSET', 'LIABILITY', 'CAPITAL', 'PROFIT_AND_LOSS'] },
        },
      },
      include: { account: true },
    })

    const map = {}
    for (const item of items) {
      const { id, name, type } = item.account
      if (!map[id]) map[id] = { accountId: id, accountName: name, accountType: type, balance: 0 }

      // Normal balance: ASSET debit-positive, LIABILITY/CAPITAL credit-positive
      if (type === 'ASSET') {
        map[id].balance += Number(item.debit) - Number(item.credit)
      } else {
        map[id].balance += Number(item.credit) - Number(item.debit)
      }
    }

    const rows = Object.values(map)
    const assets      = rows.filter(r => r.accountType === 'ASSET')
    const liabilities = rows.filter(r => r.accountType === 'LIABILITY')
    const capital     = rows.filter(r => r.accountType === 'CAPITAL' || r.accountType === 'PROFIT_AND_LOSS')

    const totalAssets      = assets.reduce((s, r) => s + r.balance, 0)
    const totalLiabilities = liabilities.reduce((s, r) => s + r.balance, 0)
    const totalCapital     = capital.reduce((s, r) => s + r.balance, 0)
    const balanced         = Math.abs(totalAssets - (totalLiabilities + totalCapital)) < 0.01

    return res.status(200).json({
      asOf:             asOf.toISOString().slice(0, 10),
      assets,
      liabilities,
      capital,
      totalAssets:      Number(totalAssets.toFixed(2)),
      totalLiabilities: Number(totalLiabilities.toFixed(2)),
      totalCapital:     Number(totalCapital.toFixed(2)),
      balanced,
    })
  } catch (err) {
    console.error('[getBalanceSheet]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

/**
 * GET /api/reports/profit-loss?from=YYYY-MM-DD&to=YYYY-MM-DD
 *
 * SUM(credit – debit) for INCOME/REVENUE accounts (income),
 * SUM(debit – credit) for EXPENSE/OTHER_EXPENSE accounts (expenses),
 * for posted entries within the date range.
 */
export async function getProfitAndLoss(req, res) {
  try {
    const now   = new Date()
    const from  = req.query.from ? new Date(req.query.from) : new Date(now.getFullYear(), 0, 1)
    const toRaw = req.query.to   ? new Date(req.query.to + 'T23:59:59.999Z') : now

    const items = await db.journalItem.findMany({
      where: {
        journalEntry: {
          status:         'POSTED',
          accountingDate: { gte: from, lte: toRaw },
        },
        account: {
          type: { in: ['INCOME', 'REVENUE', 'EXPENSE', 'OTHER_EXPENSE'] },
        },
      },
      include: { account: true },
    })

    const incomeMap  = {}
    const expenseMap = {}

    for (const item of items) {
      const { id, name, type } = item.account

      if (type === 'INCOME' || type === 'REVENUE') {
        if (!incomeMap[id]) incomeMap[id] = { accountId: id, accountName: name, amount: 0 }
        incomeMap[id].amount += Number(item.credit) - Number(item.debit)
      } else {
        if (!expenseMap[id]) expenseMap[id] = { accountId: id, accountName: name, amount: 0 }
        expenseMap[id].amount += Number(item.debit) - Number(item.credit)
      }
    }

    const income   = Object.values(incomeMap)
    const expenses = Object.values(expenseMap)

    const totalIncome   = income.reduce((s, r) => s + r.amount, 0)
    const totalExpenses = expenses.reduce((s, r) => s + r.amount, 0)
    const netProfit     = totalIncome - totalExpenses

    return res.status(200).json({
      from:          from.toISOString().slice(0, 10),
      to:            toRaw.toISOString().slice(0, 10),
      income,
      expenses,
      totalIncome:   Number(totalIncome.toFixed(2)),
      totalExpenses: Number(totalExpenses.toFixed(2)),
      netProfit:     Number(netProfit.toFixed(2)),
    })
  } catch (err) {
    console.error('[getProfitAndLoss]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

/**
 * GET /api/reports/budget
 *
 * Per analytic account: Committed, Allocated, Actual (from posted ledger), Achieved %.
 * Used for the Budget Report screen and pie chart.
 */
export async function getBudgetReport(req, res) {
  try {
    const budgets = await db.budget.findMany({
      include: { analyticAccount: true, lines: true },
      orderBy: { createdAt: 'desc' },
    })

    const report = await Promise.all(budgets.map(async (b) => {
      const totalCommitted = b.lines.reduce((s, l) => s + Number(l.committedAmount), 0)
      const totalAllocated = b.lines.reduce((s, l) => s + Number(l.allocatedAmount), 0)

      // Pull actuals from posted JournalItems for this analytic account
      const journalItems = await db.journalItem.findMany({
        where: {
          analyticAccountId: b.analyticAccountId,
          journalEntry:      { status: 'POSTED' },
        },
      })

      const actual = b.analyticAccount.type === 'INCOME'
        ? journalItems.reduce((s, i) => s + Number(i.credit) - Number(i.debit), 0)
        : Math.max(journalItems.reduce((s, i) => s + Number(i.debit) - Number(i.credit), 0), 0)

      const achievedPercent = totalCommitted > 0 ? (actual / totalCommitted) * 100 : 0

      return {
        id:                b.id,
        name:              b.name,
        status:            b.status,
        analyticAccount:   b.analyticAccount.name,
        analyticType:      b.analyticAccount.type,
        periodStart:       b.periodStart,
        periodEnd:         b.periodEnd,
        responsiblePerson: b.responsiblePerson,
        totalCommitted:    Number(totalCommitted.toFixed(2)),
        totalAllocated:    Number(totalAllocated.toFixed(2)),
        actual:            Number(actual.toFixed(2)),
        achievedPercent:   Number(achievedPercent.toFixed(2)),
      }
    }))

    const totalCommitted = report.reduce((s, r) => s + r.totalCommitted, 0)
    const totalAllocated = report.reduce((s, r) => s + r.totalAllocated, 0)
    const totalActual    = report.reduce((s, r) => s + r.actual, 0)

    return res.status(200).json({
      budgets: report,
      totalCommitted: Number(totalCommitted.toFixed(2)),
      totalAllocated: Number(totalAllocated.toFixed(2)),
      totalActual:    Number(totalActual.toFixed(2)),
    })
  } catch (err) {
    console.error('[getBudgetReport]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}
