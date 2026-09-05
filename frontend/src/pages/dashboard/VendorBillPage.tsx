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
import {
  useTransactionStore,
  type VendorBill, type PaymentMethod,
} from '@/store'

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
  bill, onPay, onClose,
}: {
  bill: VendorBill
  onPay: (billId: number, method: PaymentMethod) => Promise<void>
  onClose: () => void
}) {
  const [method,  setMethod]  = useState<PaymentMethod>('bank')
  const [paying,  setPaying]  = useState(false)

  async function handlePay() {
    setPaying(true)
    await onPay(bill.id, method)
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
            <label className="auth-label">Payment Method</label>
            <div className="flex gap-2 mt-1">
              {(['bank', 'cash'] as PaymentMethod[]).map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m)}
                  className={`auth-role-card flex-1 capitalize${method === m ? ' auth-role-card--active' : ''}`}
                >
                  <span className="auth-role-label capitalize flex items-center gap-1 justify-center">
                    <CreditCard size={13} /> {m}
                  </span>
                </button>
              ))}
            </div>
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
  bill: VendorBill
  onClose: () => void
  onPayClick: (bill: VendorBill) => void
}) {
  const StatusIcon = STATUS_ICON[bill.status] ?? Clock
  const isPaid     = bill.status === 'done' || !!bill.paymentId

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
              <CheckCircle2 size={11} /> Paid — ref #{bill.paymentId}
            </span>
          )}
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text)]">
            <X size={15} />
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-3 mb-4 text-xs">
          <div>
            <p className="text-[var(--text-muted)]">Vendor</p>
            <p className="font-medium text-[var(--text)]">{bill.vendorName}</p>
          </div>
          <div>
            <p className="text-[var(--text-muted)]">Invoice Date</p>
            <p className="font-medium text-[var(--text)]">{bill.invoiceDate}</p>
          </div>
          <div>
            <p className="text-[var(--text-muted)]">Due Date</p>
            <p className="font-medium text-[var(--text)]">{bill.dueDate}</p>
          </div>
          <div>
            <p className="text-[var(--text-muted)]">Status</p>
            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${STATUS_STYLE[bill.status]}`}>
              <StatusIcon size={10} /> {bill.status}
            </span>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-3">Product</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead className="text-right">Unit Price</TableHead>
              <TableHead className="text-right">Tax %</TableHead>
              <TableHead className="text-right pr-3">Subtotal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bill.lines.map((l, i) => (
              <TableRow key={i}>
                <TableCell className="pl-3 text-xs">{l.productName}</TableCell>
                <TableCell className="text-right text-xs">{l.quantity}</TableCell>
                <TableCell className="text-right text-xs">{fmt(l.unitPrice)}</TableCell>
                <TableCell className="text-right text-xs">{l.tax}%</TableCell>
                <TableCell className="text-right pr-3 text-xs font-medium">{fmt(l.subtotal)}</TableCell>
              </TableRow>
            ))}
            <TableRow className="border-t-2 border-t-[var(--border)]">
              <TableCell colSpan={4} className="pl-3 text-xs">Total</TableCell>
              <TableCell className="text-right pr-3 font-semibold">{fmt(bill.total)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={4} className="pl-3 text-xs font-bold text-[var(--text)]">Amount Due</TableCell>
              <TableCell className="text-right pr-3 font-bold text-[var(--accent)] text-base">{fmt(bill.amountDue)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

/* ─── Page ──────────────────────────────────────────────────── */
export default function VendorBillPage() {
  const {
    vendorBills, loading, error,
    fetchVendorBills, payBill,
  } = useTransactionStore()

  const [selected,  setSelected]  = useState<VendorBill | null>(null)
  const [payTarget, setPayTarget] = useState<VendorBill | null>(null)

  useEffect(() => { fetchVendorBills() }, []) // eslint-disable-line

  async function handlePay(billId: number, method: PaymentMethod) {
    await payBill(billId, method)
    fetchVendorBills()
    setSelected(null)
  }

  // Summary stats
  const totalDue  = vendorBills.filter(b => b.status !== 'done').reduce((s, b) => s + b.amountDue, 0)
  const totalPaid = vendorBills.filter(b => b.status === 'done').reduce((s, b) => s + b.total, 0)

  return (
    <div className="db-page">
      {payTarget && (
        <PayDialog
          bill={payTarget}
          onPay={handlePay}
          onClose={() => setPayTarget(null)}
        />
      )}

      <div className="db-page-header">
        <div>
          <h1 className="db-page-title">Vendor Bills</h1>
          <p className="db-page-sub">Bills generated from purchase orders. Pay outstanding dues.</p>
        </div>
      </div>

      {/* ── KPI strip ────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-[var(--text-muted)]">Total Bills</p>
            <p className="text-2xl font-bold text-[var(--text)] mt-0.5">{vendorBills.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-[var(--text-muted)]">Amount Due</p>
            <p className="text-2xl font-bold text-red-400 mt-0.5">{fmt(totalDue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-[var(--text-muted)]">Total Paid</p>
            <p className="text-2xl font-bold text-green-400 mt-0.5">{fmt(totalPaid)}</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Detail panel ─────────────────────────────── */}
      {selected && (
        <BillDetail
          bill={selected}
          onClose={() => setSelected(null)}
          onPayClick={b => setPayTarget(b)}
        />
      )}

      {error && <div className="auth-error mb-3"><span>{error}</span></div>}

      {/* ── List ─────────────────────────────────────── */}
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
                  const StatusIcon = STATUS_ICON[bill.status] ?? Clock
                  const isPaid = bill.status === 'done' || !!bill.paymentId
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
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${STATUS_STYLE[bill.status]}`}>
                          <StatusIcon size={10} /> {bill.status}
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
