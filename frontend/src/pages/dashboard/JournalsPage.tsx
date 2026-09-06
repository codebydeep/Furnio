import { useEffect, useState } from 'react'
import { BookOpenCheck, Plus, X, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { useJournalStore, useAccountStore, type JournalType } from '@/store'

const TYPE_BADGE: Record<JournalType, string> = {
  SALES:    'bg-blue-500/15   text-blue-600   dark:text-blue-400   border-blue-500/30',
  PURCHASE: 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30',
  BANK:     'bg-green-500/15  text-green-600  dark:text-green-400  border-green-500/30',
  CASH:     'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30',
}

export default function JournalsPage() {
  const { journals, loading, error, fetchJournals, createJournal } = useJournalStore()
  const { accounts, fetchAll: fetchAccounts } = useAccountStore()

  const [showForm,  setShowForm]  = useState(false)
  const [saving,    setSaving]    = useState(false)
  const [formErr,   setFormErr]   = useState('')
  const [form, setForm] = useState({
    name:             '',
    type:             'SALES' as JournalType,
    defaultAccountId: 0,
  })

  useEffect(() => {
    fetchJournals()
    fetchAccounts()
  }, []) // eslint-disable-line

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setFormErr(''); setSaving(true)
    try {
      await createJournal({
        name:             form.name,
        type:             form.type,
        defaultAccountId: form.defaultAccountId || null,
      })
      setShowForm(false)
      setForm({ name: '', type: 'SALES', defaultAccountId: 0 })
    } catch (err: any) {
      setFormErr(err.message ?? 'Failed.')
    } finally { setSaving(false) }
  }

  return (
    <div className="db-page">
      <div className="db-page-header">
        <div>
          <h1 className="db-page-title">Journals</h1>
          <p className="db-page-sub">
            Configure the four standard journals (Sales, Purchase, Bank, Cash) — seeded automatically on first run.
          </p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setShowForm(v => !v)}>
          {showForm ? <X size={13} /> : <Plus size={13} />}
          {showForm ? 'Cancel' : 'New Journal'}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-4">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-[var(--text)]">New Journal</span>
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
              <div className="auth-field">
                <label className="auth-label">Journal Name <span className="text-red-400">*</span></label>
                <input className="auth-input" required value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="auth-field">
                <label className="auth-label">Type <span className="text-red-400">*</span></label>
                <select className="auth-input" value={form.type}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value as JournalType }))}>
                  <option value="SALES">Sales</option>
                  <option value="PURCHASE">Purchase</option>
                  <option value="BANK">Bank</option>
                  <option value="CASH">Cash</option>
                </select>
              </div>
              <div className="auth-field">
                <label className="auth-label">Default Account</label>
                <select className="auth-input" value={form.defaultAccountId}
                  onChange={e => setForm(f => ({ ...f, defaultAccountId: +e.target.value }))}>
                  <option value={0}>— none —</option>
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({a.type})</option>
                  ))}
                </select>
              </div>
              <div className="col-span-3 flex justify-end gap-2 pt-1">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" size="sm" disabled={saving}>
                  {saving ? <><Loader2 size={13} className="animate-spin mr-1" />Creating…</> : 'Create Journal'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {error && <div className="auth-error mb-3"><span>{error}</span></div>}

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 size={24} className="animate-spin text-[var(--accent)]" />
            </div>
          ) : journals.length === 0 ? (
            <div className="flex flex-col items-center gap-2 p-12 text-[var(--text-muted)]">
              <BookOpenCheck size={32} className="opacity-30" />
              <p className="text-sm">No journals yet. Run the seed to create defaults, or add one above.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-5">#</TableHead>
                  <TableHead>Journal Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="pr-5">Default Account</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {journals.map(j => (
                  <TableRow key={j.id}>
                    <TableCell className="pl-5 font-mono text-xs text-[var(--text-muted)]">#{j.id}</TableCell>
                    <TableCell className="text-sm font-medium text-[var(--text)]">{j.name}</TableCell>
                    <TableCell>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${TYPE_BADGE[j.type]}`}>
                        {j.type}
                      </span>
                    </TableCell>
                    <TableCell className="pr-5 text-xs text-[var(--text-muted)]">
                      {j.defaultAccount?.name ?? '—'}
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
