import db from '../libs/db.js'

/**
 * GET /api/dashboard/summary
 *
 * Role-scoped counts for the dashboard tile grid.
 * Contact role only sees their own data.
 */
export async function getDashboardSummary(req, res) {
  try {
    const { role, contactId } = req.user

    if (role === 'USER') {
      // Contact portal: own invoices + bills
      const soIds = await db.salesOrder.findMany({
        where:  { customerId: contactId },
        select: { id: true },
      })
      const poIds = await db.purchaseOrder.findMany({
        where:  { vendorId: contactId },
        select: { id: true },
      })

      const [unpaidInvoices, unpaidBills] = await Promise.all([
        db.customerInvoice.count({
          where: {
            soId:          { in: soIds.map(s => s.id) },
            paymentStatus: { not: 'PAID' },
          },
        }),
        db.vendorBill.count({
          where: {
            poId:          { in: poIds.map(p => p.id) },
            paymentStatus: { not: 'PAID' },
          },
        }),
      ])

      return res.status(200).json({ unpaidInvoices, unpaidBills })
    }

    // Admin / Accountant: full counts
    const [
      openSalesOrders,
      unpaidInvoices,
      openPurchaseOrders,
      unpaidBills,
      totalContacts,
      totalProducts,
    ] = await Promise.all([
      db.salesOrder.count({ where: { status: { in: ['DRAFT', 'CONFIRMED'] } } }),
      db.customerInvoice.count({ where: { paymentStatus: { not: 'PAID' } } }),
      db.purchaseOrder.count({ where: { status: { in: ['DRAFT', 'CONFIRMED'] } } }),
      db.vendorBill.count({ where: { paymentStatus: { not: 'PAID' } } }),
      db.contact.count({ where: { archived: false } }),
      db.product.count({ where: { archived: false } }),
    ])

    return res.status(200).json({
      openSalesOrders,
      unpaidInvoices,
      openPurchaseOrders,
      unpaidBills,
      totalContacts,
      totalProducts,
    })
  } catch (err) {
    console.error('[getDashboardSummary]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}
