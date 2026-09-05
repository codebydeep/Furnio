import prisma from '../db/prisma.js'

export async function getAllPayments(req, res) {
  try {
    const payments = await prisma.payment.findMany({
      include: { vendorBill: true, invoice: true },
      orderBy: { paymentDate: 'desc' },
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

    const payment = await prisma.payment.findUnique({ where: { id }, include: { vendorBill: true, invoice: true } })
    if (!payment) return res.status(404).json({ message: 'Payment not found.' })
    return res.status(200).json(payment)
  } catch (err) {
    console.error('[getPaymentById]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function createPayment(req, res) {
  try {
    const { amount, method, vendorBillId, invoiceId } = req.body

    if (vendorBillId) {
      const bill = await prisma.vendorBill.findUnique({ where: { id: vendorBillId } })
      if (!bill) return res.status(404).json({ message: 'Vendor bill not found.' })
    }

    if (invoiceId) {
      const invoice = await prisma.customerInvoice.findUnique({ where: { id: invoiceId } })
      if (!invoice) return res.status(404).json({ message: 'Customer invoice not found.' })
    }

    const payment = await prisma.payment.create({
      data: {
        amount,
        method,
        vendorBillId: vendorBillId ?? null,
        invoiceId:    invoiceId    ?? null,
      },
      include: { vendorBill: true, invoice: true },
    })
    return res.status(201).json({ message: 'Payment recorded successfully.', payment })
  } catch (err) {
    console.error('[createPayment]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function deletePayment(req, res) {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid payment ID.' })

    const existing = await prisma.payment.findUnique({ where: { id } })
    if (!existing) return res.status(404).json({ message: 'Payment not found.' })

    await prisma.payment.delete({ where: { id } })
    return res.status(200).json({ message: 'Payment deleted successfully.' })
  } catch (err) {
    console.error('[deletePayment]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}
