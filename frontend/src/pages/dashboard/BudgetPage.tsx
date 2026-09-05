import { useEffect, useState } from 'react'
import {
  PieChart, Plus, X, Loader2, CheckCircle2, RefreshCw,
  Lock, ChevronDown, ChevronUp, TrendingUp, TrendingDown,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  useBudgetStore,
  type Budget, type BudgetStatus, type BudgetPayload,
} from '@/store'
import { useAuthStore } from '@/store/useAuthStore'

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
}

const STATUS_STYLE: Record<BudgetStatus, string> = {
  DRAFT:     'bg-zinc-500/10  text-zinc-400  border-zinc-500/20',
  CONFIRMED: 'bg-blue-500/10  text-blue-400  border-blue-500/20',
  REVISED:   'bg-orange-500/10 text-orange-400 border-orange-500/20',
  DONE:      'bg-green-500/10 text-green-400 border-green-500/20',
}

/* ─── Budget Card ───────────────────────────────────────────── */
function BudgetCard({
  budget, isAdmin, onConfirm, onRevise, onDone,
}: {
  budget:    Budget
  isAdmin:   boolean
  onConfirm: (id: number) => void
  onRevise:  (id: number) => void
  onDone:    (id: number) => void
}) {
  const [open,  setOpen]  = useState(false)
  const [acting, setAct] = useState(false)

  const totalCommitted = budget.lines.reduce((s, l) => s + Number(l.committedAmount), 0)
  const totalAllocated = budget.lines.reduce((s, l) => s + Number(l.allocatedAmount), 0)
  const utilPct        = totalCommitted > 0 ? Math.min((totalAllocated / totalCommitted) * 100, 100) : 0

  async function act(fn: () => Promise<boolean>) {
    setAct(true)
    await fn()
    setAct(false)
  }

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between mb-3 gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-[var(--text)] truncate">{budget.name}</p>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${STATUS_STYLE[budget.status]}`}>
                {budget.status}
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              {new Date(budget.periodStart).toLocaleDateString('en-IN')} →{' '}
              {new Date(budget.periodEnd).toLocaleDateString('en-IN')}
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              {budget.budgetType} · Responsible: {budget.responsiblePerson}
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              Analytic: <span className="text-[var(--text)]">{budget.analyticAccount?.name}</span>
            </p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Lifecycle actions */}
            {budget.status === 'DRAFT' && (
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1"
                disabled={acting} onClick={() => act(() => onConfirm(budget.id) as any)}>
                {acting ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle2 size={11} />}
                Confirm
              </Button>
            )}
            {budget.status === 'CONFIRMED' && (
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1"
                disabled={acting} onClick={() => act(() => onRevise(budget.id) as any)}>
                {acting ? <Loader2 size={11} className="animate-spin" /> : <RefreshCw size={11} />}
                Revise
              </Button>
            )}
            {isAdmin && budget.status !== 'DONE' && (
              <Button size="sm" variant="outline"
                className="h-7 text-xs gap-1 text-green-400 border-green-500/30"
                disabled={acting} onClick={() => act(() => onDone(budget.id) as any)}>
                {acting ? <Loader2 size={11} className="animate-spin" /> : <Lock size={11} />}
                Done
              </Button>
            )}
            <button onClick={() => setOpen(v => !v)}
              className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text)]">
              {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </div>

        {/* Utilisation bar */}
        <div className="space-y-1 mb-2">
          <div className="flex justify-between text-xs text-[var(--text-muted)]">
            <span>Allocated vs Committed</span>
            <span>{utilPct.toFixed(1)}%</span>
          </div>
          <Progress value={utilPct} className="h-1.5" />
          <div className="flex justify-between text-xs">
            <span className="text-[var(--text-muted)]">
              Committed: <strong className="text-[var(--text)]">{fmt(totalCommitted)}</strong>
            </span>
            <span className="text-[var(--text-muted)]">
              Allocated: <strong className="text-[var(--accent)]">{fmt(totalAllocated)}</strong>
            </span>
          </div>
        </div>

        {/* Lines table */}
        {open && budget.lines.length > 0 && (
          <div className="border border-[var(--border)] rounded-lg overflow-hidden mt-3">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-3 text-xs">Period</TableHead>
                  <TableHead className="text-right text-xs">Committed</TableHead>
                  <TableHead className="text-right pr-3 text-xs">Allocated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {budget.lines.map(line => (
                  <TableRow key={line.id}>
                    <TableCell className="pl-3 text-xs text-[var(--text-muted)]">
                      {new Date(line.startDate).toLocaleDateString('en-IN')} →{' '}
                      {new Date(line.endDate).toLocaleDateString('en-IN')}
                    </TableCell>
                    <TableCell className="text-right text-xs">{fmt(Number(line.committedAmount))}</TableCell>
                    <TableCell className="text-right pr-3 text-xs">{fmt(Number(line.allocatedAmount))}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        {open && budget.lines.length === 0 && (
          <p className="text-xs text-[var(--text-faint)] mt-2">No budget lines added.</p>
        )}
      </CardContent>
    </Card>
  )
}

/* ─── Page ──────────────────────────────────────────────────── */
export default function BudgetPage() {
  const {
    budgets, analyticAccounts, loading, error,
    fetchBudgets, fetchAnalyticAccounts,
    createBudget, confirmBudget, reviseBudget, markBudgetDone, clearError,
  } = useBudgetStore()
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'ADMIN'

  const [showForm,  setShowForm]  = useState(false)
  const [saving,    setSaving]    = useState(false)
  const [formErr,   setFormErr]   = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Form fields
  const [form, setForm] = useState<Partial<BudgetPayload>>({
    name: '', budgetType: 'Project Budget',
    periodStart: '', periodEnd: '', responsiblePerson: '',
    analyticAccountId: 0,
    lines: [],
  })

  type LineForm = { startDate: string; endDate: string; committedAmount: number; allocatedAmount: number }
  const [lines, setLines] = useState<LineForm[]>([])

  useEffect(() => {
    fetchBudgets()
    fetchAnalyticAccounts()
  }, []) // eslint-disable-line

  function addLine() {
    setLines(ls => [...ls, {
      startDate: form.periodStart ?? '',
      endDate:   form.periodEnd   ?? '',
      committedAmount: 0,
      allocatedAmount: 0,
    }])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setFormErr(''); setSaving(true)
    try {
      if (!form.analyticAccountId) throw new Error('Please select an analytic account.')
      await createBudget({
        ...(form as BudgetPayload),
        lines,
      })
      setShowForm(false)
      setForm({ name: '', budgetType: 'Project Budget', periodStart: '', periodEnd: '', responsiblePerson: '', analyticAccountId: 0 })
      setLines([])
    } catch (err: any) {
      setFormErr(err.message ?? 'Failed.')
    } finally { setSaving(false) }
  }

  const filtered = budgets.filter(b =>
    statusFilter === 'all' || b.status === statusFilter
  )

  return (
    <div className="db-page">
      <div className="db-page-header">
        <div>
          <h1 className="db-page-title">Budget Management</h1>
          <p className="db-page-sub">Plan and track income/expense budgets with lifecycle stages.</p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setShowForm(v => !v)}>
          {showForm ? <X size={13} /> : <Plus size={13} />}
          {showForm ? 'Cancel' : 'New Budget'}
        </Button>
      </div>

      {/* ── New Budget Form ──────────────────────────── */}
      {showForm && (
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">New Budget</CardTitle>
          </CardHeader>
          <CardContent>
            {formErr && (
              <div className="auth-error mb-3">
                <span>{formErr}</span>
                <button onClick={() => setFormErr('')} className="auth-error-close">✕</button>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="auth-field sm:col-span-2">
                  <label className="auth-label">Budget Name <span className="text-red-400">*</span></label>
                  <input className="auth-input" required value={form.name ?? ''}
                    placeholder="e.g. Q3 Marketing Budget"
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="auth-field">
                  <label className="auth-label">Budget Type</label>
                  <input className="auth-input" value={form.budgetType ?? ''}
                    onChange={e => setForm(f => ({ ...f, budgetType: e.target.value }))} />
                </div>
                <div className="auth-field">
                  <label className="auth-label">Period Start <span className="text-red-400">*</span></label>
                  <input type="date" className="auth-input" required value={form.periodStart ?? ''}
                    onChange={e => setForm(f => ({ ...f, periodStart: e.target.value }))} />
                </div>
                <div className="auth-field">
                  <label className="auth-label">Period End <span className="text-red-400">*</span></label>
                  <input type="date" className="auth-input" required value={form.periodEnd ?? ''}
                    onChange={e => setForm(f => ({ ...f, periodEnd: e.target.value }))} />
                </div>
                <div className="auth-field">
                  <label className="auth-label">Responsible Person <span className="text-red-400">*</span></label>
                  <input className="auth-input" required value={form.responsiblePerson ?? ''}
                    onChange={e => setForm(f => ({ ...f, responsiblePerson: e.target.value }))} />
                </div>
                <div className="auth-field sm:col-span-2">
                  <label className="auth-label">Analytic Account <span className="text-red-400">*</span></label>
                  <select className="auth-input" value={form.analyticAccountId ?? 0}
                    onChange={e => setForm(f => ({ ...f, analyticAccountId: +e.target.value }))}>
                    <option value={0}>— select analytic account —</option>
                    {analyticAccounts.map(aa => (
                      <option key={aa.id} value={aa.id}>{aa.name} ({aa.type})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Budget Lines */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">Budget Lines</p>
                  <button type="button" onClick={addLine}
                    className="text-xs text-[var(--accent)] hover:underline flex items-center gap-1">
                    <Plus size={11} /> Add Line
                  </button>
                </div>
                {lines.length === 0 && (
                  <p className="text-xs text-[var(--text-faint)] py-2">
                    Optional — click "Add Line" to define committed / allocated amounts per sub-period.
                  </p>
                )}
                {lines.map((line, idx) => (
                  <div key={idx} className="grid grid-cols-5 gap-2 items-end mb-2">
                    <div className="auth-field col-span-1">
                      <label className="auth-label">Start</label>
                      <input type="date" className="auth-input" value={line.startDate}
                        onChange={e => setLines(ls => ls.map((l, i) => i === idx ? { ...l, startDate: e.target.value } : l))} />
                    </div>
                    <div className="auth-field col-span-1">
                      <label className="auth-label">End</label>
                      <input type="date" className="auth-input" value={line.endDate}
                        onChange={e => setLines(ls => ls.map((l, i) => i === idx ? { ...l, endDate: e.target.value } : l))} />
                    </div>
                    <div className="auth-field col-span-1">
                      <label className="auth-label">Committed (₹)</label>
                      <input type="number" min="0" className="auth-input" value={line.committedAmount || ''}
                        onChange={e => setLines(ls => ls.map((l, i) => i === idx ? { ...l, committedAmount: parseFloat(e.target.value) || 0 } : l))} />
                    </div>
                    <div className="auth-field col-span-1">
                      <label className="auth-label">Allocated (₹)</label>
                      <input type="number" min="0" className="auth-input" value={line.allocatedAmount || ''}
                        onChange={e => setLines(ls => ls.map((l, i) => i === idx ? { ...l, allocatedAmount: parseFloat(e.target.value) || 0 } : l))} />
                    </div>
                    <div className="mb-0.5">
                      <button type="button" onClick={() => setLines(ls => ls.filter((_, i) => i !== idx))}
                        className="text-red-400 hover:text-red-300 p-1">
                        <X size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" size="sm" disabled={saving}>
                  {saving ? <><Loader2 size={13} className="animate-spin mr-1" />Creating…</> : 'Create Budget'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="auth-error mb-3">
          <span>{error}</span>
          <button onClick={clearError} className="auth-error-close">✕</button>
        </div>
      )}

      {/* ── Status filter ────────────────────────────── */}
      <div className="flex gap-1 mb-4">
        {['all', 'DRAFT', 'CONFIRMED', 'REVISED', 'DONE'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1 text-xs rounded-full border transition-colors ${
              statusFilter === s
                ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
                : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)]'
            }`}>
            {s === 'all' ? 'All' : s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 size={24} className="animate-spin text-[var(--accent)]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 p-12 text-[var(--text-muted)]">
          <PieChart size={32} className="opacity-30" />
          <p className="text-sm">No budgets found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filtered.map(b => (
            <BudgetCard
              key={b.id}
              budget={b}
              isAdmin={isAdmin}
              onConfirm={confirmBudget}
              onRevise={reviseBudget}
              onDone={markBudgetDone}
            />
          ))}
        </div>
      )}
    </div>
  )
}
