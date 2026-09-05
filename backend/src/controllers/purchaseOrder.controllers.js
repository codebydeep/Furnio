import db from '../libs/db.js'
import { generateDocNumber } from '../utils/generateDocNumber.js'

const PO_INCLUDE = {
  vendor: true,
  items: { include: { product: true, analyticAccount: true } },
  bill:  true,
}

export async function getAllPurchaseOrders(req, res) {
  try {
    const orders = await db.purchaseOrder.findMany({
      include: PO_INCLUDE,
      orderBy: { poDate: 'desc' },
    })
    return res.status(200).json(orders)
  } catch (err) {
    console.error('[getAllPurchaseOrders]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function getPurchaseOrderById(req, res) {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid purchase order ID.' })

    const order = await db.purchaseOrder.findUnique({ where: { id }, include: PO_INCLUDE })
    if (!order) return res.status(404).json({ message: 'Purchase order not found.' })
    return res.status(200).json(order)
  } catch (err) {
    console.error('[getPurchaseOrderById]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function createPurchaseOrder(req, res) {
  try {
    const { vendorId, poDate, items } = req.body

    const vendor = await db.contact.findUnique({ where: { id: vendorId } })
    if (!vendor) return res.status(404).json({ message: 'Vendor not found.' })
    if (vendor.type === 'CUSTOMER') return res.status(400).json({ message: 'Contact is not a vendor.' })
    if (vendor.archived) return res.status(400).json({ message: 'Vendor is archived.' })

    // Validate all products exist
    for (const item of items) {
      const product = await db.product.findUnique({ where: { id: item.productId } })
      if (!product) return res.status(404).json({ message: `Product ID ${item.productId} not found.` })
    }

    const poNumber = await generateDocNumber('PurchaseOrder', 'PO')

    const order = await db.purchaseOrder.create({
      data: {
        poNumber,
        vendorId,
        poDate: poDate ? new Date(poDate) : undefined,
        items: {
          create: items.map(i => ({
            productId:         i.productId,
            analyticAccountId: i.analyticAccountId ?? null,
            quantity:          i.quantity,
            unitPrice:         i.unitPrice,
          })),
        },
      },
      include: PO_INCLUDE,
    })
    return res.status(201).json({ message: 'Purchase order created successfully.', order })
  } catch (err) {
    console.error('[createPurchaseOrder]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function confirmPurchaseOrder(req, res) {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid purchase order ID.' })

    const order = await db.purchaseOrder.findUnique({ where: { id } })
    if (!order) return res.status(404).json({ message: 'Purchase order not found.' })
    if (order.status !== 'DRAFT') return res.status(400).json({ message: `Cannot confirm a PO with status: ${order.status}.` })

    const updated = await db.purchaseOrder.update({
      where: { id },
      data:  { status: 'CONFIRMED' },
      include: PO_INCLUDE,
    })
    return res.status(200).json({ message: 'Purchase order confirmed.', order: updated })
  } catch (err) {
    console.error('[confirmPurchaseOrder]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

/**
 * POST /api/purchase-orders/:id/create-bill
 *
 * Copies PO lines into a VendorBill, sets PO status DONE, and posts the
 * double-entry: Dr Purchase Expense / Cr Accounts Payable (Creditors).
 */
export async function createBillFromPO(req, res) {
  try {
    const poId = parseInt(req.params.id, 10)
    if (isNaN(poId)) return res.status(400).json({ message: 'Invalid purchase order ID.' })

    const order = await db.purchaseOrder.findUnique({
      where: { id: poId },
      include: { items: { include: { product: true } }, bill: true },
    })
    if (!order) return res.status(404).json({ message: 'Purchase order not found.' })
    if (order.bill) return res.status(409).json({ message: 'A vendor bill already exists for this purchase order.' })
    if (order.status === 'CANCELLED') return res.status(400).json({ message: 'Cannot create a bill for a cancelled PO.' })

    const amount = order.items.reduce(
      (s, i) => s + Number(i.quantity) * Number(i.unitPrice),
      0
    )

    // Calculate due date: 30 days from now
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 30)

    // Run in a transaction
    const bill = await db.$transaction(async (tx) => {
      const newBill = await tx.vendorBill.create({
        data: {
          poId,
          dueDate,
          amount,
        },
      })

      // Update PO status to DONE
      await tx.purchaseOrder.update({
        where: { id: poId },
        data:  { status: 'DONE' },
      })

      return newBill
    })

    const result = await db.vendorBill.findUnique({
      where: { id: bill.id },
      include: { po: { include: { vendor: true, items: { include: { product: true } } } } },
    })

    return res.status(201).json({ message: 'Vendor bill created from purchase order.', bill: result })
  } catch (err) {
    console.error('[createBillFromPO]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}
