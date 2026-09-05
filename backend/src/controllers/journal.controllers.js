import db from '../libs/db.js'

export async function getAllJournals(req, res) {
  try {
    const journals = await db.journal.findMany({
      include: { defaultAccount: true },
      orderBy: { createdAt: 'asc' },
    })
    return res.status(200).json(journals)
  } catch (err) {
    console.error('[getAllJournals]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function getJournalById(req, res) {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid journal ID.' })
    const journal = await db.journal.findUnique({ where: { id }, include: { defaultAccount: true } })
    if (!journal) return res.status(404).json({ message: 'Journal not found.' })
    return res.status(200).json(journal)
  } catch (err) {
    console.error('[getJournalById]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function createJournal(req, res) {
  try {
    const { name, type, defaultAccountId } = req.body
    if (defaultAccountId) {
      const acc = await db.account.findUnique({ where: { id: defaultAccountId } })
      if (!acc) return res.status(404).json({ message: 'Default account not found.' })
    }
    const journal = await db.journal.create({
      data: { name, type, defaultAccountId: defaultAccountId ?? null },
      include: { defaultAccount: true },
    })
    return res.status(201).json({ message: 'Journal created successfully.', journal })
  } catch (err) {
    console.error('[createJournal]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function updateJournal(req, res) {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid journal ID.' })
    const existing = await db.journal.findUnique({ where: { id } })
    if (!existing) return res.status(404).json({ message: 'Journal not found.' })

    const { name, type, defaultAccountId } = req.body
    const data = {}
    if (name             !== undefined) data.name             = name
    if (type             !== undefined) data.type             = type
    if (defaultAccountId !== undefined) data.defaultAccountId = defaultAccountId

    const journal = await db.journal.update({ where: { id }, data, include: { defaultAccount: true } })
    return res.status(200).json({ message: 'Journal updated successfully.', journal })
  } catch (err) {
    console.error('[updateJournal]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}
