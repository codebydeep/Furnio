import { useEffect, useState } from 'react'
import {
  BookMarked, Plus, X, Loader2, Search,
  Archive, RefreshCw, Pencil,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { useAccountStore, type Account, type AccountPayload, type AccountType } from '@/store'

const TYPE_COLORS: Record<AccountType, string> = {
  asset:     'bg-blue-500/15   text-blue-400   border-blue-500/30',
  liability: 'bg-red-500/15    text-red-400    border-red-500/30',
  income:    'bg-green-500/15  text-green-400  border-green-500/30',
  expense:   'bg-orange-500/15 text-orange-400 border-orange-500/30',
  capital:   'bg-purple-500/15 text-purple-400 border-purple-500/30',
}

const ALL_TYPES: AccountType[] = ['asset', 'liability', 'income', 'expense', 'capital']

const EMPTY: AccountPayload = { name: '', type: 'asset', code: '' }

export default function ChartOfAccountsPage() {
  const { accounts, loading, error, fetchAll, create, update, archive, clearError } = useAccountStore()

  const [search,       setSearch]   = useState('')
  const [typeFilter,   setTypeFilter] = useState<AccountType | 'all'>('all')
  const [showArchived, setShowArchived] = useState(false)
  const [showForm,     setShowForm]  = useState(false)
  const [editing,      setEditing]   = useState<Account | null>(null)
  const [form,         setForm]      = useState<AccountPayload>(EMPTY)
  const [saving,       setSaving]    = useState(false)
  const [formErr,      setFormErr]   = useState('')

  useEffect(() => { fetchAll() }, []) // eslint-disable-line

  function openCreate() {
    setEditing(null); setForm(EMPTY); setFormErr(''); setShowForm(true)
  }

  function openEdit(a: Account) {
    setEditing(a)
    setForm({ name: a.name, type: a.type, code: a.code ?? '' })
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

  const filtered = accounts.filter(a => {
    const matchType   = typeFilter === 'all' || a.type === typeFilter
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) ||
                        (a.code ?? '').toLowerCase().includes(search.toLowerCase())
    const matchArch   = showArchived ? true : !a.isArchived
    return matchType && matchSearch && matchArch
  })

  // Group by type for a summary strip
  const counts = ALL_TYPES.reduce((acc, t) => ({
    ...acc,
    [t]: accounts.filter(a => a.type === t && !a.isArchived).length,
  }), {} as Record<AccountType, number>)

  return (
    <div className="db-page">
      <div className="db-page-header">
        <div>
          <h1 className="db-page-title">Chart of Accounts</h1>
          <p className="db-page-sub">Define and manage the accounting hierarchy.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5"
            onClick={() => setShowArchived(v => !v)}>
            {showArchived ? <RefreshCw size={13} /> : <Archive size={13} />}
            {showArchived ? 'Hide Archived' : 'Show Archived'}
          </Button>
          <Button size="sm" className="gap-1.5" onClick={openCreate}>
            <Plus size={13} /> New Account
          </Button>
        </div>
      </div>

      {/* ── Summary strip ───────────────────────────── */}
      <div className="grid grid-cols-5 gap-3 mb-4">
        {ALL_TYPES.map(t => (
          <button
            key={t}
            onClick={() => setTypeFilter(v => v === t ? 'all' : t)}
            className={`rounded-xl border p-3 text-left transition-colors ${
              typeFilter === t
                ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
                : 'border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)]'
            }`}
          >
            <p className="text-xs text-[var(--text-muted)] capitalize">{t}</p>
            <p className="text-xl font-bold text-[var(--text)] mt-0.5">{counts[t]}</p>
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
            <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-3">
              <div className="auth-field col-span-2">
                <label className="auth-label">Account Name <span className="text-red-400">*</span></label>
                <input className="auth-input" required
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="auth-field">
                <label className="auth-label">Code</label>
                <input className="auth-input" placeholder="e.g. 1001"
                  value={form.code ?? ''}
                  onChange={e => setForm(f => ({ ...f, code: e.target.value }))} />
              </div>
              <div className="auth-field">
                <label className="auth-label">Type <span className="text-red-400">*</span></label>
                <select className="auth-input" value={form.type}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value as AccountType }))}>
                  {ALL_TYPES.map(t => (
                    <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-3 flex justify-end gap-2 pt-1">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" size="sm" disabled={saving}>
                  {saving ? <><Loader2 size={13} className="animate-spin mr-1" />Saving…</> : (editing ? 'Update' : 'Create')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* ── Search ──────────────────────────────────── */}
      <div className="relative mb-3">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
        <input className="auth-input pl-8 w-full max-w-xs" placeholder="Search name or code…"
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
                  <TableHead className="pl-5">Account Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="pr-5 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(a => (
                  <TableRow key={a.id} className={a.isArchived ? 'opacity-50' : ''}>
                    <TableCell className="pl-5 text-sm font-medium text-[var(--text)]">{a.name}</TableCell>
                    <TableCell>
                      {a.code
                        ? <span className="font-mono text-xs text-[var(--text-muted)]">{a.code}</span>
                        : <span className="text-xs text-[var(--text-faint)]">—</span>}
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border capitalize ${TYPE_COLORS[a.type]}`}>
                        {a.type}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${
                        a.isArchived
                          ? 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                          : 'bg-green-500/10 text-green-400 border-green-500/20'
                      }`}>
                        {a.isArchived ? 'Archived' : 'Active'}
                      </span>
                    </TableCell>
                    <TableCell className="pr-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(a)}
                          className="p-1.5 rounded hover:bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => archive(a.id)}
                          className="p-1.5 rounded hover:bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                          title="Archive">
                          <Archive size={13} />
                        </button>
                      </div>
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
