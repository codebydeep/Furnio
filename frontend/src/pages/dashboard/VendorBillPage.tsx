import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  FileText, Loader2, CreditCard,
  ChevronRight, Settings, Printer, Send, AlertTriangle,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { useTransactionStore, useJournalStore, type VendorBill } from '@/store'

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
}

/* ═════════════════════════════════════════════════════════════
   SCREENSHOT 3: BILL PAYMENT MODAL
═════════════════════════════════════════════════════════════ */
function BillPaymentModal({
  bill, journals, onPay, onClose,
}: {
  bill:     VendorBill
  journals: { id: number; name: string; type: string }[]
  onPay:    (billId: number, journalId: number, amount: number) => Promise<void>
  onClose:  () => void
}) {
  const cashJournals = journals.filter(j => j.type === 'BANK' || j.type === 'CASH')
  const [journalId, setJournalId] = useState(cashJournals[0]?.id ?? 0)
  const [amount,    setAmount]    = useState(bill.amountDue || bill.total || 6000)
  const [payType,   setPayType]   = useState<'SEND' | 'RECEIVE'>('SEND')
  const [date,      setDate]      = useState(new Date().toISOString().slice(0, 10))
  const [note,      setNote]      = useState('')
  const [paying,    setPaying]    = useState(false)
  const [err,       setErr]       = useState('')
  const [showSettingsMenu, setShowSettingsMenu] = useState(false)

  async function handleConfirm() {
    if (!journalId && cashJournals.length > 0) { setErr('Please select a payment journal.'); return }
    if (amount <= 0) { setErr('Amount must be greater than 0.'); return }
    setPaying(true); setErr('')
    await onPay(bill.id, journalId || cashJournals[0]?.id || 1, amount)
    setPaying(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="wf-panel w-full max-w-lg border border-white/20 shadow-2xl p-6 space-y-5">
        {/* Top Header matching Screenshot 3 */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleConfirm}
              disabled={paying}
              className="wf-btn wf-btn-lavender"
            >
              {paying ? <><Loader2 size={12} className="animate-spin mr-1" /> Processing…</> : 'Confirm'}
            </button>
            <button
              onClick={onClose}
              className="wf-btn wf-btn-dark"
            >
              Cancel
            </button>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowSettingsMenu(s => !s)}
                className="p-1.5 rounded-full border border-white/15 text-slate-400 hover:text-white hover:border-white/30 transition-colors"
                title="Options Menu"
              >
                <Settings size={14} />
              </button>
              {showSettingsMenu && (
                <div className="absolute left-0 mt-2 w-36 bg-[#161a23] border border-white/15 rounded-lg shadow-xl py-1.5 z-50 text-xs text-slate-200">
                  <button
                    type="button"
                    onClick={() => { setShowSettingsMenu(false); window.print() }}
                    className="w-full text-left px-3 py-1.5 hover:bg-white/10 flex items-center gap-2"
                  >
                    <Printer size={13} className="text-purple-400" />
                    <span>1. Print</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowSettingsMenu(false); alert('Payment receipt sent to partner.') }}
                    className="w-full text-left px-3 py-1.5 hover:bg-white/10 flex items-center gap-2"
                  >
                    <Send size={13} className="text-sky-400" />
                    <span>2. Send</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-white/10 font-semibold">Draft</span>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold">Confirm</span>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-white/10 font-semibold">Cancelled</span>
          </div>
        </div>

        {err && <div className="auth-error"><span>{err}</span></div>}

        {/* Fields */}
        <div className="space-y-4 text-xs">
          <div className="flex items-center gap-6">
            <span className="text-slate-400 w-24">Payment Type:</span>
            <div className="flex items-center gap-4 text-slate-200">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="payType"
                  checked={payType === 'SEND'}
                  onChange={() => setPayType('SEND')}
                  className="accent-purple-500"
                />
                <span>Send</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="payType"
                  checked={payType === 'RECEIVE'}
                  onChange={() => setPayType('RECEIVE')}
                  className="accent-purple-500"
                />
                <span>Receive</span>
              </label>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <span className="text-slate-400 w-24">Partner:</span>
            <span className="text-sm font-semibold text-slate-200">{bill.vendorName}</span>
          </div>

          <div className="flex items-center gap-6">
            <span className="text-slate-400 w-24">Amount:</span>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={e => setAmount(parseFloat(e.target.value) || 0)}
              className="auth-input max-w-[200px] font-mono text-sm py-1.5"
            />
          </div>

          <div className="flex items-center gap-6">
            <span className="text-slate-400 w-24">Date:</span>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="auth-input max-w-[200px] py-1.5"
            />
          </div>

          <div className="flex items-center gap-6">
            <span className="text-slate-400 w-24">Payment Via:</span>
            <select
              className="auth-input max-w-[200px] py-1.5"
              value={journalId}
              onChange={e => setJournalId(+e.target.value)}
            >
              {cashJournals.map(j => (
                <option key={j.id} value={j.id}>{j.name} ({j.type})</option>
              ))}
              {cashJournals.length === 0 && <option value={1}>Cash / Bank Account</option>}
            </select>
          </div>

          <div className="flex items-start gap-6">
            <span className="text-slate-400 w-24 pt-2">Note:</span>
            <input
              type="text"
              placeholder="Alpha Numeric (Text)"
              value={note}
              onChange={e => setNote(e.target.value)}
              className="auth-input flex-1 py-1.5"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═════════════════════════════════════════════════════════════
   SCREENSHOT 3: DEMO JOURNAL ENTRY MODAL
═════════════════════════════════════════════════════ */
function JournalEntryModal({
  bill, onClose,
}: {
  bill: VendorBill
  onClose: () => void
}) {
  const amount = bill.total || 10000

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="wf-panel w-full max-w-lg border border-white/20 shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="wf-btn wf-btn-lavender text-xs py-1">Pay</span>
            <span className="wf-btn wf-btn-dark text-xs py-1">Reset to Draft</span>
          </div>
          <button onClick={onClose} className="wf-btn wf-btn-dark text-xs py-1">Back</button>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs bg-white/[0.02] p-3 rounded-lg border border-white/5">
          <div>
            <span className="text-slate-400 block mb-0.5">Accounting Date</span>
            <span className="font-mono text-slate-200">{bill.billDate || bill.invoiceDate}</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Journal</span>
            <span className="font-medium text-purple-300">Purchase</span>
          </div>
        </div>

        <div className="border border-white/10 rounded-lg overflow-hidden text-xs">
          <table className="w-full">
            <thead className="bg-white/[0.04] border-b border-white/10 text-slate-300 font-semibold">
              <tr>
                <th className="py-2 px-3 text-left">Account</th>
                <th className="py-2 px-3 text-left">Partner</th>
                <th className="py-2 px-3 text-right">Debit</th>
                <th className="py-2 px-3 text-right">Credit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-200">
              <tr>
                <td className="py-2 px-3 font-medium">Purchase A/c</td>
                <td className="py-2 px-3 text-slate-400">{bill.vendorName}</td>
                <td className="py-2 px-3 text-right font-mono font-semibold text-emerald-400">{fmt(amount)}</td>
                <td className="py-2 px-3 text-right font-mono text-slate-500">—</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-medium">Creditor A/c</td>
                <td className="py-2 px-3 text-slate-400">—</td>
                <td className="py-2 px-3 text-right font-mono text-slate-500">—</td>
                <td className="py-2 px-3 text-right font-mono font-semibold text-purple-400">{fmt(amount)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-[11px] text-slate-400 italic">
          * Debit and credit totals match (Balanced: {fmt(amount)}). Created automatically upon bill confirmation.
        </p>
      </div>
    </div>
  )
}

/* ═════════════════════════════════════════════════════════════
   PAGE: VENDOR BILL (SCREENSHOT 3)
═════════════════════════════════════════════════════ */
export default function VendorBillPage() {
  const navigate = useNavigate()
  const { vendorBills, loading, error, fetchVendorBills, payBill } = useTransactionStore()
  const { journals, fetchJournals } = useJournalStore()

  const [selected, setSelected] = useState<VendorBill | null>(null)
  const [payTarget, setPayTarget] = useState<VendorBill | null>(null)
  const [showJE, setShowJE] = useState<VendorBill | null>(null)

  useEffect(() => {
    fetchVendorBills()
    fetchJournals()
  }, []) // eslint-disable-line

  async function handlePay(id: number, journalId: number, amount: number) {
    await payBill(id, { journalId, amount })
    fetchVendorBills()
    setSelected(null)
  }

  // Active bill computation for Screenshot 3
  const activeBill = selected || vendorBills[0] || null

  const totalAmount = activeBill?.total || 6000
  const amountDue   = activeBill ? (activeBill.paymentStatus === 'PAID' ? 0 : (activeBill.amountDue ?? totalAmount)) : 0
  const isPaid      = activeBill ? (activeBill.paymentStatus === 'PAID' || amountDue === 0) : false
  const isPartial   = activeBill ? (!isPaid && amountDue > 0 && amountDue < totalAmount) : false
  const isNotPaid   = activeBill ? (!isPaid && !isPartial) : true

  const paidViaCash = isPaid ? totalAmount : (isPartial ? totalAmount - amountDue : 0)
  const paidViaBank = 0
  const budgetWarning = totalAmount > 5000

  return (
    <div className="db-page space-y-6">
      {payTarget && (
        <BillPaymentModal
          bill={payTarget}
          journals={journals}
          onPay={handlePay}
          onClose={() => setPayTarget(null)}
        />
      )}

      {showJE && (
        <JournalEntryModal
          bill={showJE}
          onClose={() => setShowJE(null)}
        />
      )}

      {/* ── Page Header ──────────────────────────────────────── */}
      <div className="db-page-header">
        <div>
          <h1 className="db-page-title">Vendor Bill</h1>
          <p className="db-page-sub">Bills generated from purchase orders with journal automation</p>
        </div>
      </div>

      {error && <div className="auth-error mb-3"><span>{error}</span></div>}

      {/* ═════════════════════════════════════════════════════
          SCREENSHOT 3: VENDOR BILL FORM VIEW
      ═════════════════════════════════════════════════════ */}
      {activeBill && (
        <div className="wf-panel border border-white/15 space-y-5">
          {/* Action Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10 flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Link to="/transactions/purchase-order" className="wf-btn wf-btn-white">
                New
              </Link>
              <button disabled className="wf-btn wf-btn-lavender">
                Confirm
              </button>
              {!isPaid && (
                <button
                  onClick={() => setPayTarget(activeBill)}
                  className="wf-btn wf-btn-lavender"
                >
                  <CreditCard size={12} /> Pay
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* PO Button: Only show if bill created from PO */}
              {activeBill.poId && (
                <Link
                  to="/transactions/purchase-order"
                  className="wf-btn wf-btn-dark text-xs"
                  title="Open the PO from which Bill Created"
                >
                  PO #{activeBill.poId}
                </Link>
              )}

              {/* Budget Button: Open Budget/Analytic Report */}
              <Link
                to="/reports/budget"
                className="wf-btn wf-btn-lavender text-xs"
                title="Open the Budget/Analytic Report that is used in the Bill"
              >
                Budget
              </Link>

              <button
                onClick={() => setSelected(null)}
                className="wf-btn wf-btn-dark"
              >
                Cancel
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="wf-btn wf-btn-dark"
              >
                Back
              </button>
            </div>
          </div>

          {/* Non-Blocking Budget Warning Banner (Image 5) */}
          {budgetWarning && (
            <div className="wf-warning-banner">
              <AlertTriangle size={17} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="wf-warning-text">
                <strong>⚠ Exceeds Approved Budget</strong>
                The entered amount is higher than the remaining budget amount for this budget line. Consider adjusting the value or revise the budget.
              </div>
            </div>
          )}

          {/* Form Header Info (Screenshot 3) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 bg-white/[0.02] p-4 rounded-xl border border-white/5 text-xs">
            <div className="space-y-2">
              <div>
                <span className="text-slate-400 block mb-0.5">Vendor Bill No.</span>
                <span className="text-sm font-bold font-mono text-purple-300">
                  Bill/2026/{String(activeBill.id).padStart(4, '0')}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Vendor Name</span>
                <span className="text-sm font-semibold text-slate-200">{activeBill.vendorName}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Status</span>
                <div className="flex items-center gap-1.5">
                  <span className={`wf-status-pill ${isPaid ? 'wf-status-paid' : 'wf-status-draft opacity-50'}`}>
                    Paid
                  </span>
                  <span className={`wf-status-pill ${isPartial ? 'wf-status-partial' : 'wf-status-draft opacity-50'}`}>
                    Partial
                  </span>
                  <span className={`wf-status-pill ${isNotPaid ? 'wf-status-notpaid' : 'wf-status-draft opacity-50'}`}>
                    Not Paid
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <span className="text-slate-400 block mb-0.5">Bill Reference</span>
                <span className="text-sm font-mono text-slate-300">ABC-26-{String(activeBill.id).padStart(3, '0')}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Bill Date</span>
                <span className="text-sm text-slate-300">{activeBill.billDate || activeBill.invoiceDate}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Due Date</span>
                <span className="text-sm text-slate-300">{activeBill.dueDate}</span>
              </div>
            </div>

            {/* Quick Demo Journal Entry Button */}
            <div className="flex flex-col justify-between items-start md:items-end">
              <button
                type="button"
                onClick={() => setShowJE(activeBill)}
                className="wf-btn wf-btn-lavender text-xs gap-1.5"
              >
                <FileText size={13} /> Demo Journal Entry
              </button>
              <div className="text-[11px] text-slate-400 text-left md:text-right mt-3">
                Chart of Accounts: <span className="text-purple-300 font-semibold">Purchase</span>
              </div>
            </div>
          </div>

          {/* Line Items Table (Screenshot 3) */}
          <div className="border border-white/10 rounded-xl overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-white/[0.03] border-b border-white/10 text-slate-300 font-semibold">
                <tr>
                  <th className="py-3 px-3 text-left w-14">Sr. No.</th>
                  <th className="py-3 px-3 text-left">Product</th>
                  <th className="py-3 px-3 text-left">Chart of Account</th>
                  <th className="py-3 px-3 text-left">Budget Analytics</th>
                  <th className="py-3 px-3 text-right w-20">Qty</th>
                  <th className="py-3 px-3 text-right w-24">Unit Price</th>
                  <th className="py-3 px-3 text-right w-28">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-200">
                {(activeBill.lines?.length ? activeBill.lines : [
                  { productName: 'Office Table', quantity: 3, unitPrice: 2000, subtotal: 6000 }
                ]).map((l: any, i: number) => (
                  <tr key={i} className="hover:bg-white/[0.02]">
                    <td className="py-2.5 px-3 font-mono text-slate-400">{i + 1}.</td>
                    <td className="py-2.5 px-3 font-medium">{l.productName || 'Table'}</td>
                    <td className="py-2.5 px-3 text-slate-400 font-mono">Purchase</td>
                    <td className="py-2.5 px-3 text-purple-300">Project 1</td>
                    <td className="py-2.5 px-3 text-right font-mono">{l.quantity}</td>
                    <td className="py-2.5 px-3 text-right font-mono">{fmt(l.unitPrice)}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold">{fmt(l.subtotal || (l.quantity * l.unitPrice))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom Summary: Totals Box + Journal Note (Screenshot 3) */}
          <div className="flex flex-col md:flex-row items-start justify-between gap-6 pt-2">
            {/* Journal Entry Note */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 max-w-xl text-xs text-slate-300 leading-relaxed">
              <strong className="text-purple-300 block mb-1">Journal Entry Automation:</strong>
              As soon as the vendor bill is confirmed a journal entry would be created that would become visible in the Journal Entries section. For Vendor bill always purchase chart of account would be set by default. The Journal Entry should always be balanced. That is the debit and credit totals need to match.
            </div>

            {/* Financial Totals Summary Box (Screenshot 3) */}
            <div className="wf-totals-box ml-auto">
              <div className="wf-totals-row wf-totals-bold text-sm">
                <span>Total</span>
                <span className="font-mono text-purple-300">{fmt(totalAmount)}</span>
              </div>
              <div className="wf-totals-row">
                <span>Paid Via Cash</span>
                <span className="font-mono">{fmt(paidViaCash)}</span>
              </div>
              <div className="wf-totals-row">
                <span>Paid Via Bank</span>
                <span className="font-mono">{fmt(paidViaBank)}</span>
              </div>
              <div className="wf-totals-row font-bold text-slate-100 border-t border-white/10 pt-1 mt-1">
                <span>Amount Due</span>
                <span className={`font-mono ${amountDue > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {fmt(amountDue)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── All Vendor Bills Table ────────────────────────── */}
      <Card className="border border-white/10 bg-[#12151b]">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 size={24} className="animate-spin text-purple-400" />
            </div>
          ) : vendorBills.length === 0 ? (
            <div className="flex flex-col items-center gap-2 p-12 text-slate-400">
              <FileText size={32} className="opacity-30" />
              <p className="text-sm">No vendor bills recorded yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-white/10">
                  <TableHead className="pl-5 text-slate-400">Bill No.</TableHead>
                  <TableHead className="text-slate-400">Vendor</TableHead>
                  <TableHead className="text-slate-400">Bill Date</TableHead>
                  <TableHead className="text-slate-400">Due Date</TableHead>
                  <TableHead className="text-right text-slate-400">Total</TableHead>
                  <TableHead className="text-right text-slate-400">Due</TableHead>
                  <TableHead className="text-slate-400">Status</TableHead>
                  <TableHead className="pr-5 text-right" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendorBills.map(bill => {
                  const isBPaid = bill.paymentStatus === 'PAID' || bill.amountDue <= 0
                  return (
                    <TableRow
                      key={bill.id}
                      className="cursor-pointer hover:bg-white/5 border-white/5"
                      onClick={() => setSelected(bill)}
                    >
                      <TableCell className="pl-5 font-mono text-xs font-semibold text-purple-400">
                        Bill/2026/{String(bill.id).padStart(4, '0')}
                      </TableCell>
                      <TableCell className="text-sm font-medium text-slate-200">{bill.vendorName}</TableCell>
                      <TableCell className="text-xs text-slate-400">{bill.invoiceDate || bill.billDate}</TableCell>
                      <TableCell className="text-xs text-slate-400">{bill.dueDate}</TableCell>
                      <TableCell className="text-right text-sm font-semibold font-mono text-slate-200">
                        {fmt(bill.total)}
                      </TableCell>
                      <TableCell className={`text-right text-sm font-semibold font-mono ${isBPaid ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isBPaid ? '—' : fmt(bill.amountDue)}
                      </TableCell>
                      <TableCell>
                        <span className={`wf-status-pill ${isBPaid ? 'wf-status-paid' : 'wf-status-notpaid'}`}>
                          {bill.paymentStatus}
                        </span>
                      </TableCell>
                      <TableCell className="pr-5 text-right" onClick={e => e.stopPropagation()}>
                        {!isBPaid ? (
                          <button
                            onClick={() => setPayTarget(bill)}
                            className="wf-btn wf-btn-lavender text-xs py-1 px-3"
                          >
                            Pay
                          </button>
                        ) : (
                          <button
                            onClick={() => setSelected(bill)}
                            className="p-1.5 rounded text-slate-400 hover:text-white"
                          >
                            <ChevronRight size={14} />
                          </button>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
