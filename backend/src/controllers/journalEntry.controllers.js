import db from '../libs/db.js'
import { generateDocNumber } from '../utils/generateDocNumber.js'

const ENTRY_INCLUDE = {
  journal: true,
  partner: true,
  items: {
    include: {
      account:        true,
      analyticAccount: true,
    },
  },
}

export async function getAllJournalEntries(req, res) {
  try {
    const { journalId, from, to, status } = req.query
    const where = {}
    if (journalId) where.journalId = parseInt(journalId)
    if (status)    where.status    = status.toUpperCase()
    if (from || to) {
      where.accountingDate = {}
      if (from) where.accountingDate.gte = new Date(from)
      if (to)   where.accountingDate.lte = new Date(to + 'T23:59:59.999Z')
    }

    const entries = await db.journalEntry.findMany({
      where,
      include: ENTRY_INCLUDE,
      orderBy: { accountingDate: 'desc' },
    })
    return res.status(200).json(entries)
  } catch (err) {
    console.error('[getAllJournalEntries]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function getJournalEntryById(req, res) {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid journal entry ID.' })

    const entry = await db.journalEntry.findUnique({ where: { id }, include: ENTRY_INCLUDE })
    if (!entry) return res.status(404).json({ message: 'Journal entry not found.' })
    return res.status(200).json(entry)
  } catch (err) {
    console.error('[getJournalEntryById]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function createJournalEntry(req, res) {
  try {
    const { journalId, partnerId, accountingDate, items } = req.body

    const journal = await db.journal.findUnique({ where: { id: journalId } })
    if (!journal) return res.status(404).json({ message: 'Journal not found.' })

    // Validate all accounts exist
    for (const item of items) {
      const account = await db.account.findUnique({ where: { id: item.accountId } })
      if (!account) return res.status(404).json({ message: `Account ID ${item.accountId} not found.` })
    }

    const number = await generateDocNumber('JournalEntry', journal.type === 'SALES' ? 'INV' : 'JE')

    const entry = await db.journalEntry.create({
      data: {
        number,
        journalId,
        partnerId:      partnerId ?? null,
        accountingDate: accountingDate ? new Date(accountingDate) : undefined,
        createdBy:      req.user.id,
        items: {
          create: items.map(i => ({
            accountId:         i.accountId,
            partnerId:         i.partnerId         ?? null,
            debit:             i.debit             ?? 0,
            credit:            i.credit            ?? 0,
            analyticAccountId: i.analyticAccountId ?? null,
          })),
        },
      },
      include: ENTRY_INCLUDE,
    })
    return res.status(201).json({ message: 'Journal entry created as DRAFT.', entry })
  } catch (err) {
    console.error('[createJournalEntry]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

/**
 * PATCH /api/journal-entries/:id/post
 *
 * Checks Σ debit = Σ credit, then flips status to POSTED.
 * Rejects with 422 if unbalanced.
 */
export async function postJournalEntry(req, res) {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid journal entry ID.' })

    const entry = await db.journalEntry.findUnique({
      where: { id },
      include: { items: true },
    })
    if (!entry) return res.status(404).json({ message: 'Journal entry not found.' })
    if (entry.status !== 'DRAFT') {
      return res.status(400).json({ message: `Cannot post a journal entry with status: ${entry.status}.` })
    }

    // Balance check
    const totalDebit  = entry.items.reduce((s, l) => s + Number(l.debit),  0)
    const totalCredit = entry.items.reduce((s, l) => s + Number(l.credit), 0)
    if (Math.abs(totalDebit - totalCredit) > 0.005) {
      return res.status(422).json({
        message: `Debit (${totalDebit.toFixed(2)}) and credit (${totalCredit.toFixed(2)}) totals do not match.`,
      })
    }

    const updated = await db.journalEntry.update({
      where: { id },
      data:  { status: 'POSTED' },
      include: ENTRY_INCLUDE,
    })
    return res.status(200).json({ message: 'Journal entry posted.', entry: updated })
  } catch (err) {
    console.error('[postJournalEntry]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

/**
 * PATCH /api/journal-entries/:id/cancel
 * Admin only. Only allowed while status is DRAFT.
 */
export async function cancelJournalEntry(req, res) {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid journal entry ID.' })

    const entry = await db.journalEntry.findUnique({ where: { id } })
    if (!entry) return res.status(404).json({ message: 'Journal entry not found.' })
    if (entry.status !== 'DRAFT') {
      return res.status(400).json({ message: 'Only DRAFT journal entries can be cancelled.' })
    }

    const updated = await db.journalEntry.update({
      where: { id },
      data:  { status: 'CANCELLED' },
      include: ENTRY_INCLUDE,
    })
    return res.status(200).json({ message: 'Journal entry cancelled.', entry: updated })
  } catch (err) {
    console.error('[cancelJournalEntry]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}
