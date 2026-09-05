import { useEffect, useState } from 'react'
import {
  FileText, Loader2, CreditCard,
  CheckCircle2, Clock, XCircle, ChevronRight, X,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store'
import type { CustomerInvoice, PaymentMethod, OrderLine } from '@/store'

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
  invoice, onClose, onPaid,
}: {
  invoice: CustomerInvoice
  onClose: () => void
  onPaid: () => void
}) {
  const [method,  setMethod]  = useState<PaymentMethod>('bank')
  const [paying,  setPaying]  = useState(false)
  const [err,     setErr]     = useState('')

  async function handlePay() {
    setPaying(true); setErr('')
    try {
      await api.post(`/invoices/${invoice.id}/pay`, { method })
      onPaid()
      onClose()
    } catch (e: any) {
      setErr(e.message ?? 'Payment failed.')
    } finally { setPaying(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <Card className="w-full max-w-sm mx-4">
        <CardHeader className="pb-2 flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold">Pay Invoice #{invoice.id}</CardTitle>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text)]">
            <X size={15} />
          </button>
        </CardHeader>
        <CardContent className="space-y-4">
          {err && <div className="auth-error"><span>{err}</span></div>}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-[var(--text-muted)]">Amount Due</p>
              <p className="font-bold text-lg text-[var(--accent)]">{fmt(invoice.amountDue)}</p>
            </div>
            <div>
              <p className="text-[var(--text-muted)]">Due Date</p>
              <p className="font-medium text-[var(--text)]">{invoice.dueDate}</p>
            </div>
          </div>
          <div className="auth-field">
            <label className="auth-label">Payment Method</label>
            <div className="flex gap-2 mt-1">
              {(['bank', 'cash'] as PaymentMethod[]).map(m => (
                <button key={m} type="button" onClick={() => setMethod(m)}
                  className={`auth-role-card flex-1 capitalize${method === m ? ' auth-role-card--active' : ''}`}>
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
              {paying
                ? <><Loader2 size={13} className="animate-spin mr-1" />Processing…</>
                : 'Pay Now'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/* ─── Invoice Detail ─────────────────────────────────────────── */
function InvoiceDetail({
  invoice, onClose, onPayClick,
}: {
  invoice: CustomerInvoice
  onClose: () => void
  onPayClick: (inv: CustomerInvoice) => void
}) {
  const StatusIcon = STATUS_ICON[invoice.status] ?? Clock
  const isPaid = invoice.status === 'done' || !!invoice.paymentId

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2 flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold">Invoice #{invoice.id}</CardTitle>
        <div className="flex items-center gap-2">
          {!isPaid && (
            <Button size="sm" className="h-7 text-xs gap-1" onClick={() => onPayClick(invoice)}>
              <CreditCard size={11} /> Pay Now
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
        <div className="grid grid-cols-3 gap-3 mb-4 text-xs">
          <div>
            <p className="text-[var(--text-muted)]">Invoice Date</p>
            <p className="font-medium text-[var(--text)]">{invoice.invoiceDate}</p>
          </div>
          <div>
            <p className="text-[var(--text-muted)]">Due Date</p>
            <p className="font-medium text-[var(--text)]">{invoice.dueDate}</p>
          </div>
          <div>
            <p className="text-[var(--text-muted)]">Status</p>
            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${STATUS_STYLE[invoice.status]}`}>
              <StatusIcon size={10} /> {invoice.status}
            </span>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-3">Item</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead className="text-right">Unit Price</TableHead>
              <TableHead className="text-right pr-3">Subtotal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoice.lines.map((l, i) => (
              <TableRow key={i}>
                <TableCell className="pl-3 text-xs">{l.productName}</TableCell>
                <TableCell className="text-right text-xs">{l.quantity}</TableCell>
                <TableCell className="text-right text-xs">{fmt(l.unitPrice)}</TableCell>
                <TableCell className="text-right pr-3 text-xs font-medium">{fmt(l.subtotal)}</TableCell>
              </TableRow>
            ))}
            <TableRow className="border-t-2">
              <TableCell colSpan={3} className="pl-3 text-xs">Grand Total</TableCell>
              <TableCell className="text-right pr-3 font-bold text-[var(--accent)] text-sm">{fmt(invoice.grandTotal)}</TableCell>
            </TableRow>
            {!isPaid && (
              <TableRow>
                <TableCell colSpan={3} className="pl-3 text-xs font-bold text-red-400">Amount Due</TableCell>
                <TableCell className="text-right pr-3 font-bold text-red-400">{fmt(invoice.amountDue)}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

/* ─── Page ──────────────────────────────────────────────────── */
export default function MyInvoicesPage() {
  const { user } = useAuthStore()
  const [invoices, setInvoices] = useState<CustomerInvoice[]>([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')
  const [selected, setSelected] = useState<CustomerInvoice | null>(null)
  const [payTarget, setPayTarget] = useState<CustomerInvoice | null>(null)

  async function load() {
    setLoading(true); setError('')
    try {
      const { data } = await api.get<CustomerInvoice[]>('/invoices/my')
      setInvoices(data)
    } catch (e: any) {
      setError(e.message ?? 'Failed to load invoices.')
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, []) // eslint-disable-line

  const unpaid  = invoices.filter(i => i.status !== 'done' && !i.paymentId)
  const totalDue = unpaid.reduce((s, i) => s + i.amountDue, 0)

  return (
    <div className="db-page">
      {payTarget && (
        <PayDialog
          invoice={payTarget}
          onClose={() => setPayTarget(null)}
          onPaid={load}
        />
      )}

      <div className="db-page-header">
        <div>
          <h1 className="db-page-title">My Invoices</h1>
          <p className="db-page-sub">
            Welcome back, <strong>{user?.name}</strong>. View and pay your outstanding invoices here.
          </p>
        </div>
      </div>

      {/* ── Summary ──────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 mb-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-[var(--text-muted)]">Total Invoices</p>
            <p className="text-2xl font-bold text-[var(--text)] mt-0.5">{invoices.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-[var(--text-muted)]">Unpaid</p>
            <p className="text-2xl font-bold text-orange-400 mt-0.5">{unpaid.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-[var(--text-muted)]">Amount Due</p>
            <p className="text-2xl font-bold text-red-400 mt-0.5">{fmt(totalDue)}</p>
          </CardContent>
        </Card>
      </div>

      {selected && (
        <InvoiceDetail
          invoice={selected}
          onClose={() => setSelected(null)}
          onPayClick={inv => { setPayTarget(inv); setSelected(null) }}
        />
      )}

      {error && <div className="auth-error mb-3"><span>{error}</span></div>}

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 size={24} className="animate-spin text-[var(--accent)]" />
            </div>
          ) : invoices.length === 0 ? (
            <div className="flex flex-col items-center gap-2 p-12 text-[var(--text-muted)]">
              <FileText size={32} className="opacity-30" />
              <p className="text-sm">You have no invoices yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-5">Invoice #</TableHead>
                  <TableHead>Invoice Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Grand Total</TableHead>
                  <TableHead className="text-right">Amount Due</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="pr-5 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map(inv => {
                  const StatusIcon = STATUS_ICON[inv.status] ?? Clock
                  const isPaid = inv.status === 'done' || !!inv.paymentId
                  return (
                    <TableRow key={inv.id}
                      className="cursor-pointer hover:bg-[var(--surface-2)]"
                      onClick={() => setSelected(inv)}>
                      <TableCell className="pl-5 font-mono text-xs text-[var(--text-muted)]">#{inv.id}</TableCell>
                      <TableCell className="text-xs text-[var(--text-muted)]">{inv.invoiceDate}</TableCell>
                      <TableCell className="text-xs text-[var(--text-muted)]">{inv.dueDate}</TableCell>
                      <TableCell className="text-right text-sm font-semibold">{fmt(inv.grandTotal)}</TableCell>
                      <TableCell className={`text-right text-sm font-semibold ${isPaid ? 'text-green-400' : 'text-red-400'}`}>
                        {isPaid ? 'Paid' : fmt(inv.amountDue)}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${STATUS_STYLE[inv.status]}`}>
                          <StatusIcon size={10} /> {inv.status}
                        </span>
                      </TableCell>
                      <TableCell className="pr-5 text-right" onClick={e => e.stopPropagation()}>
                        {!isPaid ? (
                          <Button size="sm" className="h-6 text-xs px-2 gap-1"
                            onClick={() => setPayTarget(inv)}>
                            <CreditCard size={10} /> Pay
                          </Button>
                        ) : (
                          <button className="p-1.5 rounded text-[var(--text-muted)] hover:text-[var(--text)]"
                            onClick={() => setSelected(inv)}>
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
