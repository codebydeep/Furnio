import { useEffect, useState } from 'react'
import {
  ShoppingCart, Plus, Loader2,
  ChevronRight, CheckCircle2, ArrowLeft,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  useTransactionStore, useContactStore, useProductStore, useBudgetStore,
  type SalesOrder, type OrderLine,
} from '@/store'

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
}

const STATUS_STYLE: Record<string, string> = {
  DRAFT:     'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
  CONFIRMED: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  DONE:      'bg-green-500/15 text-green-400 border-green-500/30',
  CANCELLED: 'bg-red-500/15 text-red-400 border-red-500/30',
}

const EMPTY_LINE: Omit<OrderLine, 'subtotal'> & { analyticId?: number } = {
  productId: 0, productName: '', quantity: 1, unitPrice: 0, tax: 0, analyticId: 0,
}

export default function SalesOrderPage() {
  const {
    salesOrders, loading, error,
    fetchSalesOrders, createSalesOrder, createInvoice,
  } = useTransactionStore()
  const { contacts, fetchAll: fetchContacts } = useContactStore()
  const { products, fetchAll: fetchProducts } = useProductStore()
  const { analyticAccounts, fetchAnalyticAccounts } = useBudgetStore()

  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState<SalesOrder | null>(null)
  const [saving,   setSaving]   = useState(false)
  const [formErr,  setFormErr]  = useState('')

  const [customerId, setCustomerId] = useState(0)
  const [date,       setDate]       = useState(new Date().toISOString().slice(0, 10))
  const [lines,      setLines]      = useState<(Omit<OrderLine, 'subtotal'> & { analyticId?: number })[]>([{ ...EMPTY_LINE }])

  useEffect(() => {
    fetchSalesOrders()
    fetchContacts()
    fetchProducts()
    fetchAnalyticAccounts()
  }, []) // eslint-disable-line

  const customers = contacts.filter(c => c.type === 'CUSTOMER' || c.type === 'BOTH')


  function addLine() {
    setLines(ls => [...ls, { ...EMPTY_LINE }])
  }
  function removeLine(idx: number) {
    setLines(ls => ls.filter((_, i) => i !== idx))
  }
  function updateLine(idx: number, key: string, val: any) {
    setLines(ls => {
      const next = [...ls]
      if (key === 'productId') {
        const prod = products.find(p => p.id === +val)
        next[idx] = { ...next[idx], productId: +val, productName: prod?.name ?? '', unitPrice: prod?.salesPrice ?? 0 }
      } else if (key === 'analyticId') {
        next[idx] = { ...next[idx], analyticId: +val }
      } else {
        next[idx] = { ...next[idx], [key]: key === 'productName' ? val : +val }
      }
      return next
    })
  }

  const orderTotal = lines.reduce((s, l) => s + (l.quantity * l.unitPrice), 0)
  const nextSoNo = `SO${String((salesOrders[0]?.id || 0) + 1).padStart(4, '0')}`

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormErr('')
    if (!customerId) { setFormErr('Please select a customer.'); return }
    if (lines.some(l => !l.productId)) { setFormErr('All lines must have a product selected.'); return }
    setSaving(true)
    try {
      await createSalesOrder({
        customerId,
        soDate: date,
        items: lines.map(l => ({
          productId: l.productId,
          quantity:  l.quantity,
          unitPrice: l.unitPrice,
          taxRate:   0,
        })),
      })
      setShowForm(false)
      resetForm()
      fetchSalesOrders()
    } catch (err: any) {
      setFormErr(err.message ?? 'Failed to create sales order.')
    } finally { setSaving(false) }
  }

  function resetForm() {
    setCustomerId(0)
    setDate(new Date().toISOString().slice(0, 10))
    setLines([{ ...EMPTY_LINE }])
    setFormErr('')
  }

  async function handleCreateInvoice(soId: number) {
    await createInvoice(soId)
    fetchSalesOrders()
    setSelected(null)
  }

  return (
    <div className="db-page space-y-6">
      <div className="db-page-header">
        <div>
          <h1 className="db-page-title">Sales Order</h1>
          <p className="db-page-sub">Auto-sequenced SOs with Budget Analytics mapping</p>
        </div>
        {!showForm && !selected && (
          <button
            onClick={() => { setShowForm(true); resetForm() }}
            className="wf-btn wf-btn-white"
          >
            <Plus size={13} /> New Sales Order
          </button>
        )}
      </div>

      {error && <div className="auth-error mb-3"><span>{error}</span></div>}

      {/* ═════════════════════════════════════════════════════
          SCREENSHOT 4: DETAIL PANEL (VIEWING AN EXISTING SO)
      ═════════════════════════════════════════════════════ */}
      {selected && !showForm && (
        <div className="wf-panel border border-white/15 space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-white/10 flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setSelected(null); setShowForm(true); resetForm() }}
                className="wf-btn wf-btn-white"
              >
                New
              </button>
              <button disabled className="wf-btn wf-btn-lavender">
                Confirm
              </button>
              {!selected.invoiceId && selected.status !== 'CANCELLED' && (
                <button
                  onClick={() => handleCreateInvoice(selected.id)}
                  className="wf-btn wf-btn-blue"
                >
                  Create Invoice
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {selected.invoiceId && (
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 mr-2">
                  <CheckCircle2 size={13} /> Invoice #{selected.invoiceId} Created
                </span>
              )}
              <button
                onClick={() => setSelected(null)}
                className="wf-btn wf-btn-dark"
              >
                <ArrowLeft size={13} /> Back
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs bg-white/[0.02] p-4 rounded-xl border border-white/5">
            <div>
              <span className="text-slate-400 block mb-1">SO No.</span>
              <span className="text-sm font-bold font-mono text-white">SO{String(selected.id).padStart(4, '0')}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Customer Name</span>
              <span className="text-sm font-semibold text-slate-200">{selected.customerName}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">SO Date</span>
              <span className="text-sm font-medium text-slate-300">{selected.date}</span>
            </div>
          </div>

          <div className="border border-white/10 rounded-xl overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-white/[0.03] border-b border-white/10 text-slate-300 font-semibold">
                <tr>
                  <th className="py-3 px-4 text-left w-16">Sr. No.</th>
                  <th className="py-3 px-4 text-left">Product</th>
                  <th className="py-3 px-4 text-left">Budget Analytics</th>
                  <th className="py-3 px-4 text-right w-24">Qty</th>
                  <th className="py-3 px-4 text-right w-28">Unit Price</th>
                  <th className="py-3 px-4 text-right w-28">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-200">
                {selected.lines.map((l, i) => (
                  <tr key={i} className="hover:bg-white/[0.02]">
                    <td className="py-2.5 px-4 font-mono text-slate-400">{i + 1}.</td>
                    <td className="py-2.5 px-4 font-medium">{l.productName}</td>
                    <td className="py-2.5 px-4 text-purple-300">Project 1</td>
                    <td className="py-2.5 px-4 text-right font-mono">{l.quantity}</td>
                    <td className="py-2.5 px-4 text-right font-mono">{fmt(l.unitPrice)}</td>
                    <td className="py-2.5 px-4 text-right font-mono font-semibold">{fmt(l.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t border-white/10 bg-white/[0.02] font-bold">
                <tr>
                  <td colSpan={5} className="py-3 px-4 text-slate-300 text-sm">Total</td>
                  <td className="py-3 px-4 text-right text-base text-purple-300 font-mono">{fmt(selected.total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════
          SCREENSHOT 4: CREATE FORM (MATCHING WIREFRAME)
      ═════════════════════════════════════════════════════ */}
      {showForm && (
        <form onSubmit={handleSubmit} className="wf-panel border border-white/15 space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-white/10 flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={resetForm}
                className="wf-btn wf-btn-white"
              >
                New
              </button>
              <button
                type="submit"
                disabled={saving}
                className="wf-btn wf-btn-lavender"
              >
                {saving ? <><Loader2 size={12} className="animate-spin" /> Saving…</> : 'Confirm'}
              </button>
              <button
                type="button"
                disabled
                className="wf-btn wf-btn-blue opacity-50"
                title="Available after confirmation"
              >
                Create Invoice
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => { setShowForm(false); resetForm() }}
                className="wf-btn wf-btn-dark"
              >
                Back
              </button>
            </div>
          </div>

          {formErr && <div className="auth-error"><span>{formErr}</span></div>}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="auth-field">
              <label className="auth-label">SO No. (Auto-sequence)</label>
              <input
                type="text"
                disabled
                value={nextSoNo}
                className="auth-input font-mono bg-white/5 opacity-80"
              />
            </div>
            <div className="auth-field">
              <label className="auth-label">Customer Name <span className="text-red-400">*</span></label>
              <select
                className="auth-input"
                value={customerId}
                onChange={e => setCustomerId(+e.target.value)}
                required
              >
                <option value={0}>— select customer (Contact Master) —</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="auth-field">
              <label className="auth-label">SO Date <span className="text-red-400">*</span></label>
              <input
                type="date"
                className="auth-input"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="border border-white/10 rounded-xl overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-white/[0.03] border-b border-white/10 text-slate-300 font-semibold">
                <tr>
                  <th className="py-3 px-3 text-left w-14">Sr. No.</th>
                  <th className="py-3 px-3 text-left">Product</th>
                  <th className="py-3 px-3 text-left">Budget Analytics</th>
                  <th className="py-3 px-3 text-right w-24">Qty</th>
                  <th className="py-3 px-3 text-right w-28">Unit Price</th>
                  <th className="py-3 px-3 text-right w-28">Total</th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {lines.map((line, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02]">
                    <td className="py-2.5 px-3 font-mono text-slate-400">{idx + 1}.</td>
                    <td className="py-2 px-3">
                      <select
                        className="auth-input py-1 text-xs"
                        value={line.productId}
                        onChange={e => updateLine(idx, 'productId', e.target.value)}
                      >
                        <option value={0}>— select product —</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 px-3">
                      <select
                        className="auth-input py-1 text-xs"
                        value={line.analyticId || 0}
                        onChange={e => updateLine(idx, 'analyticId', e.target.value)}
                      >
                        <option value={0}>Project 1 (Default)</option>
                        {analyticAccounts.map((a: any) => (
                          <option key={a.id} value={a.id}>{a.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        min="1"
                        className="auth-input py-1 text-xs text-right font-mono"
                        value={line.quantity}
                        onChange={e => updateLine(idx, 'quantity', e.target.value)}
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        min="0"
                        className="auth-input py-1 text-xs text-right font-mono"
                        value={line.unitPrice}
                        onChange={e => updateLine(idx, 'unitPrice', e.target.value)}
                      />
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-200">
                      {fmt(line.quantity * line.unitPrice)}
                    </td>
                    <td className="py-2 px-2 text-center">
                      {lines.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLine(idx)}
                          className="text-red-400 hover:text-red-300 text-xs"
                        >
                          ✕
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t border-white/10 bg-white/[0.02]">
                <tr>
                  <td colSpan={5} className="py-3 px-3">
                    <button
                      type="button"
                      onClick={addLine}
                      className="text-xs text-blue-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <Plus size={12} /> Add Line
                    </button>
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-sm text-purple-300 font-mono">
                    {fmt(orderTotal)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </form>
      )}

      {/* ── Sales Orders List View ──────────────────────── */}
      {!showForm && !selected && (
        <Card className="border border-white/10 bg-[#12151b]">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 size={24} className="animate-spin text-purple-400" />
              </div>
            ) : salesOrders.length === 0 ? (
              <div className="flex flex-col items-center gap-2 p-12 text-slate-400">
                <ShoppingCart size={32} className="opacity-30" />
                <p className="text-sm">No sales orders found.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10">
                    <TableHead className="pl-5 text-slate-400">SO No.</TableHead>
                    <TableHead className="text-slate-400">Customer</TableHead>
                    <TableHead className="text-slate-400">Date</TableHead>
                    <TableHead className="text-right text-slate-400">Total</TableHead>
                    <TableHead className="text-slate-400">Status</TableHead>
                    <TableHead className="text-slate-400">Invoice</TableHead>
                    <TableHead className="pr-5 text-right" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesOrders.map(so => {
                    const statusCls = STATUS_STYLE[so.status] || STATUS_STYLE.DRAFT
                    return (
                      <TableRow
                        key={so.id}
                        className="cursor-pointer hover:bg-white/5 border-white/5"
                        onClick={() => setSelected(so)}
                      >
                        <TableCell className="pl-5 font-mono text-xs font-semibold text-purple-400">
                          SO{String(so.id).padStart(4, '0')}
                        </TableCell>
                        <TableCell className="text-sm font-medium text-slate-200">{so.customerName}</TableCell>
                        <TableCell className="text-xs text-slate-400">{so.date}</TableCell>
                        <TableCell className="text-right text-sm font-semibold font-mono text-slate-200">
                          {fmt(so.grandTotal || so.total)}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${statusCls}`}>
                            {so.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          {so.invoiceId ? (
                            <span className="text-xs text-emerald-400 font-medium">Inv #{so.invoiceId}</span>
                          ) : (
                            <span className="text-xs text-slate-500">—</span>
                          )}
                        </TableCell>
                        <TableCell className="pr-5 text-right">
                          <button className="p-1.5 rounded text-slate-400 hover:text-white">
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
      )}
    </div>
  )
}
