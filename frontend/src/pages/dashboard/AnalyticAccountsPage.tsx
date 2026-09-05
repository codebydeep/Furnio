import { useEffect, useState } from 'react'
import {
  PieChart, Plus, X, Loader2, Pencil, TrendingUp, TrendingDown,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { useBudgetStore, type AnalyticAccount, type AnalyticType } from '@/store'

const TYPE_BADGE: Record<AnalyticType, string> = {
  INCOME:  'bg-green-500/15 text-green-400 border-green-500/30',
  EXPENSE: 'bg-red-500/15   text-red-400   border-red-500/30',
}

const EMPTY = { name: '', type: 'INCOME' as AnalyticType }

export default function AnalyticAccountsPage() {
  const {
    analyticAccounts, loading, error,
    fetchAnalyticAccounts, createAnalyticAccount, updateAnalyticAccount, clearError,
  } = useBudgetStore()

  const [showForm, setShowForm] = useState(false)
  const [editing,  setEditing]  = useState<AnalyticAccount | null>(null)
  const [form,     setForm]     = useState(EMPTY)
  const [saving,   setSaving]   = useState(false)
  const [formErr,  setFormErr]  = useState('')
  const [search,   setSearch]   = useState('')

  useEffect(() => { fetchAnalyticAccounts() }, []) // eslint-disable-line

  function openCreate() {
    setEditing(null); setForm(EMPTY); setFormErr(''); setShowForm(true)
  }
  function openEdit(aa: AnalyticAccount) {
    setEditing(aa); setForm({ name: aa.name, type: aa.type }); setFormErr(''); setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setFormErr(''); setSaving(true)
    try {
      if (editing) {
        await updateAnalyticAccount(editing.id, form)
      } else {
        await createAnalyticAccount(form)
      }
      setShowForm(false)
    } catch (err: any) {
      setFormErr(err.message ?? 'Operation failed.')
    } finally { setSaving(false) }
  }

  const filtered = analyticAccounts.filter(aa =>
    aa.name.toLowerCase().includes(search.toLowerCase())
  )

  const incomeCount  = analyticAccounts.filter(a => a.type === 'INCOME').length
  const expenseCount = analyticAccounts.filter(a => a.type === 'EXPENSE').length

  return (
    <div className="db-page">
      <div className="db-page-header">
        <div>
          <h1 className="db-page-title">Analytic Accounts</h1>
          <p className="db-page-sub">Tag journal items and order lines for budget tracking.</p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={openCreate}>
          <Plus size={13} /> New Analytic Account
        </Button>
      </div>

      {/* ── Summary KPIs ──────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-[var(--text-muted)]">Total</p>
            <p className="text-2xl font-bold text-[var(--text)] mt-0.5">{analyticAccounts.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-1.5 mb-0.5">
              <TrendingUp size={13} className="text-green-400" />
              <p className="text-xs text-[var(--text-muted)]">Income</p>
            </div>
            <p className="text-2xl font-bold text-green-400">{incomeCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-1.5 mb-0.5">
              <TrendingDown size={13} className="text-red-400" />
              <p className="text-xs text-[var(--text-muted)]">Expense</p>
            </div>
            <p className="text-2xl font-bold text-red-400">{expenseCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Form ──────────────────────────────────────── */}
      {showForm && (
        <Card className="mb-4">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-[var(--text)]">
                {editing ? `Edit — ${editing.name}` : 'New Analytic Account'}
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
            <form onSubmit={handleSubmit} className="flex gap-3 items-end flex-wrap">
              <div className="auth-field flex-1 min-w-48">
                <label className="auth-label">Name <span className="text-red-400">*</span></label>
                <input className="auth-input" required value={form.name}
                  placeholder="e.g. Q3 Sales Campaign"
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="auth-field w-40">
                <label className="auth-label">Type <span className="text-red-400">*</span></label>
                <select className="auth-input" value={form.type}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value as AnalyticType }))}>
                  <option value="INCOME">Income</option>
                  <option value="EXPENSE">Expense</option>
                </select>
              </div>
              <div className="flex gap-2 mb-0.5">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={saving}>
                  {saving ? <Loader2 size={13} className="animate-spin" /> : (editing ? 'Update' : 'Create')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* ── Search ────────────────────────────────────── */}
      <div className="relative mb-3">
        <input className="auth-input pl-3 w-full max-w-xs"
          placeholder="Search analytic accounts…"
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {error && (
        <div className="auth-error mb-3">
          <span>{error}</span>
          <button onClick={clearError} className="auth-error-close">✕</button>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 size={24} className="animate-spin text-[var(--accent)]" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 p-12 text-[var(--text-muted)]">
              <PieChart size={32} className="opacity-30" />
              <p className="text-sm">No analytic accounts found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-5">#</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="pr-5 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(aa => (
                  <TableRow key={aa.id}>
                    <TableCell className="pl-5 font-mono text-xs text-[var(--text-muted)]">#{aa.id}</TableCell>
                    <TableCell className="text-sm font-medium text-[var(--text)]">{aa.name}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${TYPE_BADGE[aa.type]}`}>
                        {aa.type === 'INCOME'
                          ? <TrendingUp size={10} />
                          : <TrendingDown size={10} />}
                        {aa.type}
                      </span>
                    </TableCell>
                    <TableCell className="pr-5 text-right">
                      <button onClick={() => openEdit(aa)}
                        className="p-1.5 rounded hover:bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
                        <Pencil size={13} />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
