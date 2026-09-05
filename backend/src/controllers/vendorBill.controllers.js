import db from '../libs/db.js'

const BILL_INCLUDE = {
  po: {
    include: {
      vendor: true,
      items: { include: { product: true, analyticAccount: true } },
    },
  },
  payments: { include: { journal: true } },
}

export async function getAllVendorBills(req, res) {
  try {
    const bills = await db.vendorBill.findMany({
      include: BILL_INCLUDE,
      orderBy: { billDate: 'desc' },
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

    const bill = await db.vendorBill.findUnique({ where: { id }, include: BILL_INCLUDE })
    if (!bill) return res.status(404).json({ message: 'Vendor bill not found.' })
    return res.status(200).json(bill)
  } catch (err) {
    console.error('[getVendorBillById]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

/**
 * POST /api/vendor-bills/:id/payments
 *
 * Registers a payment against a vendor bill.
 * Posts Dr Creditors / Cr Bank or Cash journal entry.
 * Updates paymentStatus to PARTIAL or PAID.
 */
export async function registerBillPayment(req, res) {
  try {
    const billId = parseInt(req.params.id, 10)
    if (isNaN(billId)) return res.status(400).json({ message: 'Invalid vendor bill ID.' })

    const { journalId, amount, date } = req.body

    const bill = await db.vendorBill.findUnique({
      where: { id: billId },
      include: { payments: true },
    })
    if (!bill) return res.status(404).json({ message: 'Vendor bill not found.' })
    if (bill.paymentStatus === 'PAID') return res.status(400).json({ message: 'This bill has already been fully paid.' })

    const journal = await db.journal.findUnique({ where: { id: journalId } })
    if (!journal) return res.status(404).json({ message: 'Journal not found.' })
    if (journal.type !== 'BANK' && journal.type !== 'CASH') {
      return res.status(400).json({ message: 'Payment journal must be of type BANK or CASH.' })
    }

    const totalPaid = bill.payments.reduce((s, p) => s + Number(p.amount), 0)
    const remaining = Number(bill.amount) - totalPaid
    if (amount > remaining) {
      return res.status(400).json({ message: `Amount exceeds remaining balance of ${remaining}.` })
    }

    const newTotalPaid   = totalPaid + amount
    const paymentStatus  = newTotalPaid >= Number(bill.amount) ? 'PAID' : 'PARTIAL'

    const payment = await db.$transaction(async (tx) => {
      const pay = await tx.payment.create({
        data: {
          direction:    'SEND',
          journalId,
          amount,
          date: date ? new Date(date) : undefined,
          vendorBillId: billId,
        },
      })

      await tx.vendorBill.update({
        where: { id: billId },
        data:  { paymentStatus },
      })

      return pay
    })

    return res.status(201).json({ message: 'Payment registered.', payment, paymentStatus })
  } catch (err) {
    console.error('[registerBillPayment]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}
