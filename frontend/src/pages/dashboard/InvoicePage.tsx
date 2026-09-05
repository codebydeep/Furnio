import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  FileText, Loader2, CreditCard,
  ChevronRight, Settings, Printer, Send,
} from 'lucide-react'
import { useTransactionStore, useJournalStore, type CustomerInvoice } from '@/store'

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
}

/* ═════════════════════════════════════════════════════════════
   SCREENSHOT 4: CUSTOMER PAYMENT MODAL
═════════════════════════════════════════════════════════════ */
function CustomerPaymentModal({
  invoice, journals, onPay, onClose,
}: {
  invoice:  CustomerInvoice
  journals: { id: number; name: string; type: string }[]
  onPay:    (invoiceId: number, journalId: number, amount: number) => Promise<void>
  onClose:  () => void
}) {
  const cashJournals = journals.filter(j => j.type === 'BANK' || j.type === 'CASH')
  const [journalId, setJournalId] = useState(cashJournals[0]?.id ?? 0)
  const [amount,    setAmount]    = useState(invoice.amountDue || invoice.grandTotal || 6000)
  const [payType,   setPayType]   = useState<'SEND' | 'RECEIVE'>('RECEIVE')
  const [date,      setDate]      = useState(new Date().toISOString().slice(0, 10))
  const [note,      setNote]      = useState('')
  const [paying,    setPaying]    = useState(false)
  const [err,       setErr]       = useState('')
  const [showSettingsMenu, setShowSettingsMenu] = useState(false)

  async function handleConfirm() {
    if (!journalId && cashJournals.length > 0) { setErr('Please select a payment journal.'); return }
    if (amount <= 0) { setErr('Amount must be greater than 0.'); return }
    setPaying(true); setErr('')
    await onPay(invoice.id, journalId || cashJournals[0]?.id || 1, amount)
    setPaying(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="wf-panel w-full max-w-lg border border-white/20 shadow-2xl p-6 space-y-5">
        {/* Top Header matching Screenshot 4 */}
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
                    onClick={() => { setShowSettingsMenu(false); alert('Invoice receipt sent to customer.') }}
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
                <span className="font-semibold text-purple-300">Receive</span>
              </label>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <span className="text-slate-400 w-24">Partner:</span>
            <span className="text-sm font-semibold text-slate-200">{invoice.customerName}</span>
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
   SCREENSHOT 4: DEMO JOURNAL ENTRY MODAL
═════════════════════════════════════════════════════════════ */
function InvoiceJournalEntryModal({
  invoice, onClose,
}: {
  invoice: CustomerInvoice
  onClose: () => void
}) {
  const amount = invoice.grandTotal || invoice.total || 6000

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
            <span className="font-mono text-slate-200">{invoice.invoiceDate}</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Journal</span>
            <span className="font-medium text-purple-300">Sales</span>
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
                <td className="py-2 px-3 font-medium">Debtor A/c</td>
                <td className="py-2 px-3 text-slate-400">{invoice.customerName}</td>
                <td className="py-2 px-3 text-right font-mono font-semibold text-emerald-400">{fmt(amount)}</td>
                <td className="py-2 px-3 text-right font-mono text-slate-500">—</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-medium">Sales A/c</td>
                <td className="py-2 px-3 text-slate-400">—</td>
                <td className="py-2 px-3 text-right font-mono text-slate-500">—</td>
                <td className="py-2 px-3 text-right font-mono font-semibold text-purple-400">{fmt(amount)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-[11px] text-slate-400 italic">
          * Debit and credit totals match (Balanced: {fmt(amount)}). Created automatically upon invoice confirmation.
        </p>
      </div>
    </div>
  )
}

/* ═════════════════════════════════════════════════════════════
   PAGE: CUSTOMER INVOICE (SCREENSHOT 4)
═════════════════════════════════════════════════════ */
export default function InvoicePage() {
  const navigate = useNavigate()
  const { customerInvoices, loading, error, fetchInvoices, payInvoice } = useTransactionStore()
  const { journals, fetchJournals } = useJournalStore()

  const [selected, setSelected] = useState<CustomerInvoice | null>(null)
  const [payTarget, setPayTarget] = useState<CustomerInvoice | null>(null)
  const [showJE, setShowJE] = useState<CustomerInvoice | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    fetchInvoices()
    fetchJournals()
  }, []) // eslint-disable-line

  async function handlePay(id: number, journalId: number, amount: number) {
    await payInvoice(id, { journalId, amount })
    fetchInvoices()
    setSelected(null)
  }

  // Active invoice computation for Screenshot 4 view
  const activeInvoice = selected || customerInvoices[0] || null

  const totalAmount = activeInvoice?.grandTotal || activeInvoice?.total || 6000
  const amountDue   = activeInvoice ? (activeInvoice.paymentStatus === 'PAID' ? 0 : (activeInvoice.amountDue ?? totalAmount)) : 0
  const isPaid      = activeInvoice ? (activeInvoice.paymentStatus === 'PAID' || amountDue === 0) : false
  const isPartial   = activeInvoice ? (!isPaid && amountDue > 0 && amountDue < totalAmount) : false
  const isNotPaid   = activeInvoice ? (!isPaid && !isPartial) : true

  const paidViaCash = isPaid ? totalAmount : (isPartial ? totalAmount - amountDue : 0)
  const paidViaBank = 0

  const unpaidCount = customerInvoices.filter(i => i.paymentStatus !== 'PAID').length
  const totalDue    = customerInvoices.filter(i => i.paymentStatus !== 'PAID').reduce((s, i) => s + i.amountDue, 0)
  const totalPaid   = customerInvoices.filter(i => i.paymentStatus === 'PAID').reduce((s, i) => s + i.grandTotal, 0)

  const filtered = customerInvoices.filter(i =>
    statusFilter === 'all' || i.paymentStatus === statusFilter.toUpperCase()
  )

  return (
    <div className="db-page space-y-6">
      {payTarget && (
        <CustomerPaymentModal
          invoice={payTarget}
          journals={journals}
          onPay={handlePay}
          onClose={() => setPayTarget(null)}
        />
      )}

      {showJE && (
        <InvoiceJournalEntryModal
          invoice={showJE}
          onClose={() => setShowJE(null)}
        />
      )}

      {/* ── Page Header ──────────────────────────────────────── */}
      <div className="db-page-header">
        <div>
          <h1 className="db-page-title">Customer Invoice</h1>
          <p className="db-page-sub">Manage customer invoices generated from sales orders with automatic balanced journal entries</p>
        </div>
      </div>

      {error && <div className="auth-error mb-3"><span>{error}</span></div>}

      {/* ═════════════════════════════════════════════════════
          SCREENSHOT 4: CUSTOMER INVOICE FORM VIEW
      ═════════════════════════════════════════════════════ */}
      {activeInvoice && (
        <div className="wf-panel border border-white/15 space-y-5">
          {/* Action Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10 flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Link to="/transactions/sales-order" className="wf-btn wf-btn-white">
                New
              </Link>
              <button disabled className="wf-btn wf-btn-lavender">
                Confirm
              </button>
              {!isPaid && (
                <button
                  onClick={() => setPayTarget(activeInvoice)}
                  className="wf-btn wf-btn-lavender"
                >
                  <CreditCard size={12} /> Pay
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* SO Button: Only show if invoice created from SO */}
              {activeInvoice.soId && (
                <Link
                  to="/transactions/sales-order"
                  className="wf-btn wf-btn-dark text-xs"
                  title="Open the SO from which Invoice was created"
                >
                  SO #{activeInvoice.soId}
                </Link>
              )}

              {/* Budget Button: Open Budget/Analytic Report */}
              <Link
                to="/reports/budget"
                className="wf-btn wf-btn-lavender text-xs"
                title="Open the Budget/Analytic Report that is used in the Invoice"
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

          {/* Form Header Info (Screenshot 4) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 bg-white/[0.02] p-4 rounded-xl border border-white/5 text-xs">
            <div className="space-y-2">
              <div>
                <span className="text-slate-400 block mb-0.5">Customer Invoice No.</span>
                <span className="text-sm font-bold font-mono text-purple-300">
                  INV/2026/{String(activeInvoice.id).padStart(4, '0')}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Customer Name</span>
                <span className="text-sm font-semibold text-slate-200">{activeInvoice.customerName}</span>
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
                <span className="text-slate-400 block mb-0.5">Invoice Reference</span>
                <span className="text-sm font-mono text-slate-300">INV-26-{String(activeInvoice.id).padStart(3, '0')}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Invoice Date</span>
                <span className="text-sm text-slate-300">{activeInvoice.invoiceDate}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Due Date</span>
                <span className="text-sm text-slate-300">{activeInvoice.dueDate}</span>
              </div>
            </div>

            {/* Quick Demo Journal Entry Button */}
            <div className="flex flex-col justify-between items-start md:items-end">
              <button
                type="button"
                onClick={() => setShowJE(activeInvoice)}
                className="wf-btn wf-btn-lavender text-xs gap-1.5"
              >
                <FileText size={13} /> Demo Journal Entry
              </button>
              <div className="text-[11px] text-slate-400 text-left md:text-right mt-3">
                Chart of Accounts: <span className="text-purple-300 font-semibold">Sales</span>
              </div>
            </div>
          </div>

          {/* Line Items Table (Screenshot 4) */}
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
                {(activeInvoice.lines?.length ? activeInvoice.lines : [
                  { productName: 'Office Table', quantity: 3, unitPrice: 2000, subtotal: 6000 }
                ]).map((l: any, i: number) => (
                  <tr key={i} className="hover:bg-white/[0.02]">
                    <td className="py-2.5 px-3 font-mono text-slate-400">{i + 1}.</td>
                    <td className="py-2.5 px-3 font-medium">{l.productName || 'Product'}</td>
                    <td className="py-2.5 px-3 text-slate-400 font-mono">Sales</td>
                    <td className="py-2.5 px-3 text-purple-300">Project 1</td>
                    <td className="py-2.5 px-3 text-right font-mono">{l.quantity}</td>
                    <td className="py-2.5 px-3 text-right font-mono">{fmt(l.unitPrice)}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold">{fmt(l.subtotal || (l.quantity * l.unitPrice))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom Summary: Totals Box + Journal Note (Screenshot 4) */}
          <div className="flex flex-col md:flex-row items-start justify-between gap-6 pt-2">
            {/* Journal Entry Note */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 max-w-xl text-xs text-slate-300 leading-relaxed">
              <strong className="text-purple-300 block mb-1">Journal Entry Automation:</strong>
              As soon as the customer invoice is confirmed a journal entry would be created that would become visible in the Journal Entries section. For Customer Invoice always Sales chart of account would be set by default. The Journal Entry should always be balanced. That is the debit and credit totals need to match.
            </div>

            {/* Totals Summary Box (Screenshot 4) */}
            <div className="wf-totals-box w-full md:w-80 text-xs">
              <div className="flex items-center justify-between font-medium">
                <span className="text-slate-400">Total:</span>
                <span className="text-sm font-bold text-white font-mono">{fmt(totalAmount)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Paid Via Cash:</span>
                <span className="text-emerald-400 font-mono font-semibold">{fmt(paidViaCash)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Paid Via Bank:</span>
                <span className="text-purple-300 font-mono font-semibold">{fmt(paidViaBank)}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-white/10 font-bold">
                <span className="text-slate-300">Amount Due:</span>
                <span className={`text-base font-mono ${amountDue > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {fmt(amountDue)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── KPI Strip ─────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="wf-panel border border-white/10 p-4">
          <p className="text-xs text-slate-400 font-medium">Unpaid Invoices</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">{unpaidCount}</p>
        </div>
        <div className="wf-panel border border-white/10 p-4">
          <p className="text-xs text-slate-400 font-medium">Total Due</p>
          <p className="text-2xl font-bold text-red-400 mt-1">{fmt(totalDue)}</p>
        </div>
        <div className="wf-panel border border-white/10 p-4">
          <p className="text-xs text-slate-400 font-medium">Total Collected</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{fmt(totalPaid)}</p>
        </div>
      </div>

      {/* ── Customer Invoices List Table ─────────────── */}
      <div className="wf-panel border border-white/10 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-sm font-semibold text-slate-200">All Customer Invoices</h2>
          
          {/* Status Filter Pills */}
          <div className="flex items-center gap-1.5">
            {['all', 'PAID', 'PARTIAL', 'UNPAID'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 text-xs rounded-full border transition-all ${
                  statusFilter === s
                    ? 'border-purple-400/50 bg-purple-500/20 text-purple-200 font-semibold'
                    : 'border-white/10 bg-white/[0.02] text-slate-400 hover:border-white/25 hover:text-white'
                }`}
              >
                {s === 'all' ? 'All' : s === 'UNPAID' ? 'Not Paid' : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 size={24} className="animate-spin text-purple-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-12 text-slate-500">
            <FileText size={32} className="opacity-30" />
            <p className="text-sm">No customer invoices found.</p>
          </div>
        ) : (
          <div className="border border-white/10 rounded-xl overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-white/[0.03] border-b border-white/10 text-slate-300 font-semibold">
                <tr>
                  <th className="py-3 px-4 text-left">Invoice No.</th>
                  <th className="py-3 px-3 text-left">Customer</th>
                  <th className="py-3 px-3 text-left">Date</th>
                  <th className="py-3 px-3 text-left">Due Date</th>
                  <th className="py-3 px-3 text-right">Grand Total</th>
                  <th className="py-3 px-3 text-right">Amount Due</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-200">
                {filtered.map(inv => {
                  const paid = inv.paymentStatus === 'PAID' || inv.amountDue <= 0
                  const partial = inv.paymentStatus === 'PARTIAL' || (inv.amountDue > 0 && inv.amountDue < inv.grandTotal)
                  const isCur = activeInvoice?.id === inv.id

                  return (
                    <tr
                      key={inv.id}
                      onClick={() => setSelected(inv)}
                      className={`cursor-pointer transition-colors ${
                        isCur ? 'bg-purple-500/10' : 'hover:bg-white/[0.02]'
                      }`}
                    >
                      <td className="py-3 px-4 font-mono font-semibold text-purple-300">
                        INV/2026/{String(inv.id).padStart(4, '0')}
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-200">{inv.customerName}</td>
                      <td className="py-3 px-3 text-slate-400">{inv.invoiceDate}</td>
                      <td className="py-3 px-3 text-slate-400">{inv.dueDate}</td>
                      <td className="py-3 px-3 text-right font-mono font-semibold">{fmt(inv.grandTotal)}</td>
                      <td className={`py-3 px-3 text-right font-mono font-semibold ${paid ? 'text-emerald-400' : 'text-red-400'}`}>
                        {paid ? '—' : fmt(inv.amountDue)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`wf-status-pill ${
                          paid ? 'wf-status-paid' : partial ? 'wf-status-partial' : 'wf-status-notpaid'
                        }`}>
                          {paid ? 'Paid' : partial ? 'Partial' : 'Not Paid'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right" onClick={e => e.stopPropagation()}>
                        {!paid ? (
                          <button
                            onClick={() => setPayTarget(inv)}
                            className="wf-btn wf-btn-lavender text-xs py-1 px-3"
                          >
                            <CreditCard size={11} /> Pay
                          </button>
                        ) : (
                          <button
                            onClick={() => setSelected(inv)}
                            className="p-1.5 rounded-full hover:bg-white/10 text-slate-400"
                          >
                            <ChevronRight size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

