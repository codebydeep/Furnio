import db from '../libs/db.js'

export async function getAllPayments(req, res) {
  try {
    const { from, to } = req.query
    const where = {}
    if (from || to) {
      where.date = {}
      if (from) where.date.gte = new Date(from)
      if (to)   where.date.lte = new Date(to + 'T23:59:59.999Z')
    }

    const payments = await db.payment.findMany({
      where,
      include: {
        journal:         true,
        vendorBill:      { include: { po: { include: { vendor: true } } } },
        customerInvoice: { include: { so: { include: { customer: true } } } },
      },
      orderBy: { date: 'desc' },
    })
    return res.status(200).json(payments)
  } catch (err) {
    console.error('[getAllPayments]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function getPaymentById(req, res) {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid payment ID.' })

    const payment = await db.payment.findUnique({
      where: { id },
      include: {
        journal:         true,
        vendorBill:      { include: { po: { include: { vendor: true } } } },
        customerInvoice: { include: { so: { include: { customer: true } } } },
      },
    })
    if (!payment) return res.status(404).json({ message: 'Payment not found.' })
    return res.status(200).json(payment)
  } catch (err) {
    console.error('[getPaymentById]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}
