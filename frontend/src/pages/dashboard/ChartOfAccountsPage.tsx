import { useEffect, useState } from 'react'
import { BookMarked, Plus, X, Loader2, Search, Pencil } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { useAccountStore, type Account, type AccountType } from '@/store'

const TYPE_COLORS: Record<AccountType, string> = {
  ASSET:          'bg-blue-500/15    text-blue-400    border-blue-500/30',
  LIABILITY:      'bg-red-500/15     text-red-400     border-red-500/30',
  INCOME:         'bg-green-500/15   text-green-400   border-green-500/30',
  REVENUE:        'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  EXPENSE:        'bg-orange-500/15  text-orange-400  border-orange-500/30',
  OTHER_EXPENSE:  'bg-rose-500/15    text-rose-400    border-rose-500/30',
  CAPITAL:        'bg-purple-500/15  text-purple-400  border-purple-500/30',
  PROFIT_AND_LOSS:'bg-yellow-500/15  text-yellow-400  border-yellow-500/30',
}

const ALL_TYPES: AccountType[] = [
  'ASSET', 'LIABILITY', 'INCOME', 'REVENUE',
  'EXPENSE', 'OTHER_EXPENSE', 'CAPITAL', 'PROFIT_AND_LOSS',
]

const EMPTY = { name: '', type: 'ASSET' as AccountType }

export default function ChartOfAccountsPage() {
  const { accounts, loading, error, fetchAll, create, update, clearError } = useAccountStore()

  const [search,     setSearch]     = useState('')
  const [typeFilter, setTypeFilter] = useState<AccountType | 'all'>('all')
  const [showForm,   setShowForm]   = useState(false)
  const [editing,    setEditing]    = useState<Account | null>(null)
  const [form,       setForm]       = useState(EMPTY)
  const [saving,     setSaving]     = useState(false)
  const [formErr,    setFormErr]    = useState('')

  useEffect(() => { fetchAll() }, []) // eslint-disable-line

  function openCreate() {
    setEditing(null); setForm(EMPTY); setFormErr(''); setShowForm(true)
  }
  function openEdit(a: Account) {
    setEditing(a); setForm({ name: a.name, type: a.type }); setFormErr(''); setShowForm(true)
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

  const filtered = accounts.filter(a => {
    const matchType   = typeFilter === 'all' || a.type === typeFilter
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase())
    return matchType && matchSearch
  })

  const counts = ALL_TYPES.reduce((acc, t) => ({
    ...acc, [t]: accounts.filter(a => a.type === t).length,
  }), {} as Record<AccountType, number>)

  return (
    <div className="db-page">
      <div className="db-page-header">
        <div>
          <h1 className="db-page-title">Chart of Accounts</h1>
          <p className="db-page-sub">Define and manage the full accounting hierarchy.</p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={openCreate}>
          <Plus size={13} /> New Account
        </Button>
      </div>

      {/* ── Type summary strip ──────────────────────── */}
      <div className="grid grid-cols-4 gap-2 mb-4 sm:grid-cols-8">
        {ALL_TYPES.map(t => (
          <button key={t} onClick={() => setTypeFilter(v => v === t ? 'all' : t)}
            className={`rounded-xl border p-2 text-left transition-colors ${
              typeFilter === t
                ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
                : 'border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)]'
            }`}>
            <p className="text-[10px] text-[var(--text-muted)] truncate">{t.replace('_', ' ')}</p>
            <p className="text-lg font-bold text-[var(--text)]">{counts[t] ?? 0}</p>
          </button>
        ))}
      </div>

      {/* ── Inline Form ─────────────────────────────── */}
      {showForm && (
        <Card className="mb-4">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-[var(--text)]">
                {editing ? `Edit — ${editing.name}` : 'New Account'}
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
                <label className="auth-label">Account Name <span className="text-red-400">*</span></label>
                <input className="auth-input" required value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="auth-field w-52">
                <label className="auth-label">Type <span className="text-red-400">*</span></label>
                <select className="auth-input" value={form.type}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value as AccountType }))}>
                  {ALL_TYPES.map(t => (
                    <option key={t} value={t}>{t.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 mb-0.5">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" size="sm" disabled={saving}>
                  {saving ? <Loader2 size={13} className="animate-spin" /> : (editing ? 'Update' : 'Create')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* ── Search ──────────────────────────────────── */}
      <div className="relative mb-3">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
        <input className="auth-input pl-8 w-full max-w-xs" placeholder="Search accounts…"
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
            <div className="flex flex-col items-center justify-center gap-2 p-12 text-[var(--text-muted)]">
              <BookMarked size={32} className="opacity-30" />
              <p className="text-sm">No accounts found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-5">#</TableHead>
                  <TableHead>Account Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="pr-5 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(a => (
                  <TableRow key={a.id}>
                    <TableCell className="pl-5 font-mono text-xs text-[var(--text-muted)]">#{a.id}</TableCell>
                    <TableCell className="text-sm font-medium text-[var(--text)]">{a.name}</TableCell>
                    <TableCell>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${TYPE_COLORS[a.type] ?? ''}`}>
                        {a.type.replace('_', ' ')}
                      </span>
                    </TableCell>
                    <TableCell className="pr-5 text-right">
                      <button onClick={() => openEdit(a)}
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
