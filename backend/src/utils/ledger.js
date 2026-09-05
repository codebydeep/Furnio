/**
 * Auto-post balanced journal entries for bills, invoices, and payments.
 * Uses Chart of Accounts + Journals from seed / master data.
 */
import { generateDocNumber } from './generateDocNumber.js'

function httpError(status, message) {
  const err = new Error(message)
  err.status = status
  return err
}

async function findAccount(tx, { type, hints }) {
  const accounts = await tx.account.findMany({
    where: { type, archived: false },
  })
  if (!accounts.length) {
    throw httpError(400, `No ${type} account found in Chart of Accounts. Please create one.`)
  }
  const lowered = hints.map(h => h.toLowerCase())
  return accounts.find(a => lowered.some(h => a.name.toLowerCase().includes(h))) ?? accounts[0]
}

async function findJournal(tx, type) {
  const journal = await tx.journal.findFirst({ where: { type } })
  if (!journal) {
    throw httpError(400, `${type} journal is not set up. Create it under Journals.`)
  }
  return journal
}

/**
 * Create a POSTED journal entry inside an existing Prisma transaction.
 */
export async function postLedgerEntry(tx, {
  journalType,
  prefix = 'JE',
  partnerId = null,
  createdBy,
  accountingDate,
  items,
}) {
  const journal = await findJournal(tx, journalType)
  const number  = await generateDocNumber('JournalEntry', prefix, tx)

  const debit  = items.reduce((s, i) => s + Number(i.debit  || 0), 0)
  const credit = items.reduce((s, i) => s + Number(i.credit || 0), 0)
  if (Math.abs(debit - credit) > 0.01) {
    throw httpError(422, `Unbalanced auto-entry: debit ${debit} ≠ credit ${credit}.`)
  }

  return tx.journalEntry.create({
    data: {
      number,
      journalId: journal.id,
      partnerId,
      accountingDate: accountingDate ? new Date(accountingDate) : undefined,
      status: 'POSTED',
      createdBy,
      items: {
        create: items.map(i => ({
          accountId:         i.accountId,
          partnerId:         i.partnerId ?? partnerId ?? null,
          debit:             i.debit  ?? 0,
          credit:            i.credit ?? 0,
          analyticAccountId: i.analyticAccountId ?? null,
        })),
      },
    },
  })
}

/** Vendor bill: Dr Purchase Expense / Cr Creditors */
export async function postVendorBillEntry(tx, { partnerId, createdBy, amount, analyticAccountId, date }) {
  const expense = await findAccount(tx, { type: 'EXPENSE',   hints: ['purchase', 'purchases'] })
  const payable = await findAccount(tx, { type: 'LIABILITY', hints: ['payable', 'creditor'] })
  return postLedgerEntry(tx, {
    journalType: 'PURCHASE',
    prefix: 'BILL',
    partnerId,
    createdBy,
    accountingDate: date,
    items: [
      { accountId: expense.id, debit: amount, credit: 0, analyticAccountId },
      { accountId: payable.id, debit: 0, credit: amount },
    ],
  })
}

/** Customer invoice: Dr Debtors / Cr Sales Income (+ Tax Payable) */
export async function postCustomerInvoiceEntry(tx, {
  partnerId, createdBy, baseAmount, taxAmount, analyticAccountId, date,
}) {
  const debtors = await findAccount(tx, { type: 'ASSET',     hints: ['receivable', 'debtor'] })
  const income  = await findAccount(tx, { type: 'INCOME',    hints: ['sale', 'sales', 'income'] })
  const total   = Number(baseAmount) + Number(taxAmount)

  const items = [
    { accountId: debtors.id, debit: total, credit: 0 },
    { accountId: income.id,  debit: 0, credit: baseAmount, analyticAccountId },
  ]

  if (Number(taxAmount) > 0.005) {
    const tax = await findAccount(tx, { type: 'LIABILITY', hints: ['tax'] })
    items.push({ accountId: tax.id, debit: 0, credit: taxAmount })
  }

  return postLedgerEntry(tx, {
    journalType: 'SALES',
    prefix: 'INV',
    partnerId,
    createdBy,
    accountingDate: date,
    items,
  })
}

/** Pay vendor bill: Dr Creditors / Cr Bank or Cash */
export async function postBillPaymentEntry(tx, { partnerId, createdBy, amount, journal, date }) {
  const payable = await findAccount(tx, { type: 'LIABILITY', hints: ['payable', 'creditor'] })
  let cashOrBank = journal.defaultAccountId
    ? await tx.account.findUnique({ where: { id: journal.defaultAccountId } })
    : null
  if (!cashOrBank) {
    cashOrBank = await findAccount(tx, {
      type: 'ASSET',
      hints: journal.type === 'CASH' ? ['cash'] : ['bank'],
    })
  }

  return postLedgerEntry(tx, {
    journalType: journal.type,
    prefix: 'PAY',
    partnerId,
    createdBy,
    accountingDate: date,
    items: [
      { accountId: payable.id,     debit: amount, credit: 0 },
      { accountId: cashOrBank.id,  debit: 0, credit: amount },
    ],
  })
}

/** Receive invoice payment: Dr Bank or Cash / Cr Debtors */
export async function postInvoicePaymentEntry(tx, { partnerId, createdBy, amount, journal, date }) {
  const debtors = await findAccount(tx, { type: 'ASSET', hints: ['receivable', 'debtor'] })
  let cashOrBank = journal.defaultAccountId
    ? await tx.account.findUnique({ where: { id: journal.defaultAccountId } })
    : null
  if (!cashOrBank) {
    cashOrBank = await findAccount(tx, {
      type: 'ASSET',
      hints: journal.type === 'CASH' ? ['cash'] : ['bank'],
    })
  }

  return postLedgerEntry(tx, {
    journalType: journal.type,
    prefix: 'PAY',
    partnerId,
    createdBy,
    accountingDate: date,
    items: [
      { accountId: cashOrBank.id, debit: amount, credit: 0 },
      { accountId: debtors.id,    debit: 0, credit: amount },
    ],
  })
}

export async function resolvePaymentJournal(tx, { journalId, journalType }) {
  if (journalId) {
    const journal = await tx.journal.findUnique({ where: { id: journalId } })
    if (!journal) throw httpError(404, 'Journal not found.')
    if (journal.type !== 'BANK' && journal.type !== 'CASH') {
      throw httpError(400, 'Payment journal must be of type BANK or CASH.')
    }
    return journal
  }
  if (journalType === 'BANK' || journalType === 'CASH') {
    return findJournal(tx, journalType)
  }
  throw httpError(400, 'Journal (Bank/Cash) is required.')
}
