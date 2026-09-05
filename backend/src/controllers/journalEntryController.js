import prisma from '../db/prisma.js'

export async function getAllJournalEntries(req, res) {
  try {
    const entries = await prisma.journalEntry.findMany({
      include: { journal: true, items: { include: { account: true } } },
      orderBy: { date: 'desc' },
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

    const entry = await prisma.journalEntry.findUnique({
      where: { id },
      include: { journal: true, items: { include: { account: true } } },
    })
    if (!entry) return res.status(404).json({ message: 'Journal entry not found.' })
    return res.status(200).json(entry)
  } catch (err) {
    console.error('[getJournalEntryById]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function createJournalEntry(req, res) {
  try {
    const { journalId, date, reference, items } = req.body

    const journal = await prisma.journal.findUnique({ where: { id: journalId } })
    if (!journal) return res.status(404).json({ message: 'Journal not found.' })

    for (const item of items) {
      const account = await prisma.account.findUnique({ where: { id: item.accountId } })
      if (!account) return res.status(404).json({ message: `Account ${item.accountId} not found.` })
    }

    const entry = await prisma.journalEntry.create({
      data: {
        journalId,
        date:      new Date(date),
        reference: reference ?? null,
        items: {
          create: items.map((i) => ({
            accountId: i.accountId,
            debit:     i.debit  ?? 0,
            credit:    i.credit ?? 0,
          })),
        },
      },
      include: { journal: true, items: { include: { account: true } } },
    })
    return res.status(201).json({ message: 'Journal entry created successfully.', entry })
  } catch (err) {
    console.error('[createJournalEntry]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function deleteJournalEntry(req, res) {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid journal entry ID.' })

    const existing = await prisma.journalEntry.findUnique({ where: { id } })
    if (!existing) return res.status(404).json({ message: 'Journal entry not found.' })

    await prisma.journalItem.deleteMany({ where: { journalEntryId: id } })
    await prisma.journalEntry.delete({ where: { id } })
    return res.status(200).json({ message: 'Journal entry deleted successfully.' })
  } catch (err) {
    console.error('[deleteJournalEntry]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}
