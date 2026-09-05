import db from '../libs/db.js'
import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 10

export async function getAllContacts(req, res) {
  try {
    const { archived } = req.query
    const where = archived === 'true' ? {} : { archived: false }
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
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid contact ID.' })

    const contact = await db.contact.findUnique({
      where: { id },
      include: { user: { select: { id: true, loginId: true, email: true, role: true } } },
    })
    if (!contact) return res.status(404).json({ message: 'Contact not found.' })
    return res.status(200).json(contact)
  } catch (err) {
    console.error('[getContactById]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function createContact(req, res) {
  try {
    const {
      name, type, email, mobile, city, state, pincode, profileImage,
      createPortalLogin, loginId, password,
    } = req.body

    if (createPortalLogin) {
      if (!loginId || !password) {
        return res.status(400).json({ message: 'Login ID and password are required to create a portal user.' })
      }
      if (!email) {
        return res.status(400).json({ message: 'Email is required to create a portal user.' })
      }
      const [existingLoginId, existingEmail] = await Promise.all([
        db.user.findUnique({ where: { loginId } }),
        db.user.findUnique({ where: { email } }),
      ])
      if (existingLoginId) return res.status(409).json({ message: 'Login ID is already taken.' })
      if (existingEmail)   return res.status(409).json({ message: 'A user with that email already exists.' })
    }

    const contact = await db.$transaction(async (tx) => {
      const created = await tx.contact.create({
        data: {
          name, type,
          email: email || null,
          mobile: mobile || null,
          city, state, pincode, profileImage,
        },
      })

      if (createPortalLogin) {
        const hashed = await bcrypt.hash(password, SALT_ROUNDS)
        await tx.user.create({
          data: {
            name,
            loginId,
            email,
            password: hashed,
            role: 'USER',
            contactId: created.id,
          },
        })
      }

      return created
    })

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

    const existing = await db.contact.findUnique({ where: { id } })
    if (!existing) return res.status(404).json({ message: 'Contact not found.' })

    const { name, type, email, mobile, city, state, pincode, profileImage } = req.body
    const data = {}
    if (name         !== undefined) data.name         = name
    if (type         !== undefined) data.type         = type
    if (email        !== undefined) data.email        = email || null
    if (mobile       !== undefined) data.mobile       = mobile || null
    if (city         !== undefined) data.city         = city
    if (state        !== undefined) data.state        = state
    if (pincode      !== undefined) data.pincode      = pincode
    if (profileImage !== undefined) data.profileImage = profileImage

    const contact = await db.contact.update({ where: { id }, data })
    return res.status(200).json({ message: 'Contact updated successfully.', contact })
  } catch (err) {
    console.error('[updateContact]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function archiveContact(req, res) {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid contact ID.' })

    const existing = await db.contact.findUnique({ where: { id } })
    if (!existing) return res.status(404).json({ message: 'Contact not found.' })

    const contact = await db.contact.update({
      where: { id },
      data:  { archived: !existing.archived },
    })
    return res.status(200).json({
      message: contact.archived ? 'Contact archived.' : 'Contact unarchived.',
      contact,
    })
  } catch (err) {
    console.error('[archiveContact]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}
