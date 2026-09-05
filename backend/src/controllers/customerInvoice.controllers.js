import db from '../libs/db.js'
import { resolvePaymentJournal, postInvoicePaymentEntry } from '../utils/ledger.js'

const INV_INCLUDE = {
  so: {
    include: {
      customer: true,
      items: { include: { product: true, analyticAccount: true } },
    },
  },
  payments: { include: { journal: true } },
}

export async function getAllCustomerInvoices(req, res) {
  try {
    const invoices = await db.customerInvoice.findMany({
      include: INV_INCLUDE,
      orderBy: { invoiceDate: 'desc' },
    })
    return res.status(200).json(invoices)
  } catch (err) {
    console.error('[getAllCustomerInvoices]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function getCustomerInvoiceById(req, res) {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid invoice ID.' })

    const invoice = await db.customerInvoice.findUnique({ where: { id }, include: INV_INCLUDE })
    if (!invoice) return res.status(404).json({ message: 'Invoice not found.' })

    if (req.user.role === 'USER' && invoice.so.customerId !== req.user.contactId) {
      return res.status(403).json({ message: 'Access denied.' })
    }

    return res.status(200).json(invoice)
  } catch (err) {
    console.error('[getCustomerInvoiceById]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function getMyInvoices(req, res) {
  try {
    let contactId = req.user.contactId
    if (!contactId && req.user.email) {
      const contact = await db.contact.findFirst({ where: { email: req.user.email } })
      if (contact) contactId = contact.id
    }

    // If staff testing portal without linked contact, show recent invoices
    if (!contactId && (req.user.role === 'ADMIN' || req.user.role === 'ACCOUNTANT')) {
      const invoices = await db.customerInvoice.findMany({
        include: INV_INCLUDE,
        orderBy: { invoiceDate: 'desc' },
      })
      return res.status(200).json(invoices)
    }

    if (!contactId) {
      return res.status(200).json([])
    }

    const soIds = await db.salesOrder.findMany({
      where: { customerId: contactId },
      select: { id: true },
    })

    const invoices = await db.customerInvoice.findMany({
      where: { soId: { in: soIds.map(s => s.id) } },
      include: INV_INCLUDE,
      orderBy: { invoiceDate: 'desc' },
    })
    return res.status(200).json(invoices)
  } catch (err) {
    console.error('[getMyInvoices]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function getMyBills(req, res) {
  try {
    let contactId = req.user.contactId
    if (!contactId && req.user.email) {
      const contact = await db.contact.findFirst({ where: { email: req.user.email } })
      if (contact) contactId = contact.id
    }

    // If staff testing portal without linked contact, show recent bills
    if (!contactId && (req.user.role === 'ADMIN' || req.user.role === 'ACCOUNTANT')) {
      const bills = await db.vendorBill.findMany({
        include: {
          po: { include: { vendor: true, items: { include: { product: true } } } },
          payments: true,
        },
        orderBy: { billDate: 'desc' },
      })
      return res.status(200).json(bills)
    }

    if (!contactId) {
      return res.status(200).json([])
    }

    const poIds = await db.purchaseOrder.findMany({
      where: { vendorId: contactId },
      select: { id: true },
    })

    const bills = await db.vendorBill.findMany({
      where: { poId: { in: poIds.map(p => p.id) } },
      include: {
        po: { include: { vendor: true, items: { include: { product: true } } } },
        payments: true,
      },
      orderBy: { billDate: 'desc' },
    })
    return res.status(200).json(bills)
  } catch (err) {
    console.error('[getMyBills]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function getMyPayments(req, res) {
  try {
    let contactId = req.user.contactId
    if (!contactId && req.user.email) {
      const contact = await db.contact.findFirst({ where: { email: req.user.email } })
      if (contact) contactId = contact.id
    }

    if (!contactId && (req.user.role === 'ADMIN' || req.user.role === 'ACCOUNTANT')) {
      const payments = await db.payment.findMany({
        include: {
          journal: true,
          vendorBill: { include: { po: { include: { vendor: true } } } },
          customerInvoice: { include: { so: { include: { customer: true } } } },
        },
        orderBy: { date: 'desc' },
      })
      return res.status(200).json(payments)
    }

    if (!contactId) {
      return res.status(200).json([])
    }

    const payments = await db.payment.findMany({
      where: {
        OR: [
          { customerInvoice: { so: { customerId: contactId } } },
          { vendorBill: { po: { vendorId: contactId } } },
        ],
      },
      include: {
        journal: true,
        vendorBill: { include: { po: { include: { vendor: true } } } },
        customerInvoice: { include: { so: { include: { customer: true } } } },
      },
      orderBy: { date: 'desc' },
    })
    return res.status(200).json(payments)
  } catch (err) {
    console.error('[getMyPayments]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function registerInvoicePayment(req, res) {
  try {
    const invoiceId = parseInt(req.params.id, 10)
    if (isNaN(invoiceId)) return res.status(400).json({ message: 'Invalid invoice ID.' })

    let { journalId, journalType, amount, date, method } = req.body
    if (!journalType && method) journalType = method

    const invoice = await db.customerInvoice.findUnique({
      where: { id: invoiceId },
      include: { payments: true, so: true },
    })
    if (!invoice) return res.status(404).json({ message: 'Invoice not found.' })
    if (invoice.paymentStatus === 'PAID') return res.status(400).json({ message: 'This invoice has already been fully paid.' })

    if (req.user.role === 'USER' && req.user.contactId && invoice.so.customerId !== req.user.contactId) {
      return res.status(403).json({ message: 'Access denied.' })
    }

    const totalPaid = invoice.payments.reduce((s, p) => s + Number(p.amount), 0)
    const remaining = Number(invoice.amount) - totalPaid
    if (!amount) amount = remaining
    if (amount > remaining + 0.01) {
      return res.status(400).json({ message: `Amount (${amount}) exceeds remaining balance of ${remaining.toFixed(2)}.` })
    }

    const newTotalPaid  = totalPaid + amount
    const paymentStatus = newTotalPaid >= Number(invoice.amount) - 0.01 ? 'PAID' : 'PARTIAL'

    const payment = await db.$transaction(async (tx) => {
      const journal = await resolvePaymentJournal(tx, { journalId, journalType })
      const entry = await postInvoicePaymentEntry(tx, {
        partnerId: invoice.so.customerId,
        createdBy: req.user.id,
        amount,
        journal,
        date,
      })

      const pay = await tx.payment.create({
        data: {
          direction:         'RECEIVED',
          journalId:         journal.id,
          amount,
          date: date ? new Date(date) : undefined,
          customerInvoiceId: invoiceId,
          journalEntryId:    entry.id,
        },
      })

      await tx.customerInvoice.update({
        where: { id: invoiceId },
        data:  { paymentStatus },
      })

      return pay
    })

    return res.status(201).json({ message: 'Payment registered.', payment, paymentStatus })
  } catch (err) {
    console.error('[registerInvoicePayment]', err)
    if (err.status) return res.status(err.status).json({ message: err.message })
    return res.status(500).json({ message: 'Internal server error.' })
  }
}
