import prisma from '../db/prisma.js'
import { authorizeSelf } from '../middleware/authorize.js'

export async function getAllInvoices(req, res) {
  try {
    const invoices = await prisma.customerInvoice.findMany({
      include: { customer: true, salesOrder: { include: { items: { include: { product: true } } } }, payments: true },
      orderBy: { invoiceDate: 'desc' },
    })
    return res.status(200).json(invoices)
  } catch (err) {
    console.error('[getAllInvoices]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function getInvoiceById(req, res) {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid invoice ID.' })

    const invoice = await prisma.customerInvoice.findUnique({
      where: { id },
      include: { customer: true, salesOrder: { include: { items: { include: { product: true } } } }, payments: true },
    })
    if (!invoice) return res.status(404).json({ message: 'Invoice not found.' })
    return res.status(200).json(invoice)
  } catch (err) {
    console.error('[getInvoiceById]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function createInvoice(req, res) {
  try {
    const { salesOrderId, invoiceDate, dueDate } = req.body

    const order = await prisma.salesOrder.findUnique({
      where: { id: salesOrderId },
      include: { items: true, invoice: true },
    })
    if (!order) return res.status(404).json({ message: 'Sales order not found.' })
    if (order.invoice) return res.status(409).json({ message: 'An invoice already exists for this sales order.' })

    const totalAmount = order.items.reduce((sum, i) => {
      const base = Number(i.quantity) * Number(i.unitPrice)
      const tax  = base * (Number(i.tax) / 100)
      return sum + base + tax
    }, 0)

    const invoice = await prisma.customerInvoice.create({
      data: {
        salesOrderId,
        customerId:  order.customerId,
        invoiceDate: new Date(invoiceDate),
        dueDate:     dueDate ? new Date(dueDate) : null,
        totalAmount,
      },
      include: { customer: true, salesOrder: true },
    })
    return res.status(201).json({ message: 'Invoice created successfully.', invoice })
  } catch (err) {
    console.error('[createInvoice]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function getMyInvoices(req, res) {
  try {
    const contactId = req.user.contactId
    if (!contactId) return res.status(403).json({ message: 'No linked contact for this user account.' })

    const invoices = await prisma.customerInvoice.findMany({
      where: { customerId: contactId },
      include: { salesOrder: { include: { items: { include: { product: true } } } }, payments: true },
      orderBy: { invoiceDate: 'desc' },
    })
    return res.status(200).json(invoices)
  } catch (err) {
    console.error('[getMyInvoices]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function deleteInvoice(req, res) {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid invoice ID.' })

    const invoice = await prisma.customerInvoice.findUnique({ where: { id }, include: { payments: true } })
    if (!invoice) return res.status(404).json({ message: 'Invoice not found.' })
    if (invoice.payments.length > 0) return res.status(400).json({ message: 'Cannot delete — payments exist for this invoice.' })

    await prisma.customerInvoice.delete({ where: { id } })
    return res.status(200).json({ message: 'Invoice deleted successfully.' })
  } catch (err) {
    console.error('[deleteInvoice]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export const invoiceOwnerCheck = authorizeSelf(async (req) => {
  const id = parseInt(req.params.id, 10)
  const invoice = await prisma.customerInvoice.findUnique({ where: { id } })
  return invoice?.customerId ?? null
})
