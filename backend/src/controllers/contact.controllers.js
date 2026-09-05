import db from '../libs/db.js'

export async function createContact(req, res) {
  try {
    const { name, type, email, mobile, city, state, pincode, profileImage } = req.body

    if (email) {
      const existing = await db.contact.findFirst({ where: { email } })
      if (existing) {
        return res.status(409).json({ message: 'A contact with that email already exists.' })
      }
    }

    const contact = await db.contact.create({
      data: { name, type, email, mobile, city, state, pincode, profileImage },
    })

    return res.status(201).json({ message: 'Contact created successfully.', contact })
  } catch (err) {
    console.error('[createContact]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function getAllContacts(req, res) {
  try {
    const { type, archived } = req.query

    const where = {}
    if (type)                where.type     = type
    if (archived === 'true') where.archived = true
    else                     where.archived = false

    const contacts = await db.contact.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return res.status(200).json(contacts)
  } catch (err) {
    console.error('[getAllContacts]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function getContactById(req, res) {
  try {
    const contact = await db.contact.findUnique({
      where: { id: req.params.id },
      include: { user: { select: { id: true, email: true, role: true } } },
    })

    if (!contact) {
      return res.status(404).json({ message: 'Contact not found.' })
    }

    return res.status(200).json(contact)
  } catch (err) {
    console.error('[getContactById]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function updateContact(req, res) {
  try {
    const { id } = req.params

    const existing = await db.contact.findUnique({ where: { id } })
    if (!existing) {
      return res.status(404).json({ message: 'Contact not found.' })
    }

    if (existing.archived) {
      return res.status(400).json({ message: 'Cannot update an archived contact.' })
    }

    const { email } = req.body
    if (email && email !== existing.email) {
      const conflict = await db.contact.findFirst({ where: { email } })
      if (conflict) {
        return res.status(409).json({ message: 'Email is already used by another contact.' })
      }
    }

    const contact = await db.contact.update({
      where: { id },
      data: req.body,
    })

    return res.status(200).json({ message: 'Contact updated successfully.', contact })
  } catch (err) {
    console.error('[updateContact]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function archiveContact(req, res) {
  try {
    const { id } = req.params

    const existing = await db.contact.findUnique({ where: { id } })
    if (!existing) {
      return res.status(404).json({ message: 'Contact not found.' })
    }
    if (existing.archived) {
      return res.status(400).json({ message: 'Contact is already archived.' })
    }

    const contact = await db.contact.update({
      where: { id },
      data: { archived: true },
    })

    return res.status(200).json({ message: 'Contact archived successfully.', contact })
  } catch (err) {
    console.error('[archiveContact]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function unarchiveContact(req, res) {
  try {
    const { id } = req.params

    const existing = await db.contact.findUnique({ where: { id } })
    if (!existing) {
      return res.status(404).json({ message: 'Contact not found.' })
    }
    if (!existing.archived) {
      return res.status(400).json({ message: 'Contact is not archived.' })
    }

    const contact = await db.contact.update({
      where: { id },
      data: { archived: false },
    })

    return res.status(200).json({ message: 'Contact restored successfully.', contact })
  } catch (err) {
    console.error('[unarchiveContact]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}
