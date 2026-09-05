import prisma from '../db/prisma.js'

export async function getAllPurchaseOrders(req, res) {
  try {
    const orders = await prisma.purchaseOrder.findMany({
      include: { vendor: true, items: { include: { product: true } }, vendorBill: true },
      orderBy: { orderDate: 'desc' },
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

    const order = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: { vendor: true, items: { include: { product: true } }, vendorBill: true },
    })
    if (!order) return res.status(404).json({ message: 'Purchase order not found.' })
    return res.status(200).json(order)
  } catch (err) {
    console.error('[getPurchaseOrderById]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function createPurchaseOrder(req, res) {
  try {
    const { vendorId, items } = req.body

    const vendor = await prisma.contact.findUnique({ where: { id: vendorId } })
    if (!vendor) return res.status(404).json({ message: 'Vendor not found.' })
    if (vendor.type === 'CUSTOMER') return res.status(400).json({ message: 'Contact is not a vendor.' })

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } })
      if (!product) return res.status(404).json({ message: `Product ${item.productId} not found.` })
    }

    const order = await prisma.purchaseOrder.create({
      data: {
        vendorId,
        items: { create: items.map((i) => ({ productId: i.productId, quantity: i.quantity, unitPrice: i.unitPrice })) },
      },
      include: { vendor: true, items: { include: { product: true } } },
    })
    return res.status(201).json({ message: 'Purchase order created successfully.', order })
  } catch (err) {
    console.error('[createPurchaseOrder]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function deletePurchaseOrder(req, res) {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid purchase order ID.' })

    const order = await prisma.purchaseOrder.findUnique({ where: { id }, include: { vendorBill: true } })
    if (!order) return res.status(404).json({ message: 'Purchase order not found.' })
    if (order.vendorBill) return res.status(400).json({ message: 'Cannot delete — a vendor bill already exists for this order.' })

    await prisma.purchaseOrderItem.deleteMany({ where: { purchaseOrderId: id } })
    await prisma.purchaseOrder.delete({ where: { id } })
    return res.status(200).json({ message: 'Purchase order deleted successfully.' })
  } catch (err) {
    console.error('[deletePurchaseOrder]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}
