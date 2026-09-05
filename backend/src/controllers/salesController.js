import prisma from '../db/prisma.js'

export async function getAllSalesOrders(req, res) {
  try {
    const orders = await prisma.salesOrder.findMany({
      include: { customer: true, items: { include: { product: true } }, invoice: true },
      orderBy: { orderDate: 'desc' },
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

    const order = await prisma.salesOrder.findUnique({
      where: { id },
      include: { customer: true, items: { include: { product: true } }, invoice: true },
    })
    if (!order) return res.status(404).json({ message: 'Sales order not found.' })
    return res.status(200).json(order)
  } catch (err) {
    console.error('[getSalesOrderById]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function createSalesOrder(req, res) {
  try {
    const { customerId, items } = req.body

    const customer = await prisma.contact.findUnique({ where: { id: customerId } })
    if (!customer) return res.status(404).json({ message: 'Customer not found.' })
    if (customer.type === 'VENDOR') return res.status(400).json({ message: 'Contact is not a customer.' })

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } })
      if (!product) return res.status(404).json({ message: `Product ${item.productId} not found.` })
    }

    const order = await prisma.salesOrder.create({
      data: {
        customerId,
        items: {
          create: items.map((i) => ({
            productId: i.productId,
            quantity:  i.quantity,
            unitPrice: i.unitPrice,
            tax:       i.tax ?? 0,
          })),
        },
      },
      include: { customer: true, items: { include: { product: true } } },
    })
    return res.status(201).json({ message: 'Sales order created successfully.', order })
  } catch (err) {
    console.error('[createSalesOrder]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function deleteSalesOrder(req, res) {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid sales order ID.' })

    const order = await prisma.salesOrder.findUnique({ where: { id }, include: { invoice: true } })
    if (!order) return res.status(404).json({ message: 'Sales order not found.' })
    if (order.invoice) return res.status(400).json({ message: 'Cannot delete — an invoice already exists for this order.' })

    await prisma.salesOrderItem.deleteMany({ where: { salesOrderId: id } })
    await prisma.salesOrder.delete({ where: { id } })
    return res.status(200).json({ message: 'Sales order deleted successfully.' })
  } catch (err) {
    console.error('[deleteSalesOrder]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}
