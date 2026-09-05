import prisma from '../db/prisma.js'

export async function getAllContacts(req, res) {
  try {
    const contacts = await prisma.contact.findMany({ orderBy: { createdAt: 'desc' } })
    return res.status(200).json(contacts)
  } catch (err) {
    console.error('[getAllContacts]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function getContactById(req, res) {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid contact ID.' })

    const contact = await prisma.contact.findUnique({ where: { id }, include: { user: { select: { id: true, loginId: true, email: true, role: true } } } })
    if (!contact) return res.status(404).json({ message: 'Contact not found.' })
    return res.status(200).json(contact)
  } catch (err) {
    console.error('[getContactById]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function createContact(req, res) {
  try {
    const { name, type, email, mobile, city, state, pincode, profileImage } = req.body
    const contact = await prisma.contact.create({ data: { name, type, email, mobile, city, state, pincode, profileImage } })
    return res.status(201).json({ message: 'Contact created successfully.', contact })
  } catch (err) {
    console.error('[createContact]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function updateContact(req, res) {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid contact ID.' })

    const existing = await prisma.contact.findUnique({ where: { id } })
    if (!existing) return res.status(404).json({ message: 'Contact not found.' })

    const { name, type, email, mobile, city, state, pincode, profileImage } = req.body
    const data = {}
    if (name         !== undefined) data.name         = name
    if (type         !== undefined) data.type         = type
    if (email        !== undefined) data.email        = email
    if (mobile       !== undefined) data.mobile       = mobile
    if (city         !== undefined) data.city         = city
    if (state        !== undefined) data.state        = state
    if (pincode      !== undefined) data.pincode      = pincode
    if (profileImage !== undefined) data.profileImage = profileImage

    const contact = await prisma.contact.update({ where: { id }, data })
    return res.status(200).json({ message: 'Contact updated successfully.', contact })
  } catch (err) {
    console.error('[updateContact]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function deleteContact(req, res) {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid contact ID.' })

    const existing = await prisma.contact.findUnique({ where: { id } })
    if (!existing) return res.status(404).json({ message: 'Contact not found.' })

    await prisma.contact.delete({ where: { id } })
    return res.status(200).json({ message: 'Contact deleted successfully.' })
  } catch (err) {
    console.error('[deleteContact]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}
