import prisma from '../db/prisma.js'

export async function getProfitAndLoss(req, res) {
  try {
    const items = await prisma.journalItem.findMany({
      include: { account: true },
    })

    let totalIncome   = 0
    let totalExpenses = 0

    for (const item of items) {
      if (item.account.type === 'INCOME') {
        totalIncome += Number(item.credit) - Number(item.debit)
      }
      if (item.account.type === 'EXPENSE') {
        totalExpenses += Number(item.debit) - Number(item.credit)
      }
    }

    return res.status(200).json({
      totalIncome:   Number(totalIncome.toFixed(2)),
      totalExpenses: Number(totalExpenses.toFixed(2)),
      netProfit:     Number((totalIncome - totalExpenses).toFixed(2)),
    })
  } catch (err) {
    console.error('[getProfitAndLoss]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function getBalanceSheet(req, res) {
  try {
    const items = await prisma.journalItem.findMany({
      include: { account: true },
    })

    const accounts = {}
    for (const item of items) {
      const { id, name, type } = item.account
      if (!accounts[id]) accounts[id] = { id, name, type, balance: 0 }

      if (type === 'ASSET' || type === 'EXPENSE') {
        accounts[id].balance += Number(item.debit) - Number(item.credit)
      } else {
        accounts[id].balance += Number(item.credit) - Number(item.debit)
      }
    }

    const grouped = { ASSET: [], LIABILITY: [], CAPITAL: [], INCOME: [], EXPENSE: [] }
    for (const acc of Object.values(accounts)) {
      grouped[acc.type]?.push({ id: acc.id, name: acc.name, balance: Number(acc.balance.toFixed(2)) })
    }

    const totalAssets      = grouped.ASSET.reduce((s, a) => s + a.balance, 0)
    const totalLiabilities = grouped.LIABILITY.reduce((s, a) => s + a.balance, 0)
    const totalCapital     = grouped.CAPITAL.reduce((s, a) => s + a.balance, 0)

    return res.status(200).json({
      assets:           grouped.ASSET,
      liabilities:      grouped.LIABILITY,
      capital:          grouped.CAPITAL,
      totalAssets:      Number(totalAssets.toFixed(2)),
      totalLiabilities: Number(totalLiabilities.toFixed(2)),
      totalCapital:     Number(totalCapital.toFixed(2)),
    })
  } catch (err) {
    console.error('[getBalanceSheet]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function getBudgetReport(req, res) {
  try {
    const budgets = await prisma.budget.findMany({ include: { analyticAccount: true } })

    const report = budgets.map((b) => ({
      id:                b.id,
      name:              b.name,
      analyticAccount:   b.analyticAccount.name,
      type:              b.analyticAccount.type,
      plannedAmount:     Number(b.plannedAmount),
      responsiblePerson: b.responsiblePerson,
      periodStart:       b.periodStart,
      periodEnd:         b.periodEnd,
    }))

    const totalPlanned = report.reduce((s, b) => s + b.plannedAmount, 0)

    return res.status(200).json({ budgets: report, totalPlanned: Number(totalPlanned.toFixed(2)) })
  } catch (err) {
    console.error('[getBudgetReport]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function getLedger(req, res) {
  try {
    const accountId = parseInt(req.params.accountId, 10)
    if (isNaN(accountId)) return res.status(400).json({ message: 'Invalid account ID.' })

    const account = await prisma.account.findUnique({ where: { id: accountId } })
    if (!account) return res.status(404).json({ message: 'Account not found.' })

    const items = await prisma.journalItem.findMany({
      where: { accountId },
      include: { journalEntry: { include: { journal: true } } },
      orderBy: { journalEntry: { date: 'asc' } },
    })

    let runningBalance = 0
    const ledger = items.map((item) => {
      const debit  = Number(item.debit)
      const credit = Number(item.credit)
      if (account.type === 'ASSET' || account.type === 'EXPENSE') {
        runningBalance += debit - credit
      } else {
        runningBalance += credit - debit
      }
      return {
        date:      item.journalEntry.date,
        journal:   item.journalEntry.journal.name,
        reference: item.journalEntry.reference,
        debit,
        credit,
        balance:   Number(runningBalance.toFixed(2)),
      }
    })

    return res.status(200).json({ account: { id: account.id, name: account.name, type: account.type }, ledger })
  } catch (err) {
    console.error('[getLedger]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}
