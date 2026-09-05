import { useEffect, useState } from 'react'
import {
  ShoppingCart, Plus, X, Loader2, Trash2,
  ChevronRight, FileText, CheckCircle2, Clock, XCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  useTransactionStore, useContactStore, useProductStore,
  type PurchaseOrder, type OrderLine,
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

const EMPTY_LINE: Omit<OrderLine, 'subtotal'> = {
  productId: 0, productName: '', quantity: 1, unitPrice: 0, tax: 0,
}

function calcSubtotal(l: Omit<OrderLine, 'subtotal'>) {
  return l.quantity * l.unitPrice * (1 + l.tax / 100)
}

/* ─── Detail Panel ──────────────────────────────────────────── */
function PODetail({
  po, onClose, onConvertToBill,
}: {
  po: PurchaseOrder
  onClose: () => void
  onConvertToBill: (id: number) => Promise<void>
}) {
  const [converting, setConverting] = useState(false)

  async function handleConvert() {
    setConverting(true)
    await onConvertToBill(po.id)
    setConverting(false)
    onClose()
  }

  const StatusIcon = STATUS_ICON[po.status] ?? Clock

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2 flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold text-[var(--text)]">
          PO #{po.id} — {po.vendorName}
        </CardTitle>
        <div className="flex items-center gap-2">
          {!po.billId && po.status !== 'cancelled' && (
            <Button size="sm" variant="outline" className="h-7 text-xs gap-1"
              disabled={converting} onClick={handleConvert}>
              {converting
                ? <><Loader2 size={11} className="animate-spin" /> Converting…</>
                : <><FileText size={11} /> Convert to Bill</>}
            </Button>
          )}
          {po.billId && (
            <span className="text-xs text-green-400 flex items-center gap-1">
              <CheckCircle2 size={11} /> Bill #{po.billId} created
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
            <p className="text-[var(--text-muted)]">Vendor</p>
            <p className="font-medium text-[var(--text)]">{po.vendorName}</p>
          </div>
          <div>
            <p className="text-[var(--text-muted)]">Date</p>
            <p className="font-medium text-[var(--text)]">{po.date}</p>
          </div>
          <div>
            <p className="text-[var(--text-muted)]">Status</p>
            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${STATUS_STYLE[po.status]}`}>
              <StatusIcon size={10} /> {po.status}
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
            {po.lines.map((l, i) => (
              <TableRow key={i}>
                <TableCell className="pl-3 text-xs">{l.productName}</TableCell>
                <TableCell className="text-right text-xs">{l.quantity}</TableCell>
                <TableCell className="text-right text-xs">{fmt(l.unitPrice)}</TableCell>
                <TableCell className="text-right text-xs">{l.tax}%</TableCell>
                <TableCell className="text-right pr-3 text-xs font-medium">{fmt(l.subtotal)}</TableCell>
              </TableRow>
            ))}
            <TableRow className="border-t-2">
              <TableCell colSpan={4} className="pl-3 text-xs font-semibold">Total</TableCell>
              <TableCell className="text-right pr-3 font-bold text-[var(--accent)]">{fmt(po.total)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

/* ─── Page ──────────────────────────────────────────────────── */
export default function PurchaseOrderPage() {
  const {
    purchaseOrders, loading, error,
    fetchPurchaseOrders, createPurchaseOrder, createBillFromPO,
  } = useTransactionStore()
  const { contacts, fetchAll: fetchContacts } = useContactStore()
  const { products, fetchAll: fetchProducts } = useProductStore()

  const [showForm,  setShowForm]  = useState(false)
  const [selected,  setSelected]  = useState<PurchaseOrder | null>(null)
  const [saving,    setSaving]    = useState(false)
  const [formErr,   setFormErr]   = useState('')

  const [vendorId,  setVendorId]  = useState(0)
  const [date,      setDate]      = useState(new Date().toISOString().slice(0, 10))
  const [lines,     setLines]     = useState<Omit<OrderLine, 'subtotal'>[]>([{ ...EMPTY_LINE }])

  useEffect(() => {
    fetchPurchaseOrders()
    fetchContacts()
    fetchProducts()
  }, []) // eslint-disable-line

  const vendors = contacts.filter(c => c.type === 'VENDOR' || c.type === 'BOTH')

  function addLine() {
    setLines(ls => [...ls, { ...EMPTY_LINE }])
  }
  function removeLine(idx: number) {
    setLines(ls => ls.filter((_, i) => i !== idx))
  }
  function updateLine(idx: number, key: keyof typeof EMPTY_LINE, val: string | number) {
    setLines(ls => {
      const next = [...ls]
      if (key === 'productId') {
        const prod = products.find(p => p.id === +val)
        next[idx] = { ...next[idx], productId: +val, productName: prod?.name ?? '', unitPrice: prod?.cost ?? 0 }
      } else {
        next[idx] = { ...next[idx], [key]: key === 'productName' ? val : +val }
      }
      return next
    })
  }

  const orderTotal = lines.reduce((s, l) => s + calcSubtotal(l), 0)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormErr('')
    if (!vendorId) { setFormErr('Please select a vendor.'); return }
    if (lines.some(l => !l.productId)) { setFormErr('All lines must have a product selected.'); return }
    setSaving(true)
    try {
      const vendor = vendors.find(v => v.id === vendorId)
      await createPurchaseOrder({
        vendorId,
        vendorName: vendor?.name ?? '',
        date,
        lines: lines.map(l => ({ ...l, subtotal: calcSubtotal(l) })),
        total: orderTotal,
      })
      setShowForm(false)
      resetForm()
    } catch (err: any) {
      setFormErr(err.message ?? 'Failed to create purchase order.')
    } finally { setSaving(false) }
  }

  function resetForm() {
    setVendorId(0); setDate(new Date().toISOString().slice(0, 10))
    setLines([{ ...EMPTY_LINE }]); setFormErr('')
  }

  async function handleConvert(poId: number) {
    await convertToBill(poId)
    fetchPurchaseOrders()
  }

  return (
    <div className="db-page">
      <div className="db-page-header">
        <div>
          <h1 className="db-page-title">Purchase Orders</h1>
          <p className="db-page-sub">Create and manage purchase orders from vendors.</p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => { setShowForm(v => !v); setSelected(null) }}>
          {showForm ? <X size={13} /> : <Plus size={13} />}
          {showForm ? 'Cancel' : 'New PO'}
        </Button>
      </div>

      {/* ── Detail panel ────────────────────────────── */}
      {selected && !showForm && (
        <PODetail
          po={selected}
          onClose={() => setSelected(null)}
          onConvertToBill={handleConvert}
        />
      )}

      {/* ── Create Form ──────────────────────────────── */}
      {showForm && (
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">New Purchase Order</CardTitle>
          </CardHeader>
          <CardContent>
            {formErr && (
              <div className="auth-error mb-3">
                <span>{formErr}</span>
                <button onClick={() => setFormErr('')} className="auth-error-close">✕</button>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="auth-field">
                  <label className="auth-label">Vendor <span className="text-red-400">*</span></label>
                  <select className="auth-input" value={vendorId}
                    onChange={e => setVendorId(+e.target.value)}>
                    <option value={0}>— select vendor —</option>
                    {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                </div>
                <div className="auth-field">
                  <label className="auth-label">PO Date <span className="text-red-400">*</span></label>
                  <input type="date" className="auth-input" value={date}
                    onChange={e => setDate(e.target.value)} required />
                </div>
              </div>

              {/* PO Lines */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">PO Lines</p>
                  <button type="button" onClick={addLine}
                    className="text-xs text-[var(--accent)] hover:underline flex items-center gap-1">
                    <Plus size={11} /> Add Line
                  </button>
                </div>
                <div className="border border-[var(--border)] rounded-lg overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-[var(--surface-2)]">
                      <tr>
                        <th className="text-left px-3 py-2 font-semibold text-[var(--text-muted)]">Product</th>
                        <th className="text-right px-2 py-2 font-semibold text-[var(--text-muted)] w-20">Qty</th>
                        <th className="text-right px-2 py-2 font-semibold text-[var(--text-muted)] w-28">Unit Price</th>
                        <th className="text-right px-2 py-2 font-semibold text-[var(--text-muted)] w-20">Tax %</th>
                        <th className="text-right px-2 py-2 font-semibold text-[var(--text-muted)] w-28">Subtotal</th>
                        <th className="w-8" />
                      </tr>
                    </thead>
                    <tbody>
                      {lines.map((line, idx) => (
                        <tr key={idx} className="border-t border-[var(--border)]">
                          <td className="px-3 py-1.5">
                            <select className="auth-input py-1 text-xs" value={line.productId}
                              onChange={e => updateLine(idx, 'productId', e.target.value)}>
                              <option value={0}>— select —</option>
                              {products.filter(p => !p.isArchived).map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-2 py-1.5">
                            <input type="number" min="1" className="auth-input py-1 text-xs text-right"
                              value={line.quantity}
                              onChange={e => updateLine(idx, 'quantity', e.target.value)} />
                          </td>
                          <td className="px-2 py-1.5">
                            <input type="number" min="0" step="0.01" className="auth-input py-1 text-xs text-right"
                              value={line.unitPrice}
                              onChange={e => updateLine(idx, 'unitPrice', e.target.value)} />
                          </td>
                          <td className="px-2 py-1.5">
                            <input type="number" min="0" max="100" step="0.5" className="auth-input py-1 text-xs text-right"
                              value={line.tax}
                              onChange={e => updateLine(idx, 'tax', e.target.value)} />
                          </td>
                          <td className="px-2 py-1.5 text-right font-medium text-[var(--text)]">
                            {fmt(calcSubtotal(line))}
                          </td>
                          <td className="px-2 py-1.5">
                            {lines.length > 1 && (
                              <button type="button" onClick={() => removeLine(idx)}
                                className="text-red-400 hover:text-red-300">
                                <X size={13} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-[var(--surface-2)] border-t border-[var(--border)]">
                      <tr>
                        <td colSpan={4} className="px-3 py-2 text-xs font-semibold text-[var(--text-muted)]">Total</td>
                        <td className="px-2 py-2 text-right text-sm font-bold text-[var(--accent)]">{fmt(orderTotal)}</td>
                        <td />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => { setShowForm(false); resetForm() }}>Cancel</Button>
                <Button type="submit" size="sm" disabled={saving}>
                  {saving ? <><Loader2 size={13} className="animate-spin mr-1" />Creating…</> : 'Create PO'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="auth-error mb-3">
          <span>{error}</span>
        </div>
      )}

      {/* ── List ─────────────────────────────────────── */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 size={24} className="animate-spin text-[var(--accent)]" />
            </div>
          ) : purchaseOrders.length === 0 ? (
            <div className="flex flex-col items-center gap-2 p-12 text-[var(--text-muted)]">
              <ShoppingCart size={32} className="opacity-30" />
              <p className="text-sm">No purchase orders yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-5">#</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Bill</TableHead>
                  <TableHead className="pr-5 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchaseOrders.map(po => {
                  const StatusIcon = STATUS_ICON[po.status] ?? Clock
                  return (
                    <TableRow
                      key={po.id}
                      className="cursor-pointer hover:bg-[var(--surface-2)]"
                      onClick={() => { setSelected(po); setShowForm(false) }}
                    >
                      <TableCell className="pl-5 font-mono text-xs text-[var(--text-muted)]">#{po.id}</TableCell>
                      <TableCell className="text-sm font-medium text-[var(--text)]">{po.vendorName}</TableCell>
                      <TableCell className="text-xs text-[var(--text-muted)]">{po.date}</TableCell>
                      <TableCell className="text-right text-sm font-semibold">{fmt(po.total)}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${STATUS_STYLE[po.status]}`}>
                          <StatusIcon size={10} /> {po.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        {po.billId
                          ? <span className="text-xs text-green-400">Bill #{po.billId}</span>
                          : <span className="text-xs text-[var(--text-faint)]">—</span>}
                      </TableCell>
                      <TableCell className="pr-5 text-right" onClick={e => e.stopPropagation()}>
                        <button
                          className="p-1.5 rounded hover:bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                          onClick={() => { setSelected(po); setShowForm(false) }}
                          title="View details"
                        >
                          <ChevronRight size={14} />
                        </button>
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
