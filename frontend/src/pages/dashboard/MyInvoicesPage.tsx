import { useEffect, useState } from 'react'
import {
  FileText, Loader2, CreditCard, CheckCircle2, Clock,
  ChevronRight, X, Receipt, ArrowDownLeft, ArrowUpRight,
  Search, RefreshCw, ShoppingCart, Tag,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store'
import { useSearchParams } from 'react-router-dom'

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n)
}

const PAYMENT_STATUS_STYLE: Record<string, string> = {
  UNPAID:  'bg-red-500/15 text-red-400 border-red-500/30',
  PARTIAL: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  PAID:    'bg-green-500/15 text-green-400 border-green-500/30',
}

interface RawInvoice {
  id: number
  invoiceDate: string
  dueDate: string
  amount: string | number
  paymentStatus: string
  so?: {
    id: number
    soNumber?: string
    customer?: { name: string; email?: string }
    items?: Array<{
      id: number
      quantity: number
      unitPrice: string | number
      product?: { name: string }
    }>
  }
  payments?: Array<{
    id: number
    amount: string | number
    date: string
    journal?: { name: string; type: string }
  }>
}

interface RawBill {
  id: number
  poId?: number
  billDate: string
  dueDate: string
  amount: string | number
  paymentStatus: string
  po?: {
    id: number
    poNumber?: string
    vendor?: { name: string; email?: string }
    items?: Array<{
      id: number
      quantity: number
      unitPrice: string | number
      product?: { name: string }
    }>
  }
  payments?: Array<{
    id: number
    amount: string | number
    date: string
    journal?: { name: string }
  }>
}

interface RawPayment {
  id: number
  amount: string | number
  direction: 'RECEIVED' | 'SEND'
  date: string
  journal?: { name: string; type: string }
  customerInvoice?: { id: number; amount: string | number }
  vendorBill?: { id: number; amount: string | number }
}

