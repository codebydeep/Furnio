import { useEffect, useState } from 'react'
import {
  BookOpenCheck, Plus, X, Loader2, CheckCircle2,
  Clock, XCircle, ChevronRight, Send, Ban,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  useJournalStore, useAccountStore, useContactStore,
  type JournalEntry, type JournalEntryStatus,
} from '@/store'
import { useAuthStore } from '@/store/useAuthStore'

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n)
}

const STATUS_STYLE: Record<JournalEntryStatus, string> = {
  DRAFT:     'bg-zinc-500/10  text-zinc-600  dark:text-zinc-400  border-zinc-500/20',
  POSTED:    'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
  CANCELLED: 'bg-red-500/10   text-red-600   dark:text-red-400   border-red-500/20',
}
const STATUS_ICON: Record<JournalEntryStatus, React.ElementType> = {
  DRAFT:     Clock,
  POSTED:    CheckCircle2,
  CANCELLED: XCircle,
}

const EMPTY_ITEM = { accountId: 0, debit: 0, credit: 0, analyticAccountId: 0 }

/* ─── Detail Panel ──────────────────────────────────────────── */
function EntryDetail({
  entry, onClose, onPost, onCancel, isAdmin,
}: {
  entry: JournalEntry
  onClose: () => void
  onPost: (id: number) => Promise<void>
  onCancel: (id: number) => Promise<void>
  isAdmin: boolean
}) {
  const [acting, setActing] = useState(false)
  const StatusIcon = STATUS_ICON[entry.status]
  const totalDebit  = entry.items.reduce((s, i) => s + Number(i.debit), 0)
  const totalCredit = entry.items.reduce((s, i) => s + Number(i.credit), 0)
  const balanced    = Math.abs(totalDebit - totalCredit) < 0.01

  async function handlePost() {
    setActing(true)
    await onPost(entry.id)
    setActing(false)
    onClose()
  }
  async function handleCancel() {
    setActing(true)
    await onCancel(entry.id)
    setActing(false)
    onClose()
  }

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2 flex-row items-center justify-between">
        <div>
          <CardTitle className="text-sm font-semibold text-[var(--text)]">
            {entry.number}
          </CardTitle>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            {entry.journal?.name} · {entry.accountingDate?.slice(0, 10)}
            {entry.partner && ` · ${entry.partner.name}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {entry.status === 'DRAFT' && (
            <>
              <Button size="sm" className="h-7 text-xs gap-1" disabled={acting || !balanced}
                title={!balanced ? 'Debit ≠ Credit — cannot post' : undefined}
                onClick={handlePost}>
                {acting ? <Loader2 size={11} className="animate-spin" /> : <Send size={11} />}
                Post
              </Button>
              {isAdmin && (
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-red-400 border-red-500/30"
                  disabled={acting} onClick={handleCancel}>
                  <Ban size={11} /> Cancel
                </Button>
              )}
            </>
          )}
          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${STATUS_STYLE[entry.status]}`}>
            <StatusIcon size={10} /> {entry.status}
          </span>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text)]">
            <X size={15} />
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {!balanced && entry.status === 'DRAFT' && (
          <div className="mb-3 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
            ⚠ Debit ({fmt(totalDebit)}) ≠ Credit ({fmt(totalCredit)}) — entry is unbalanced.
          </div>
        )}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-3">Account</TableHead>
              <TableHead className="text-right">Debit</TableHead>
              <TableHead className="text-right pr-3">Credit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entry.items.map(item => (
              <TableRow key={item.id}>
                <TableCell className="pl-3 text-xs text-[var(--text)]">
                  {item.account?.name ?? `Account #${item.accountId}`}
                </TableCell>
                <TableCell className="text-right text-xs font-medium">
                  {Number(item.debit) > 0 ? fmt(Number(item.debit)) : '—'}
                </TableCell>
                <TableCell className="text-right pr-3 text-xs font-medium">
                  {Number(item.credit) > 0 ? fmt(Number(item.credit)) : '—'}
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="border-t-2 font-semibold">
              <TableCell className="pl-3 text-xs">Total</TableCell>
              <TableCell className={`text-right text-xs ${balanced ? 'text-green-400' : 'text-red-400'}`}>{fmt(totalDebit)}</TableCell>
              <TableCell className={`text-right pr-3 text-xs ${balanced ? 'text-green-400' : 'text-red-400'}`}>{fmt(totalCredit)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

/* ─── Page ──────────────────────────────────────────────────── */
export default function JournalEntriesPage() {
  const {
    entries, journals, loading, error,
    fetchEntries, fetchJournals, createEntry, postEntry, cancelEntry, clearError,
  } = useJournalStore()
  const { accounts, fetchAll: fetchAccounts } = useAccountStore()
  const { contacts, fetchAll: fetchContacts } = useContactStore()
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'ADMIN'

  const [showForm,     setShowForm]     = useState(false)
  const [selected,     setSelected]     = useState<JournalEntry | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [saving,       setSaving]       = useState(false)
  const [formErr,      setFormErr]      = useState('')

  // Form state
  const [journalId,      setJournalId]      = useState(0)
  const [partnerId,      setPartnerId]      = useState(0)
  const [accountingDate, setAccountingDate] = useState(new Date().toISOString().slice(0, 10))
  const [items, setItems] = useState([
    { ...EMPTY_ITEM },
    { ...EMPTY_ITEM },
  ])

  useEffect(() => {
    fetchEntries()
    fetchJournals()
    fetchAccounts()
    fetchContacts()
  }, []) // eslint-disable-line

  function addItem() {
    setItems(it => [...it, { ...EMPTY_ITEM }])
  }
  function removeItem(idx: number) {
    if (items.length <= 2) return
    setItems(it => it.filter((_, i) => i !== idx))
  }
  function updateItem(idx: number, key: string, val: number) {
    setItems(it => it.map((item, i) => i === idx ? { ...item, [key]: val } : item))
  }

  const totalDebit  = items.reduce((s, i) => s + (i.debit  || 0), 0)
  const totalCredit = items.reduce((s, i) => s + (i.credit || 0), 0)
  const balanced    = Math.abs(totalDebit - totalCredit) < 0.01

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormErr('')
    if (!journalId) { setFormErr('Please select a journal.'); return }
    if (items.some(i => !i.accountId)) { setFormErr('All lines must have an account selected.'); return }
    setSaving(true)
    try {
      await createEntry({
        journalId,
        partnerId:      partnerId || undefined,
        accountingDate,
        items: items.map(i => ({
          accountId:         i.accountId,
          debit:             i.debit  || 0,
          credit:            i.credit || 0,
          analyticAccountId: i.analyticAccountId || undefined,
        })),
      })
      setShowForm(false)
      resetForm()
    } catch (err: any) {
      setFormErr(err.message ?? 'Failed to create journal entry.')
    } finally { setSaving(false) }
  }

  function resetForm() {
    setJournalId(0); setPartnerId(0)
    setAccountingDate(new Date().toISOString().slice(0, 10))
    setItems([{ ...EMPTY_ITEM }, { ...EMPTY_ITEM }])
    setFormErr('')
  }

  async function handlePost(id: number) {
    const ok = await postEntry(id)
    if (!ok) setFormErr('Failed to post entry.')
  }
  async function handleCancel(id: number) {
    await cancelEntry(id)
  }

  const filtered = entries.filter(e =>
    statusFilter === 'all' || e.status === statusFilter.toUpperCase()
  )

  return (
    <div className="db-page">
      <div className="db-page-header">
        <div>
          <h1 className="db-page-title">Journal Entries</h1>
          <p className="db-page-sub">Create double-entry journal records and post them to the ledger.</p>
        </div>
        <Button size="sm" className="gap-1.5"
          onClick={() => { setShowForm(v => !v); setSelected(null) }}>
          {showForm ? <X size={13} /> : <Plus size={13} />}
          {showForm ? 'Cancel' : 'New Entry'}
        </Button>
      </div>

      {/* ── Detail panel ────────────────────────────── */}
      {selected && !showForm && (
        <EntryDetail
          entry={selected}
          onClose={() => setSelected(null)}
          onPost={handlePost}
          onCancel={handleCancel}
          isAdmin={isAdmin}
        />
      )}

      {/* ── Create Form ──────────────────────────────── */}
      {showForm && (
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">New Journal Entry (Draft)</CardTitle>
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
                <div className="auth-field">
                  <label className="auth-label">Journal <span className="text-red-400">*</span></label>
                  <select className="auth-input" value={journalId}
                    onChange={e => setJournalId(+e.target.value)}>
                    <option value={0}>— select journal —</option>
                    {journals.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
                  </select>
                </div>
                <div className="auth-field">
                  <label className="auth-label">Accounting Date</label>
                  <input type="date" className="auth-input" value={accountingDate}
                    onChange={e => setAccountingDate(e.target.value)} />
                </div>
                <div className="auth-field">
                  <label className="auth-label">Partner (optional)</label>
                  <select className="auth-input" value={partnerId}
                    onChange={e => setPartnerId(+e.target.value)}>
                    <option value={0}>— none —</option>
                    {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Journal Lines */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">
                    Journal Lines
                  </p>
                  <button type="button" onClick={addItem}
                    className="text-xs text-[var(--accent)] hover:underline flex items-center gap-1">
                    <Plus size={11} /> Add Line
                  </button>
                </div>
                <div className="border border-[var(--border)] rounded-lg overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-[var(--surface-2)]">
                      <tr>
                        <th className="text-left px-3 py-2 font-semibold text-[var(--text-muted)]">Account</th>
                        <th className="text-right px-2 py-2 font-semibold text-[var(--text-muted)] w-32">Debit (₹)</th>
                        <th className="text-right px-2 py-2 font-semibold text-[var(--text-muted)] w-32">Credit (₹)</th>
                        <th className="w-8" />
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, idx) => (
                        <tr key={idx} className="border-t border-[var(--border)]">
                          <td className="px-3 py-1.5">
                            <select className="auth-input py-1 text-xs" value={item.accountId}
                              onChange={e => updateItem(idx, 'accountId', +e.target.value)}>
                              <option value={0}>— select account —</option>
                              {accounts.map(a => (
                                <option key={a.id} value={a.id}>{a.name} ({a.type})</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-2 py-1.5">
                            <input type="number" min="0" step="0.01" className="auth-input py-1 text-xs text-right"
                              value={item.debit || ''}
                              onChange={e => updateItem(idx, 'debit', parseFloat(e.target.value) || 0)} />
                          </td>
                          <td className="px-2 py-1.5">
                            <input type="number" min="0" step="0.01" className="auth-input py-1 text-xs text-right"
                              value={item.credit || ''}
                              onChange={e => updateItem(idx, 'credit', parseFloat(e.target.value) || 0)} />
                          </td>
                          <td className="px-2 py-1.5">
                            {items.length > 2 && (
                              <button type="button" onClick={() => removeItem(idx)}
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
                        <td className="px-3 py-2 text-xs font-semibold text-[var(--text-muted)]">Totals</td>
                        <td className={`px-2 py-2 text-right text-sm font-bold ${balanced ? 'text-green-400' : 'text-red-400'}`}>
                          {fmt(totalDebit)}
                        </td>
                        <td className={`px-2 py-2 text-right text-sm font-bold ${balanced ? 'text-green-400' : 'text-red-400'}`}>
                          {fmt(totalCredit)}
                        </td>
                        <td />
                      </tr>
                      {!balanced && (
                        <tr>
                          <td colSpan={4} className="px-3 pb-2 text-xs text-red-400">
                            ⚠ Debit and Credit must be equal to post this entry.
                          </td>
                        </tr>
                      )}
                    </tfoot>
                  </table>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm"
                  onClick={() => { setShowForm(false); resetForm() }}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={saving}>
                  {saving
                    ? <><Loader2 size={13} className="animate-spin mr-1" />Saving…</>
                    : 'Save as Draft'}
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

      {/* ── Status filter pills ──────────────────────── */}
      <div className="flex gap-1 mb-3">
        {['all', 'DRAFT', 'POSTED', 'CANCELLED'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1 text-xs rounded-full border transition-colors capitalize ${
              statusFilter === s
                ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
                : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)]'
            }`}>
            {s === 'all' ? 'All' : s}
          </button>
        ))}
      </div>

      {/* ── Table ────────────────────────────────────── */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 size={24} className="animate-spin text-[var(--accent)]" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 p-12 text-[var(--text-muted)]">
              <BookOpenCheck size={32} className="opacity-30" />
              <p className="text-sm">No journal entries found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-5">Number</TableHead>
                  <TableHead>Journal</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Partner</TableHead>
                  <TableHead className="text-right">Debit</TableHead>
                  <TableHead className="text-right">Credit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="pr-5 text-right" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(entry => {
                  const StatusIcon = STATUS_ICON[entry.status]
                  const debit  = entry.items.reduce((s, i) => s + Number(i.debit),  0)
                  const credit = entry.items.reduce((s, i) => s + Number(i.credit), 0)
                  return (
                    <TableRow key={entry.id}
                      className="cursor-pointer hover:bg-[var(--surface-2)]"
                      onClick={() => { setSelected(entry); setShowForm(false) }}>
                      <TableCell className="pl-5 font-mono text-xs text-[var(--accent)]">
                        {entry.number}
                      </TableCell>
                      <TableCell className="text-xs text-[var(--text)]">
                        {entry.journal?.name ?? '—'}
                      </TableCell>
                      <TableCell className="text-xs text-[var(--text-muted)]">
                        {entry.accountingDate?.slice(0, 10)}
                      </TableCell>
                      <TableCell className="text-xs text-[var(--text-muted)]">
                        {entry.partner?.name ?? '—'}
                      </TableCell>
                      <TableCell className="text-right text-xs font-mono">{fmt(debit)}</TableCell>
                      <TableCell className="text-right text-xs font-mono">{fmt(credit)}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${STATUS_STYLE[entry.status]}`}>
                          <StatusIcon size={10} /> {entry.status}
                        </span>
                      </TableCell>
                      <TableCell className="pr-5 text-right" onClick={e => e.stopPropagation()}>
                        <button className="p-1.5 rounded hover:bg-[var(--surface-2)] text-[var(--text-muted)]"
                          onClick={() => { setSelected(entry); setShowForm(false) }}>
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
