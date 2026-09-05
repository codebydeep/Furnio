import db from '../libs/db.js'
import { generateDocNumber } from '../utils/generateDocNumber.js'
import { postCustomerInvoiceEntry } from '../utils/ledger.js'

const SO_INCLUDE = {
  customer: true,
  items: { include: { product: true, analyticAccount: true } },
  invoice: true,
}

export async function getAllSalesOrders(req, res) {
  try {
    const orders = await db.salesOrder.findMany({
      include: SO_INCLUDE,
      orderBy: { soDate: 'desc' },
    })
    return res.status(200).json(orders)
  } catch (err) {
    console.error('[getAllSalesOrders]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function getSalesOrderById(req, res) {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid sales order ID.' })

    const order = await db.salesOrder.findUnique({ where: { id }, include: SO_INCLUDE })
    if (!order) return res.status(404).json({ message: 'Sales order not found.' })
    return res.status(200).json(order)
  } catch (err) {
    console.error('[getSalesOrderById]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function createSalesOrder(req, res) {
  try {
    const { customerId, soDate, items } = req.body

    const customer = await db.contact.findUnique({ where: { id: customerId } })
    if (!customer) return res.status(404).json({ message: 'Customer not found.' })
    if (customer.type === 'VENDOR') return res.status(400).json({ message: 'Contact is not a customer.' })
    if (customer.archived) return res.status(400).json({ message: 'Customer is archived.' })

    for (const item of items) {
      const product = await db.product.findUnique({ where: { id: item.productId } })
      if (!product) return res.status(404).json({ message: `Product ID ${item.productId} not found.` })
    }

    const soNumber = await generateDocNumber('SalesOrder', 'SO')

    const order = await db.salesOrder.create({
      data: {
        soNumber,
        customerId,
        soDate: soDate ? new Date(soDate) : undefined,
        items: {
          create: items.map(i => ({
            productId:         i.productId,
            analyticAccountId: i.analyticAccountId ?? null,
            quantity:          i.quantity,
            unitPrice:         i.unitPrice,
            taxRate:           i.taxRate ?? 0,
          })),
        },
      },
      include: SO_INCLUDE,
    })
    return res.status(201).json({ message: 'Sales order created successfully.', order })
  } catch (err) {
    console.error('[createSalesOrder]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function confirmSalesOrder(req, res) {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid sales order ID.' })

    const order = await db.salesOrder.findUnique({ where: { id } })
    if (!order) return res.status(404).json({ message: 'Sales order not found.' })
    if (order.status !== 'DRAFT') return res.status(400).json({ message: `Cannot confirm a SO with status: ${order.status}.` })

    const updated = await db.salesOrder.update({
      where: { id },
      data:  { status: 'CONFIRMED' },
      include: SO_INCLUDE,
    })
    return res.status(200).json({ message: 'Sales order confirmed.', order: updated })
  } catch (err) {
    console.error('[confirmSalesOrder]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

/**
 * POST /api/sales-orders/:id/create-invoice
 *
 * Creates a CustomerInvoice from the SO lines, sets SO status DONE.
 * Posts Dr Debtors / Cr Sales Income + Cr Tax Payable.
 */
export async function createInvoiceFromSO(req, res) {
  try {
    const soId = parseInt(req.params.id, 10)
    if (isNaN(soId)) return res.status(400).json({ message: 'Invalid sales order ID.' })

    const order = await db.salesOrder.findUnique({
      where: { id: soId },
      include: { items: true, invoice: true },
    })
    if (!order) return res.status(404).json({ message: 'Sales order not found.' })
    if (order.invoice) return res.status(409).json({ message: 'An invoice already exists for this sales order.' })
    if (order.status !== 'CONFIRMED') {
      return res.status(400).json({ message: 'Confirm the sales order before creating an invoice.' })
    }

    const baseAmount = order.items.reduce(
      (s, i) => s + Number(i.quantity) * Number(i.unitPrice),
      0
    )
    const taxAmount = order.items.reduce((s, i) => {
      const base = Number(i.quantity) * Number(i.unitPrice)
      return s + base * (Number(i.taxRate) / 100)
    }, 0)
    const amount = baseAmount + taxAmount
    const analyticAccountId = order.items.find(i => i.analyticAccountId)?.analyticAccountId ?? null

    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 30)

    const invoice = await db.$transaction(async (tx) => {
      const entry = await postCustomerInvoiceEntry(tx, {
        partnerId: order.customerId,
        createdBy: req.user.id,
        baseAmount,
        taxAmount,
        analyticAccountId,
        date: new Date(),
      })

      const inv = await tx.customerInvoice.create({
        data: {
          soId,
          dueDate,
          amount,
          journalEntryId: entry.id,
        },
      })

      await tx.salesOrder.update({
        where: { id: soId },
        data:  { status: 'DONE' },
      })

      return inv
    })

    const result = await db.customerInvoice.findUnique({
      where: { id: invoice.id },
      include: {
        so: { include: { customer: true, items: { include: { product: true } } } },
        payments: true,
      },
    })

    return res.status(201).json({ message: 'Customer invoice created from sales order.', invoice: result })
  } catch (err) {
    console.error('[createInvoiceFromSO]', err)
    if (err.status) return res.status(err.status).json({ message: err.message })
    return res.status(500).json({ message: 'Internal server error.' })
  }
}
