import prisma from '../db/prisma.js'

export async function getAllVendorBills(req, res) {
  try {
    const bills = await prisma.vendorBill.findMany({
      include: { vendor: true, purchaseOrder: { include: { items: { include: { product: true } } } }, payments: true },
      orderBy: { invoiceDate: 'desc' },
    })
    return res.status(200).json(bills)
  } catch (err) {
    console.error('[getAllVendorBills]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function getVendorBillById(req, res) {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid vendor bill ID.' })

    const bill = await prisma.vendorBill.findUnique({
      where: { id },
      include: { vendor: true, purchaseOrder: { include: { items: { include: { product: true } } } }, payments: true },
    })
    if (!bill) return res.status(404).json({ message: 'Vendor bill not found.' })
    return res.status(200).json(bill)
  } catch (err) {
    console.error('[getVendorBillById]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function createVendorBill(req, res) {
  try {
    const { purchaseOrderId, invoiceDate, dueDate } = req.body

    const order = await prisma.purchaseOrder.findUnique({
      where: { id: purchaseOrderId },
      include: { items: true, vendorBill: true },
    })
    if (!order) return res.status(404).json({ message: 'Purchase order not found.' })
    if (order.vendorBill) return res.status(409).json({ message: 'A vendor bill already exists for this purchase order.' })

    const totalAmount = order.items.reduce((sum, i) => sum + Number(i.quantity) * Number(i.unitPrice), 0)

    const bill = await prisma.vendorBill.create({
      data: {
        purchaseOrderId,
        vendorId:    order.vendorId,
        invoiceDate: new Date(invoiceDate),
        dueDate:     new Date(dueDate),
        totalAmount,
      },
      include: { vendor: true, purchaseOrder: true },
    })
    return res.status(201).json({ message: 'Vendor bill created successfully.', bill })
  } catch (err) {
    console.error('[createVendorBill]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function deleteVendorBill(req, res) {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid vendor bill ID.' })

    const bill = await prisma.vendorBill.findUnique({ where: { id }, include: { payments: true } })
    if (!bill) return res.status(404).json({ message: 'Vendor bill not found.' })
    if (bill.payments.length > 0) return res.status(400).json({ message: 'Cannot delete — payments exist for this bill.' })

    await prisma.vendorBill.delete({ where: { id } })
    return res.status(200).json({ message: 'Vendor bill deleted successfully.' })
  } catch (err) {
    console.error('[deleteVendorBill]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}
