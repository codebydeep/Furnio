import { useEffect, useState } from 'react'
import {
  FileText, X, Loader2, CreditCard,
  CheckCircle2, Clock, XCircle, ChevronRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { useTransactionStore, useJournalStore, type VendorBill } from '@/store'

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n)
}

const STATUS_STYLE: Record<string, string> = {
  draft:     'bg-zinc-500/10  text-zinc-400  border-zinc-500/20',
  confirmed: 'bg-blue-500/10  text-blue-400  border-blue-500/20',
  done:      'bg-green-500/10 text-green-400 border-green-500/20',
  cancelled: 'bg-red-500/10   text-red-400   border-red-500/20',
}
const STATUS_ICON: Record<string, React.ElementType> = {
  draft: Clock, confirmed: CheckCircle2, done: CheckCircle2, cancelled: XCircle,
}

/* ─── Pay Dialog ─────────────────────────────────────────────── */
function PayDialog({
  bill, journals, onPay, onClose,
}: {
  bill:     VendorBill
  journals: { id: number; name: string; type: string }[]
  onPay:    (billId: number, journalId: number, amount: number) => Promise<void>
  onClose:  () => void
}) {
  const cashJournals = journals.filter(j => j.type === 'BANK' || j.type === 'CASH')
  const [journalId, setJournalId] = useState(cashJournals[0]?.id ?? 0)
  const [amount,    setAmount]    = useState(bill.amountDue)
  const [paying,    setPaying]    = useState(false)
  const [err,       setErr]       = useState('')

  async function handlePay() {
    if (!journalId) { setErr('Please select a payment journal.'); return }
    if (amount <= 0) { setErr('Amount must be greater than 0.'); return }
    setPaying(true); setErr('')
    await onPay(bill.id, journalId, amount)
    setPaying(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <Card className="w-full max-w-sm mx-4">
        <CardHeader className="pb-2 flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold">Pay Bill #{bill.id}</CardTitle>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text)]">
            <X size={15} />
          </button>
        </CardHeader>
        <CardContent className="space-y-4">
          {err && <div className="auth-error"><span>{err}</span></div>}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-[var(--text-muted)]">Vendor</p>
              <p className="font-medium text-[var(--text)]">{bill.vendorName}</p>
            </div>
            <div>
              <p className="text-[var(--text-muted)]">Amount Due</p>
              <p className="font-bold text-lg text-[var(--accent)]">{fmt(bill.amountDue)}</p>
            </div>
            <div>
              <p className="text-[var(--text-muted)]">Due Date</p>
              <p className="font-medium text-[var(--text)]">{bill.dueDate}</p>
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label">Payment Journal <span className="text-red-400">*</span></label>
            <select className="auth-input" value={journalId}
              onChange={e => setJournalId(+e.target.value)}>
              <option value={0}>— select bank / cash —</option>
              {cashJournals.map(j => (
                <option key={j.id} value={j.id}>{j.name} ({j.type})</option>
              ))}
            </select>
          </div>

          <div className="auth-field">
            <label className="auth-label">Amount (₹) <span className="text-red-400">*</span></label>
            <input type="number" min="0.01" step="0.01" className="auth-input"
              value={amount}
              onChange={e => setAmount(parseFloat(e.target.value) || 0)} />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            <Button size="sm" disabled={paying} onClick={handlePay}>
              {paying ? <><Loader2 size={13} className="animate-spin mr-1" />Processing…</> : 'Confirm Payment'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/* ─── Bill Detail ────────────────────────────────────────────── */
function BillDetail({
  bill, onClose, onPayClick,
}: {
  bill:       VendorBill
  onClose:    () => void
  onPayClick: (bill: VendorBill) => void
}) {
  const StatusIcon = STATUS_ICON[bill.status] ?? Clock
  const isPaid     = bill.paymentStatus === 'PAID' || bill.amountDue <= 0

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2 flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold">Bill #{bill.id} — {bill.vendorName}</CardTitle>
        <div className="flex items-center gap-2">
          {!isPaid && (
            <Button size="sm" className="h-7 text-xs gap-1" onClick={() => onPayClick(bill)}>
              <CreditCard size={11} /> Pay Bill
            </Button>
          )}
          {isPaid && (
            <span className="text-xs text-green-400 flex items-center gap-1">
              <CheckCircle2 size={11} /> Paid
            </span>
          )}
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text)]">
            <X size={15} />
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-3 mb-4 text-xs">
          <div><p className="text-[var(--text-muted)]">Vendor</p><p className="font-medium text-[var(--text)]">{bill.vendorName}</p></div>
          <div><p className="text-[var(--text-muted)]">Invoice Date</p><p className="font-medium text-[var(--text)]">{bill.invoiceDate}</p></div>
          <div><p className="text-[var(--text-muted)]">Due Date</p><p className="font-medium text-[var(--text)]">{bill.dueDate}</p></div>
          <div>
            <p className="text-[var(--text-muted)]">Status</p>
            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${STATUS_STYLE[bill.status]}`}>
              <StatusIcon size={10} /> {bill.paymentStatus}
            </span>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-3">Product</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead className="text-right">Unit Price</TableHead>
              <TableHead className="text-right pr-3">Subtotal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bill.lines.map((l, i) => (
              <TableRow key={i}>
                <TableCell className="pl-3 text-xs">{l.productName}</TableCell>
                <TableCell className="text-right text-xs">{l.quantity}</TableCell>
                <TableCell className="text-right text-xs">{fmt(l.unitPrice)}</TableCell>
                <TableCell className="text-right pr-3 text-xs font-medium">{fmt(l.subtotal)}</TableCell>
              </TableRow>
            ))}
            <TableRow className="border-t-2">
              <TableCell colSpan={3} className="pl-3 text-xs font-semibold">Total</TableCell>
              <TableCell className="text-right pr-3 font-semibold">{fmt(bill.total)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={3} className="pl-3 text-xs font-bold text-[var(--text)]">Amount Due</TableCell>
              <TableCell className={`text-right pr-3 font-bold text-base ${isPaid ? 'text-green-400' : 'text-red-400'}`}>
                {isPaid ? 'Paid' : fmt(bill.amountDue)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

/* ─── Page ──────────────────────────────────────────────────── */
export default function VendorBillPage() {
  const { vendorBills, loading, error, fetchVendorBills, payBill } = useTransactionStore()
  const { journals, fetchJournals } = useJournalStore()

  const [selected,  setSelected]  = useState<VendorBill | null>(null)
  const [payTarget, setPayTarget] = useState<VendorBill | null>(null)

  useEffect(() => {
    fetchVendorBills()
    fetchJournals()
  }, []) // eslint-disable-line

  async function handlePay(billId: number, journalId: number, amount: number) {
    await payBill(billId, { journalId, amount })
    fetchVendorBills()
    setSelected(null)
  }

  const totalDue  = vendorBills.filter(b => b.paymentStatus !== 'PAID').reduce((s, b) => s + b.amountDue, 0)
  const totalPaid = vendorBills.filter(b => b.paymentStatus === 'PAID').reduce((s, b) => s + b.total, 0)

  return (
    <div className="db-page">
      {payTarget && (
        <PayDialog
          bill={payTarget}
          journals={journals}
          onPay={handlePay}
          onClose={() => setPayTarget(null)}
        />
      )}

      <div className="db-page-header">
        <div>
          <h1 className="db-page-title">Vendor Bills</h1>
          <p className="db-page-sub">Bills from purchase orders. Record outgoing payments.</p>
        </div>
      </div>

      {/* ── KPI strip ────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <Card><CardContent className="pt-4"><p className="text-xs text-[var(--text-muted)]">Total Bills</p><p className="text-2xl font-bold text-[var(--text)] mt-0.5">{vendorBills.length}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-xs text-[var(--text-muted)]">Amount Due</p><p className="text-2xl font-bold text-red-400 mt-0.5">{fmt(totalDue)}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-xs text-[var(--text-muted)]">Total Paid</p><p className="text-2xl font-bold text-green-400 mt-0.5">{fmt(totalPaid)}</p></CardContent></Card>
      </div>

      {selected && (
        <BillDetail bill={selected} onClose={() => setSelected(null)} onPayClick={b => setPayTarget(b)} />
      )}

      {error && <div className="auth-error mb-3"><span>{error}</span></div>}

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 size={24} className="animate-spin text-[var(--accent)]" />
            </div>
          ) : vendorBills.length === 0 ? (
            <div className="flex flex-col items-center gap-2 p-12 text-[var(--text-muted)]">
              <FileText size={32} className="opacity-30" />
              <p className="text-sm">No vendor bills yet. Convert a Purchase Order to generate a bill.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-5">#</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Invoice Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Amount Due</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="pr-5 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendorBills.map(bill => {
                  const isPaid = bill.paymentStatus === 'PAID' || bill.amountDue <= 0
                  return (
                    <TableRow key={bill.id} className="cursor-pointer hover:bg-[var(--surface-2)]"
                      onClick={() => setSelected(bill)}>
                      <TableCell className="pl-5 font-mono text-xs text-[var(--text-muted)]">#{bill.id}</TableCell>
                      <TableCell className="text-sm font-medium text-[var(--text)]">{bill.vendorName}</TableCell>
                      <TableCell className="text-xs text-[var(--text-muted)]">{bill.invoiceDate}</TableCell>
                      <TableCell className="text-xs text-[var(--text-muted)]">{bill.dueDate}</TableCell>
                      <TableCell className="text-right text-sm">{fmt(bill.total)}</TableCell>
                      <TableCell className={`text-right text-sm font-semibold ${isPaid ? 'text-green-400' : 'text-red-400'}`}>
                        {isPaid ? '—' : fmt(bill.amountDue)}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full border bg-zinc-500/10 text-zinc-400 border-zinc-500/20">
                          {bill.paymentStatus}
                        </span>
                      </TableCell>
                      <TableCell className="pr-5 text-right" onClick={e => e.stopPropagation()}>
                        {!isPaid ? (
                          <Button size="sm" variant="outline" className="h-6 text-xs px-2 gap-1"
                            onClick={() => setPayTarget(bill)}>
                            <CreditCard size={10} /> Pay
                          </Button>
                        ) : (
                          <button className="p-1.5 rounded hover:bg-[var(--surface-2)] text-[var(--text-muted)]"
                            onClick={() => setSelected(bill)}>
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
