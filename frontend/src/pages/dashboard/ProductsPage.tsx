import { useEffect, useState } from 'react'
import {
  Package, Plus, X, Loader2, Search, Archive,
  RefreshCw, Pencil, Tag, LayoutGrid, List,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { useProductStore, type Product, type ProductPayload, type ProductType } from '@/store'

const TYPE_BADGE: Record<ProductType, string> = {
  GOODS:   'bg-green-500/15  text-green-400  border-green-500/30',
  SERVICE: 'bg-blue-500/15   text-blue-400   border-blue-500/30',
  COMBO:   'bg-purple-500/15 text-purple-400 border-purple-500/30',
}

const EMPTY: ProductPayload = {
  name: '', type: 'GOODS', salesPrice: 0, cost: 0,
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
}

export default function ProductsPage() {
  const {
    products, loading, error,
    fetchAll, create, update, archive, clearError,
  } = useProductStore()

  const [search,       setSearch]       = useState('')
  const [viewMode,     setViewMode]     = useState<'list' | 'kanban'>('list')
  const [showArchived, setShowArchived] = useState(false)
  const [showForm,     setShowForm]     = useState(false)
  const [editing,      setEditing]      = useState<Product | null>(null)
  const [form,         setForm]         = useState<ProductPayload>(EMPTY)
  const [saving,       setSaving]       = useState(false)
  const [formErr,      setFormErr]      = useState('')

  useEffect(() => { fetchAll(showArchived) }, [showArchived]) // eslint-disable-line

  function openCreate() {
    setEditing(null); setForm(EMPTY); setFormErr(''); setShowForm(true)
  }

  function openEdit(p: Product) {
    setEditing(p)
    setForm({ name: p.name, type: p.type, salesPrice: p.salesPrice, cost: p.cost, category: p.category ?? '' })
    setFormErr(''); setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setFormErr(''); setSaving(true)
    try {
      if (editing) await update(editing.id, form)
      else         await create(form)
      setShowForm(false)
    } catch (err: any) {
      setFormErr(err.message ?? 'Operation failed.')
    } finally { setSaving(false) }
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.category ?? '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="db-page">
      <div className="db-page-header">
        <div>
          <h1 className="db-page-title">Products</h1>
          <p className="db-page-sub">Manage goods, services and combo products.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShowArchived(v => !v)}>
            {showArchived ? <RefreshCw size={13} /> : <Archive size={13} />}
            {showArchived ? 'Hide Archived' : 'Show Archived'}
          </Button>
          <Button size="sm" className="gap-1.5" onClick={openCreate}>
            <Plus size={13} /> New Product
          </Button>
        </div>
      </div>

      {showForm && (
        <Card className="mb-4">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-[var(--text)]">
                {editing ? `Edit — ${editing.name}` : 'New Product'}
              </span>
              <button onClick={() => setShowForm(false)} className="text-[var(--text-muted)] hover:text-[var(--text)]">
                <X size={15} />
              </button>
            </div>
            {formErr && (
              <div className="auth-error mb-3">
                <span>{formErr}</span>
                <button onClick={() => setFormErr('')} className="auth-error-close">✕</button>
              </div>
            )}
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="auth-field sm:col-span-2">
                <label className="auth-label">Product Name <span className="text-red-400">*</span></label>
                <input className="auth-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="auth-field">
                <label className="auth-label">Type <span className="text-red-400">*</span></label>
                <select className="auth-input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as ProductType }))}>
                  <option value="GOODS">Goods</option>
                  <option value="SERVICE">Service</option>
                  <option value="COMBO">Combo</option>
                </select>
              </div>
              <div className="auth-field">
                <label className="auth-label">Sales Price (₹) <span className="text-red-400">*</span></label>
                <input className="auth-input" type="number" min="0" step="0.01"
                  value={form.salesPrice}
                  onChange={e => setForm(f => ({ ...f, salesPrice: parseFloat(e.target.value) || 0 }))}
                  required
                />
              </div>
              <div className="auth-field">
                <label className="auth-label">Cost (₹)</label>
                <input className="auth-input" type="number" min="0" step="0.01"
                  value={form.cost}
                  onChange={e => setForm(f => ({ ...f, cost: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div className="auth-field">
                <label className="auth-label">Category</label>
                <input className="auth-input" value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
              </div>
              <div className="col-span-2 sm:col-span-3 flex justify-end gap-2 pt-1">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" size="sm" disabled={saving}>
                  {saving ? <><Loader2 size={13} className="animate-spin mr-1" />Saving…</> : (editing ? 'Update' : 'Create')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* ── Toolbar: Search + View Mode Switcher ─────── */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            className="auth-input pl-8 w-full"
            placeholder="Search products…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* View Mode Toggle: [List] [Kanban] */}
        <div className="flex items-center p-0.5 rounded-lg border border-[var(--border)] bg-[var(--surface-2)]">
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`px-2.5 py-1 rounded flex items-center gap-1.5 text-xs font-medium transition-colors ${
              viewMode === 'list'
                ? 'bg-[var(--surface)] text-[var(--text)] shadow-sm font-semibold'
                : 'text-[var(--text-muted)] hover:text-[var(--text)]'
            }`}
            title="List View"
          >
            <List size={13} />
            <span>List</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('kanban')}
            className={`px-2.5 py-1 rounded flex items-center gap-1.5 text-xs font-medium transition-colors ${
              viewMode === 'kanban'
                ? 'bg-[var(--surface)] text-[var(--text)] shadow-sm font-semibold'
                : 'text-[var(--text-muted)] hover:text-[var(--text)]'
            }`}
            title="Kanban View"
          >
            <LayoutGrid size={13} />
            <span>Kanban</span>
          </button>
        </div>
      </div>

      {/* ── Error ───────────────────────────────────── */}
      {error && (
        <div className="auth-error mb-3">
          <span>{error}</span>
          <button onClick={clearError} className="auth-error-close">✕</button>
        </div>
      )}

      {/* ── Content View: List or Kanban ────────────── */}
      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center p-12">
            <Loader2 size={24} className="animate-spin text-[var(--accent)]" />
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-2 p-12 text-[var(--text-muted)]">
            <Package size={32} className="opacity-30" />
            <p className="text-sm">No products found.</p>
          </CardContent>
        </Card>
      ) : viewMode === 'kanban' ? (
        /* Kanban Card Grid (Wireframe Page 1) */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {filtered.map(p => (
            <Card
              key={p.id}
              onClick={() => openEdit(p)}
              className={`cursor-pointer border border-[var(--border)] hover:border-[var(--accent)]/60 hover:shadow-md transition-all group bg-[var(--surface)] ${
                p.isArchived ? 'opacity-50' : ''
              }`}
            >
              <CardContent className="p-4 flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-lg bg-[var(--surface-2)] flex items-center justify-center border border-[var(--border)] group-hover:border-[var(--accent)]/40 transition-colors shrink-0">
                        <Package size={18} className="text-[var(--accent)]" />
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="text-sm font-semibold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors truncate">
                          {p.name}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`text-[10px] font-semibold px-2 py-0.2 rounded-full border ${TYPE_BADGE[p.type]}`}>
                            {p.type}
                          </span>
                          {p.category && (
                            <span className="text-[10px] text-[var(--text-muted)] truncate max-w-[80px]">
                              {p.category}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs mt-3 pt-3 border-t border-[var(--border)]/60">
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--text-muted)]">Sales Price:</span>
                      <span className="font-semibold text-[var(--text)]">{fmt(p.salesPrice)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--text-muted)]">Cost:</span>
                      <span className="font-medium text-[var(--text-muted)]">{fmt(p.cost)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-1 pt-3 mt-3 border-t border-[var(--border)]">
                  <button
                    onClick={e => { e.stopPropagation(); openEdit(p) }}
                    className="p-1.5 rounded hover:bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                    title="Edit (Open Form View)"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); archive(p.id) }}
                    className="p-1.5 rounded hover:bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                    title="Archive"
                  >
                    <Archive size={13} />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* List View (Master default per Page 1 / Page 11 rule) */
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-5">Product</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Sales Price</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead className="pr-5 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(p => (
                  <TableRow
                    key={p.id}
                    onClick={() => openEdit(p)}
                    className={`${p.isArchived ? 'opacity-50' : ''} cursor-pointer hover:bg-[var(--surface-2)]/60 transition-colors`}
                    title="Click to view/edit details"
                  >
                    <TableCell className="pl-5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-md bg-[var(--surface-2)] flex items-center justify-center">
                          <Package size={13} className="text-[var(--text-muted)]" />
                        </div>
                        <span className="text-sm font-medium text-[var(--text)]">{p.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${TYPE_BADGE[p.type]}`}>
                        {p.type}
                      </span>
                    </TableCell>
                    <TableCell>
                      {p.category
                        ? <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]"><Tag size={11} />{p.category}</span>
                        : <span className="text-xs text-[var(--text-faint)]">—</span>
                      }
                    </TableCell>
                    <TableCell className="text-sm font-medium text-[var(--text)]">{fmt(p.salesPrice)}</TableCell>
                    <TableCell className="text-sm text-[var(--text-muted)]">{fmt(p.cost)}</TableCell>
                    <TableCell className="pr-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={e => { e.stopPropagation(); openEdit(p) }}
                          className="p-1.5 rounded hover:bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                          title="Edit"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); archive(p.id) }}
                          className="p-1.5 rounded hover:bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                          title="Archive"
                        >
                          <Archive size={13} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
