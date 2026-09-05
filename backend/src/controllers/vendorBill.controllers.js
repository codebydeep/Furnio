import db from '../libs/db.js'
import { resolvePaymentJournal, postBillPaymentEntry } from '../utils/ledger.js'

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

export async function registerBillPayment(req, res) {
  try {
    const billId = parseInt(req.params.id, 10)
    if (isNaN(billId)) return res.status(400).json({ message: 'Invalid vendor bill ID.' })

    const { journalId, journalType, amount, date } = req.body

    const bill = await db.vendorBill.findUnique({
      where: { id: billId },
      include: { payments: true, po: true },
    })
    if (!bill) return res.status(404).json({ message: 'Vendor bill not found.' })
    if (bill.paymentStatus === 'PAID') return res.status(400).json({ message: 'This bill has already been fully paid.' })

    const totalPaid = bill.payments.reduce((s, p) => s + Number(p.amount), 0)
    const remaining = Number(bill.amount) - totalPaid
    if (amount > remaining + 0.01) {
      return res.status(400).json({ message: `Amount exceeds remaining balance of ${remaining.toFixed(2)}.` })
    }

    const newTotalPaid  = totalPaid + amount
    const paymentStatus = newTotalPaid >= Number(bill.amount) - 0.01 ? 'PAID' : 'PARTIAL'

    const payment = await db.$transaction(async (tx) => {
      const journal = await resolvePaymentJournal(tx, { journalId, journalType })
      const entry = await postBillPaymentEntry(tx, {
        partnerId: bill.po.vendorId,
        createdBy: req.user.id,
        amount,
        journal,
        date,
      })

      const pay = await tx.payment.create({
        data: {
          direction:     'SEND',
          journalId:     journal.id,
          amount,
          date: date ? new Date(date) : undefined,
          vendorBillId:  billId,
          journalEntryId: entry.id,
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
    if (err.status) return res.status(err.status).json({ message: err.message })
    return res.status(500).json({ message: 'Internal server error.' })
  }
}
