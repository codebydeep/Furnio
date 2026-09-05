import db from '../libs/db.js'

export async function createJournal(req, res) {
  try {
    const { name, type, defaultAccountId } = req.body

    const existing = await db.journal.findFirst({ where: { name, type } })
    if (existing) {
      return res.status(409).json({ message: `A journal named "${name}" of type ${type} already exists.` })
    }

    if (defaultAccountId) {
      const account = await db.account.findUnique({ where: { id: defaultAccountId } })
      if (!account) {
        return res.status(404).json({ message: 'Default account not found.' })
      }
      if (account.archived) {
        return res.status(400).json({ message: 'Cannot link an archived account as default.' })
      }
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

export async function getAllJournals(req, res) {
  try {
    const { type } = req.query

    const where = {}
    if (type) where.type = type

    const journals = await db.journal.findMany({
      where,
      include: { defaultAccount: true },
      orderBy: { name: 'asc' },
    })

    return res.status(200).json(journals)
  } catch (err) {
    console.error('[getAllJournals]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function getJournalById(req, res) {
  try {
    const journal = await db.journal.findUnique({
      where: { id: req.params.id },
      include: { defaultAccount: true },
    })

    if (!journal) {
      return res.status(404).json({ message: 'Journal not found.' })
    }

    return res.status(200).json(journal)
  } catch (err) {
    console.error('[getJournalById]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function updateJournal(req, res) {
  try {
    const { id } = req.params
    const { name, type, defaultAccountId } = req.body

    const existing = await db.journal.findUnique({ where: { id } })
    if (!existing) {
      return res.status(404).json({ message: 'Journal not found.' })
    }

    if (defaultAccountId) {
      const account = await db.account.findUnique({ where: { id: defaultAccountId } })
      if (!account) {
        return res.status(404).json({ message: 'Default account not found.' })
      }
      if (account.archived) {
        return res.status(400).json({ message: 'Cannot link an archived account as default.' })
      }
    }

    const data = {}
    if (name !== undefined)             data.name             = name
    if (type !== undefined)             data.type             = type
    if (defaultAccountId !== undefined) data.defaultAccountId = defaultAccountId

    const journal = await db.journal.update({
      where: { id },
      data,
      include: { defaultAccount: true },
    })

    return res.status(200).json({ message: 'Journal updated successfully.', journal })
  } catch (err) {
    console.error('[updateJournal]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function deleteJournal(req, res) {
  try {
    const { id } = req.params

    const existing = await db.journal.findUnique({
      where: { id },
      include: { _count: { select: { entries: true } } },
    })

    if (!existing) {
      return res.status(404).json({ message: 'Journal not found.' })
    }

    if (existing._count.entries > 0) {
      return res.status(400).json({
        message: `Cannot delete journal — it has ${existing._count.entries} journal entries linked to it.`,
      })
    }

    await db.journal.delete({ where: { id } })

    return res.status(200).json({ message: 'Journal deleted successfully.' })
  } catch (err) {
    console.error('[deleteJournal]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}