/* ─── Pay Dialog for Customer Invoices ────────────────────────── */
function PayDialog({
  invoice,
  onClose,
  onPaid,
}: {
  invoice: RawInvoice
  onClose: () => void
  onPaid: () => void
}) {
  const [method, setMethod] = useState<'BANK' | 'CASH'>('BANK')
  const [paying, setPaying] = useState(false)
  const [err, setErr] = useState('')

  const total = Number(invoice.amount) || 0
  const totalPaid = (invoice.payments || []).reduce((s, p) => s + Number(p.amount), 0)
  const due = Math.max(0, total - totalPaid)

  async function handlePay() {
    setPaying(true)
    setErr('')
    try {
      await api.post(`/customer-invoices/${invoice.id}/pay`, {
        method,
        journalType: method,
        amount: due,
      })
      onPaid()
      onClose()
    } catch (e: any) {
      setErr(e.message ?? 'Payment failed.')
    } finally {
      setPaying(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <Card className="w-full max-w-sm mx-4 border border-[var(--border)] shadow-xl bg-[var(--surface)]">
        <CardHeader className="pb-2 flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold text-[var(--text)]">
            Pay Invoice INV-{String(invoice.id).padStart(4, '0')}
          </CardTitle>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text)]">
            <X size={15} />
          </button>
        </CardHeader>
        <CardContent className="space-y-4 pt-2">
          {err && <div className="auth-error text-xs"><span>{err}</span></div>}
          <div className="grid grid-cols-2 gap-3 text-xs p-3 rounded-lg bg-[var(--surface-2)]">
            <div>
              <p className="text-[var(--text-muted)]">Amount Due</p>
              <p className="font-bold text-lg text-emerald-400 mt-0.5">{fmt(due)}</p>
            </div>
            <div>
              <p className="text-[var(--text-muted)]">Due Date</p>
              <p className="font-medium text-[var(--text)] mt-1">
                {new Date(invoice.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label">Select Payment Method</label>
            <div className="grid grid-cols-2 gap-2 mt-1.5">
              {(['BANK', 'CASH'] as const).map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m)}
                  className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    method === m
                      ? 'border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent)] shadow-sm'
                      : 'border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-[var(--text)]'
                  }`}
                >
                  <CreditCard size={14} />
                  <span>{m === 'BANK' ? 'Bank Transfer' : 'Cash Counter'}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border)]">
            <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            <Button size="sm" disabled={paying} onClick={handlePay} className="gap-1.5">
              {paying ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
              {paying ? 'Processing…' : `Confirm Payment of ${fmt(due)}`}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/* ─── Main Portal Page ────────────────────────────────────────── */
export default function MyInvoicesPage() {
  const { user } = useAuthStore()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'invoices'

  const [invoices, setInvoices] = useState<RawInvoice[]>([])
  const [bills, setBills] = useState<RawBill[]>([])
  const [payments, setPayments] = useState<RawPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const [selectedInvoice, setSelectedInvoice] = useState<RawInvoice | null>(null)
  const [selectedBill, setSelectedBill] = useState<RawBill | null>(null)
  const [payTarget, setPayTarget] = useState<RawInvoice | null>(null)

  async function loadData() {
    setLoading(true)
    setError('')
    try {
      const [invRes, billRes, payRes] = await Promise.allSettled([
        api.get<RawInvoice[]>('/customer-invoices/my'),
        api.get<RawBill[]>('/customer-invoices/my-bills'),
        api.get<RawPayment[]>('/customer-invoices/my-payments'),
      ])

      if (invRes.status === 'fulfilled') setInvoices(invRes.value.data || [])
      if (billRes.status === 'fulfilled') setBills(billRes.value.data || [])
      if (payRes.status === 'fulfilled') setPayments(payRes.value.data || [])
    } catch (err: any) {
      setError(err.message ?? 'Failed to load portal records.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // KPI calculations
  const unpaidInvoices = invoices.filter(i => i.paymentStatus !== 'PAID')
  const totalInvoiceDue = unpaidInvoices.reduce((s, i) => {
    const total = Number(i.amount) || 0
    const paid = (i.payments || []).reduce((acc, p) => acc + Number(p.amount), 0)
    return s + Math.max(0, total - paid)
  }, 0)

  const unpaidBills = bills.filter(b => b.paymentStatus !== 'PAID')
  const totalBillsDue = unpaidBills.reduce((s, b) => {
    const total = Number(b.amount) || 0
    const paid = (b.payments || []).reduce((acc, p) => acc + Number(p.amount), 0)
    return s + Math.max(0, total - paid)
  }, 0)

  const totalPaymentsAmount = payments.reduce((s, p) => s + Number(p.amount), 0)

  // Filters
  const filteredInvoices = invoices.filter(i => {
    const q = search.toLowerCase()
    const invNo = `inv-${String(i.id).padStart(4, '0')}`.toLowerCase()
    const customer = (i.so?.customer?.name || '').toLowerCase()
    return invNo.includes(q) || customer.includes(q) || (i.paymentStatus || '').toLowerCase().includes(q)
  })

  const filteredBills = bills.filter(b => {
    const q = search.toLowerCase()
    const billNo = `bill-${String(b.id).padStart(4, '0')}`.toLowerCase()
    const poNo = (b.po?.poNumber || '').toLowerCase()
    const vendor = (b.po?.vendor?.name || '').toLowerCase()
    return billNo.includes(q) || poNo.includes(q) || vendor.includes(q)
  })

  const filteredPayments = payments.filter(p => {
    const q = search.toLowerCase()
    const pNo = `pay-${String(p.id).padStart(4, '0')}`.toLowerCase()
    const method = (p.journal?.name || '').toLowerCase()
    return pNo.includes(q) || method.includes(q) || p.direction.toLowerCase().includes(q)
  })

  return (
    <div className="db-page space-y-5">
      {/* Pay Modal */}
      {payTarget && (
        <PayDialog
          invoice={payTarget}
          onClose={() => setPayTarget(null)}
          onPaid={loadData}
        />
      )}

      {/* Header */}
      <div className="db-page-header">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="db-page-title">Customer & Vendor Portal</h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/30">
              {user?.role === 'USER' ? 'Portal Account' : user?.role}
            </span>
          </div>
          <p className="db-page-sub">
            Track your invoices, vendor bills, order line items, and payment receipts in real-time.
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={loadData}>
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
        </Button>
      </div>

      {/* ── Summary KPI Strip ────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <Card className="border border-[var(--border)] bg-[var(--surface)]">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                Outstanding Invoices
              </span>
              <FileText size={16} className="text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-[var(--text)] mt-1">{unpaidInvoices.length}</p>
            <p className="text-xs text-red-400 font-medium mt-0.5">Due: {fmt(totalInvoiceDue)}</p>
          </CardContent>
        </Card>

        <Card className="border border-[var(--border)] bg-[var(--surface)]">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                Vendor Bills
              </span>
              <ShoppingCart size={16} className="text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-[var(--text)] mt-1">{bills.length}</p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              {unpaidBills.length > 0 ? `${unpaidBills.length} unpaid (${fmt(totalBillsDue)})` : 'All bills settled'}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-[var(--border)] bg-[var(--surface)]">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                Payment History
              </span>
              <Receipt size={16} className="text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{fmt(totalPaymentsAmount)}</p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">{payments.length} registered transactions</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Tabs Navigation ─────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSearchParams({ tab: 'invoices' })}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'invoices'
                ? 'bg-[var(--accent)] text-white shadow-sm'
                : 'bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-[var(--text)]'
            }`}
          >
            <FileText size={13} />
            <span>Customer Invoices</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 text-white">
              {invoices.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSearchParams({ tab: 'bills' })}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'bills'
                ? 'bg-[var(--accent)] text-white shadow-sm'
                : 'bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-[var(--text)]'
            }`}
          >
            <ShoppingCart size={13} />
            <span>Vendor Bills</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 text-white">
              {bills.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSearchParams({ tab: 'payments' })}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'payments'
                ? 'bg-[var(--accent)] text-white shadow-sm'
                : 'bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-[var(--text)]'
            }`}
          >
            <Receipt size={13} />
            <span>Payment History</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 text-white">
              {payments.length}
            </span>
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-xs w-full">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            className="auth-input pl-8 w-full text-xs"
            placeholder="Search records…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {error && <div className="auth-error mb-3"><span>{error}</span></div>}

      {/* ── Selected Invoice Detail Modal/Drawer ──────── */}
      {selectedInvoice && (
        <Card className="border border-[var(--accent)]/40 bg-[var(--surface)]">
          <CardHeader className="pb-2 flex-row items-center justify-between border-b border-[var(--border)]">
            <div>
              <CardTitle className="text-sm font-semibold text-[var(--text)]">
                Invoice Breakdown: INV-{String(selectedInvoice.id).padStart(4, '0')}
              </CardTitle>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Sales Order Ref: #{selectedInvoice.so?.id} ({selectedInvoice.so?.soNumber || 'SO0001'})
              </p>
            </div>
            <div className="flex items-center gap-2">
              {selectedInvoice.paymentStatus !== 'PAID' && (
                <Button size="sm" className="h-7 text-xs gap-1" onClick={() => setPayTarget(selectedInvoice)}>
                  <CreditCard size={12} /> Pay Now
                </Button>
              )}
              <button
                onClick={() => setSelectedInvoice(null)}
                className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text)]"
              >
                <X size={15} />
              </button>
            </div>
          </CardHeader>
          <CardContent className="pt-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-4 p-3 rounded-lg bg-[var(--surface-2)]">
              <div>
                <span className="text-[var(--text-muted)]">Customer:</span>
                <p className="font-semibold text-[var(--text)] mt-0.5">{selectedInvoice.so?.customer?.name || '—'}</p>
              </div>
              <div>
                <span className="text-[var(--text-muted)]">Invoice Date:</span>
                <p className="font-medium text-[var(--text)] mt-0.5">
                  {new Date(selectedInvoice.invoiceDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <div>
                <span className="text-[var(--text-muted)]">Due Date:</span>
                <p className="font-medium text-[var(--text)] mt-0.5">
                  {new Date(selectedInvoice.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <div>
                <span className="text-[var(--text-muted)]">Payment Status:</span>
                <p className="mt-0.5">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${PAYMENT_STATUS_STYLE[selectedInvoice.paymentStatus] || ''}`}>
                    {selectedInvoice.paymentStatus}
                  </span>
                </p>
              </div>
            </div>

            <div className="text-xs font-semibold text-[var(--text)] mb-2 flex items-center gap-1.5">
              <Tag size={13} className="text-[var(--accent)]" /> Itemized Bill of Supplies
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Product</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right pr-4">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(selectedInvoice.so?.items || []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4 text-xs text-[var(--text-muted)]">
                      Standard Furnishing Order ({fmt(Number(selectedInvoice.amount))})
                    </TableCell>
                  </TableRow>
                ) : (
                  (selectedInvoice.so?.items || []).map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="pl-4 text-xs font-medium">{item.product?.name || 'Custom Furniture'}</TableCell>
                      <TableCell className="text-right text-xs">{item.quantity}</TableCell>
                      <TableCell className="text-right text-xs">{fmt(Number(item.unitPrice))}</TableCell>
                      <TableCell className="text-right pr-4 text-xs font-semibold">
                        {fmt(item.quantity * Number(item.unitPrice))}
                      </TableCell>
                    </TableRow>
                  ))
                )}
                <TableRow className="border-t-2 font-bold">
                  <TableCell colSpan={3} className="pl-4 text-xs">Total Amount Due</TableCell>
                  <TableCell className="text-right pr-4 text-sm text-emerald-400">
                    {fmt(Number(selectedInvoice.amount))}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* ── Selected Bill Detail Modal/Drawer ─────────── */}
      {selectedBill && (
        <Card className="border border-[var(--accent)]/40 bg-[var(--surface)]">
          <CardHeader className="pb-2 flex-row items-center justify-between border-b border-[var(--border)]">
            <div>
              <CardTitle className="text-sm font-semibold text-[var(--text)]">
                Vendor Bill Breakdown: Bill/2026/{String(selectedBill.id).padStart(4, '0')}
              </CardTitle>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                PO Ref: #{selectedBill.po?.id} ({selectedBill.po?.poNumber || 'PO0001'})
              </p>
            </div>
            <button
              onClick={() => setSelectedBill(null)}
              className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text)]"
            >
              <X size={15} />
            </button>
          </CardHeader>
          <CardContent className="pt-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-4 p-3 rounded-lg bg-[var(--surface-2)]">
              <div>
                <span className="text-[var(--text-muted)]">Vendor:</span>
                <p className="font-semibold text-[var(--text)] mt-0.5">{selectedBill.po?.vendor?.name || '—'}</p>
              </div>
              <div>
                <span className="text-[var(--text-muted)]">Bill Date:</span>
                <p className="font-medium text-[var(--text)] mt-0.5">
                  {new Date(selectedBill.billDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <div>
                <span className="text-[var(--text-muted)]">Due Date:</span>
                <p className="font-medium text-[var(--text)] mt-0.5">
                  {new Date(selectedBill.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <div>
                <span className="text-[var(--text-muted)]">Status:</span>
                <p className="mt-0.5">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${PAYMENT_STATUS_STYLE[selectedBill.paymentStatus] || ''}`}>
                    {selectedBill.paymentStatus}
                  </span>
                </p>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Product</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Unit Cost</TableHead>
                  <TableHead className="text-right pr-4">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(selectedBill.po?.items || []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4 text-xs text-[var(--text-muted)]">
                      Standard Vendor Supplies ({fmt(Number(selectedBill.amount))})
                    </TableCell>
                  </TableRow>
                ) : (
                  (selectedBill.po?.items || []).map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="pl-4 text-xs font-medium">{item.product?.name || 'Procured Materials'}</TableCell>
                      <TableCell className="text-right text-xs">{item.quantity}</TableCell>
                      <TableCell className="text-right text-xs">{fmt(Number(item.unitPrice))}</TableCell>
                      <TableCell className="text-right pr-4 text-xs font-semibold">
                        {fmt(item.quantity * Number(item.unitPrice))}
                      </TableCell>
                    </TableRow>
                  ))
                )}
                <TableRow className="border-t-2 font-bold">
                  <TableCell colSpan={3} className="pl-4 text-xs">Total Bill Amount</TableCell>
                  <TableCell className="text-right pr-4 text-sm text-amber-400">
                    {fmt(Number(selectedBill.amount))}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* ── Tab 1: Customer Invoices ────────────────── */}
      {activeTab === 'invoices' && (
        <Card className="border border-[var(--border)] bg-[var(--surface)]">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 size={24} className="animate-spin text-[var(--accent)]" />
              </div>
            ) : filteredInvoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 p-12 text-[var(--text-muted)]">
                <FileText size={32} className="opacity-30" />
                <p className="text-sm">No customer invoices found for this account.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-5">Invoice #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Invoice Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Grand Total</TableHead>
                    <TableHead className="text-right">Amount Due</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="pr-5 text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map(inv => {
                    const total = Number(inv.amount) || 0
                    const paid = (inv.payments || []).reduce((s, p) => s + Number(p.amount), 0)
                    const due = Math.max(0, total - paid)
                    const isPaid = inv.paymentStatus === 'PAID' || due <= 0

                    return (
                      <TableRow
                        key={inv.id}
                        onClick={() => setSelectedInvoice(inv)}
                        className="cursor-pointer hover:bg-[var(--surface-2)]/60 transition-colors"
                        title="Click to view itemized breakdown"
                      >
                        <TableCell className="pl-5 font-mono text-xs font-bold text-blue-400">
                          INV-{String(inv.id).padStart(4, '0')}
                        </TableCell>
                        <TableCell className="text-sm text-[var(--text)]">
                          {inv.so?.customer?.name || 'Customer'}
                        </TableCell>
                        <TableCell className="text-xs text-[var(--text-muted)]">
                          {new Date(inv.invoiceDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </TableCell>
                        <TableCell className="text-xs text-[var(--text-muted)]">
                          {new Date(inv.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </TableCell>
                        <TableCell className="text-right text-sm font-semibold text-[var(--text)]">
                          {fmt(total)}
                        </TableCell>
                        <TableCell className={`text-right text-sm font-semibold ${isPaid ? 'text-green-400' : 'text-red-400'}`}>
                          {isPaid ? 'Settled' : fmt(due)}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${PAYMENT_STATUS_STYLE[inv.paymentStatus] || ''}`}>
                            {isPaid ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                            {inv.paymentStatus}
                          </span>
                        </TableCell>
                        <TableCell className="pr-5 text-right" onClick={e => e.stopPropagation()}>
                          {!isPaid ? (
                            <Button
                              size="sm"
                              className="h-7 text-xs px-2.5 gap-1 shadow-sm"
                              onClick={() => setPayTarget(inv)}
                            >
                              <CreditCard size={11} /> Pay
                            </Button>
                          ) : (
                            <button
                              onClick={() => setSelectedInvoice(inv)}
                              className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text)]"
                              title="View details"
                            >
                              <ChevronRight size={15} />
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
      )}

      {/* ── Tab 2: Vendor Bills ──────────────────────── */}
      {activeTab === 'bills' && (
        <Card className="border border-[var(--border)] bg-[var(--surface)]">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 size={24} className="animate-spin text-[var(--accent)]" />
              </div>
            ) : filteredBills.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 p-12 text-[var(--text-muted)]">
                <ShoppingCart size={32} className="opacity-30" />
                <p className="text-sm">No vendor bills recorded for this account.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-5">Bill #</TableHead>
                    <TableHead>Origin PO</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Bill Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Total Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="pr-5 text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBills.map(bill => (
                    <TableRow
                      key={bill.id}
                      onClick={() => setSelectedBill(bill)}
                      className="cursor-pointer hover:bg-[var(--surface-2)]/60 transition-colors"
                      title="Click to view bill items"
                    >
                      <TableCell className="pl-5 font-mono text-xs font-bold text-amber-400">
                        Bill/2026/{String(bill.id).padStart(4, '0')}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-[var(--text-muted)]">
                        {bill.po?.poNumber || `PO-${bill.poId}`}
                      </TableCell>
                      <TableCell className="text-sm text-[var(--text)]">
                        {bill.po?.vendor?.name || 'Vendor'}
                      </TableCell>
                      <TableCell className="text-xs text-[var(--text-muted)]">
                        {new Date(bill.billDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </TableCell>
                      <TableCell className="text-xs text-[var(--text-muted)]">
                        {new Date(bill.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </TableCell>
                      <TableCell className="text-right text-sm font-semibold text-[var(--text)]">
                        {fmt(Number(bill.amount))}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${PAYMENT_STATUS_STYLE[bill.paymentStatus] || ''}`}>
                          {bill.paymentStatus === 'PAID' ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                          {bill.paymentStatus}
                        </span>
                      </TableCell>
                      <TableCell className="pr-5 text-right" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedBill(bill)}
                          className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text)]"
                          title="View items"
                        >
                          <ChevronRight size={15} />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Tab 3: Payment History ──────────────────── */}
      {activeTab === 'payments' && (
        <Card className="border border-[var(--border)] bg-[var(--surface)]">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 size={24} className="animate-spin text-[var(--accent)]" />
              </div>
            ) : filteredPayments.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 p-12 text-[var(--text-muted)]">
                <Receipt size={32} className="opacity-30" />
                <p className="text-sm">No payment transactions found.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-5">Receipt #</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Journal / Method</TableHead>
                    <TableHead>Linked Document</TableHead>
                    <TableHead className="text-right">Amount Paid</TableHead>
                    <TableHead className="pr-5 text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map(p => {
                    const isReceived = p.direction === 'RECEIVED'
                    return (
                      <TableRow key={p.id}>
                        <TableCell className="pl-5 font-mono text-xs font-semibold text-[var(--text)]">
                          PAY-{String(p.id).padStart(4, '0')}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                            isReceived ? 'bg-green-500/15 text-green-400 border-green-500/30' : 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                          }`}>
                            {isReceived ? <ArrowDownLeft size={10} /> : <ArrowUpRight size={10} />}
                            {isReceived ? 'Customer Receipt' : 'Vendor Payment'}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-[var(--text-muted)]">
                          {new Date(p.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </TableCell>
                        <TableCell className="text-xs text-[var(--text)] font-medium">
                          {p.journal?.name || 'Bank Journal'}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-[var(--text-muted)]">
                          {p.customerInvoice ? `Invoice #INV-${String(p.customerInvoice.id).padStart(4, '0')}` : (p.vendorBill ? `Bill/2026/${String(p.vendorBill.id).padStart(4, '0')}` : 'General Ledger')}
                        </TableCell>
                        <TableCell className="text-right text-sm font-bold text-emerald-400">
                          {fmt(Number(p.amount))}
                        </TableCell>
                        <TableCell className="pr-5 text-right">
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-400">
                            <CheckCircle2 size={12} /> Settled
                          </span>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
