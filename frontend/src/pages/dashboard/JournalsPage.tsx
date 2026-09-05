import { useEffect, useState } from 'react'
import {
  BookOpenCheck, Plus, X, Loader2,
  ChevronRight, FileText, CheckCircle2, Clock,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Tabs } from '@/components/ui/tabs'
import {
  useJournalStore, useAccountStore,
  type Journal, type JournalType, type JournalEntry, type JournalItem,
} from '@/store'

const JOURNAL_TYPE_BADGE: Record<JournalType, string> = {
  sales:    'bg-blue-500/15   text-blue-400   border-blue-500/30',
  purchase: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  bank:     'bg-green-500/15  text-green-400  border-green-500/30',
  cash:     'bg-purple-500/15 text-purple-400 border-purple-500/30',
}

const ENTRY_EMPTY = {
  journalId: 0, date: new Date().toISOString().slice(0, 10),
  reference: '', status: 'draft' as const,
  items: [
    { accountId: 0, accountName: '', debit: 0, credit: 0, label: '' },
    { accountId: 0, accountName: '', debit: 0, credit: 0, label: '' },
  ] as JournalItem[],
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
}

/* ─── Journal Setup Sub-tab ─────────────────────────────────── */
function JournalSetup() {
  const { journals, loading, createJournal } = useJournalStore()
  const { accounts, fetchAll: fetchAccounts } = useAccountStore()

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', type: 'sales' as JournalType, defaultDebitAccountId: 0, defaultCreditAccountId: 0 })
  const [saving, setSaving] = useState(false)
  const [formErr, setFormErr] = useState('')

  useEffect(() => { fetchAccounts() }, []) // eslint-disable-line

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setFormErr(''); setSaving(true)
    try {
      await createJournal(form)
      setShowForm(false)
      setForm({ name: '', type: 'sales', defaultDebitAccountId: 0, defaultCreditAccountId: 0 })
    } catch (err: any) {
      setFormErr(err.message ?? 'Failed.')
    } finally { setSaving(false) }
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button size="sm" className="gap-1.5" onClick={() => setShowForm(v => !v)}>
          {showForm ? <X size={13} /> : <Plus size={13} />}
          {showForm ? 'Cancel' : 'New Journal'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-4">
            {formErr && (
              <div className="auth-error mb-3">
                <span>{formErr}</span>
                <button onClick={() => setFormErr('')} className="auth-error-close">✕</button>
              </div>
            )}
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
              <div className="auth-field">
                <label className="auth-label">Journal Name <span className="text-red-400">*</span></label>
                <input className="auth-input" required value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="auth-field">
                <label className="auth-label">Type <span className="text-red-400">*</span></label>
                <select className="auth-input" value={form.type}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value as JournalType }))}>
                  <option value="sales">Sales</option>
                  <option value="purchase">Purchase</option>
                  <option value="bank">Bank</option>
                  <option value="cash">Cash</option>
                </select>
              </div>
              <div className="auth-field">
                <label className="auth-label">Default Debit Account</label>
                <select className="auth-input" value={form.defaultDebitAccountId}
                  onChange={e => setForm(f => ({ ...f, defaultDebitAccountId: +e.target.value }))}>
                  <option value={0}>— select —</option>
                  {accounts.filter(a => !a.isArchived).map(a => (
                    <option key={a.id} value={a.id}>{a.code ? `[${a.code}] ` : ''}{a.name}</option>
                  ))}
                </select>
              </div>
              <div className="auth-field">
                <label className="auth-label">Default Credit Account</label>
                <select className="auth-input" value={form.defaultCreditAccountId}
                  onChange={e => setForm(f => ({ ...f, defaultCreditAccountId: +e.target.value }))}>
                  <option value={0}>— select —</option>
                  {accounts.filter(a => !a.isArchived).map(a => (
                    <option key={a.id} value={a.id}>{a.code ? `[${a.code}] ` : ''}{a.name}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2 flex justify-end gap-2 pt-1">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" size="sm" disabled={saving}>
                  {saving ? <><Loader2 size={13} className="animate-spin mr-1" />Creating…</> : 'Create Journal'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-10">
              <Loader2 size={22} className="animate-spin text-[var(--accent)]" />
            </div>
          ) : journals.length === 0 ? (
            <div className="flex flex-col items-center gap-2 p-10 text-[var(--text-muted)]">
              <BookOpenCheck size={28} className="opacity-30" />
              <p className="text-sm">No journals configured yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-5">Journal Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Default Debit Account</TableHead>
                  <TableHead className="pr-5">Default Credit Account</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {journals.map(j => (
                  <TableRow key={j.id}>
                    <TableCell className="pl-5 text-sm font-medium text-[var(--text)]">{j.name}</TableCell>
                    <TableCell>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${JOURNAL_TYPE_BADGE[j.type]}`}>
                        {j.type}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-[var(--text-muted)]">
                      {accounts.find(a => a.id === j.defaultDebitAccountId)?.name ?? '—'}
                    </TableCell>
                    <TableCell className="pr-5 text-xs text-[var(--text-muted)]">
                      {accounts.find(a => a.id === j.defaultCreditAccountId)?.name ?? '—'}
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

/* ─── Journal Entries Sub-tab ───────────────────────────────── */
function JournalEntries() {
  const { journals, entries, loading, fetchEntries, createEntry, postEntry, fetchJournals } = useJournalStore()
  const { accounts, fetchAll: fetchAccounts } = useAccountStore()

  const [showForm,  setShowForm]  = useState(false)
  const [viewEntry, setViewEntry] = useState<JournalEntry | null>(null)
  const [form,      setForm]      = useState({ ...ENTRY_EMPTY })
  const [saving,    setSaving]    = useState(false)
  const [posting,   setPosting]   = useState<number | null>(null)
  const [formErr,   setFormErr]   = useState('')

  useEffect(() => {
    fetchEntries()
    fetchJournals()
    fetchAccounts()
  }, []) // eslint-disable-line

  function addLine() {
    setForm(f => ({
      ...f,
      items: [...f.items, { accountId: 0, accountName: '', debit: 0, credit: 0, label: '' }],
    }))
  }

  function removeLine(idx: number) {
    setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }))
  }

  function updateLine(idx: number, key: keyof JournalItem, val: string | number) {
    setForm(f => {
      const items = [...f.items]
      if (key === 'accountId') {
        const acc = accounts.find(a => a.id === +val)
        items[idx] = { ...items[idx], accountId: +val, accountName: acc?.name ?? '' }
      } else {
        items[idx] = { ...items[idx], [key]: val }
      }
      return { ...f, items }
    })
  }

  const totalDebit  = form.items.reduce((s, i) => s + (+i.debit  || 0), 0)
  const totalCredit = form.items.reduce((s, i) => s + (+i.credit || 0), 0)
  const isBalanced  = Math.abs(totalDebit - totalCredit) < 0.01

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setFormErr('')
    if (!isBalanced) { setFormErr('Debit and Credit totals must match.'); return }
    if (!form.journalId) { setFormErr('Please select a journal.'); return }
    setSaving(true)
    try {
      await createEntry({
        journalId:   form.journalId,
        journalName: journals.find(j => j.id === form.journalId)?.name ?? '',
        date:        form.date,
        reference:   form.reference,
        status:      'draft',
        items:       form.items,
      })
      setShowForm(false)
      setForm({ ...ENTRY_EMPTY })
    } catch (err: any) {
      setFormErr(err.message ?? 'Failed.')
    } finally { setSaving(false) }
  }

  async function handlePost(id: number) {
    setPosting(id)
    await postEntry(id)
    setPosting(null)
    fetchEntries()
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button size="sm" className="gap-1.5" onClick={() => { setShowForm(v => !v); setViewEntry(null) }}>
          {showForm ? <X size={13} /> : <Plus size={13} />}
          {showForm ? 'Cancel' : 'New Journal Entry'}
        </Button>
      </div>

      {/* ── View Entry Detail ─────────────────────────── */}
      {viewEntry && !showForm && (
        <Card>
          <CardHeader className="pb-2 flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold">
              Entry #{viewEntry.id} — {viewEntry.journalName}
            </CardTitle>
            <button onClick={() => setViewEntry(null)} className="text-[var(--text-muted)] hover:text-[var(--text)]">
              <X size={14} />
            </button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3 mb-3 text-xs text-[var(--text-muted)]">
              <span>Date: <strong className="text-[var(--text)]">{viewEntry.date}</strong></span>
              <span>Ref: <strong className="text-[var(--text)]">{viewEntry.reference || '—'}</strong></span>
              <span>Status: <strong className="text-[var(--text)] capitalize">{viewEntry.status}</strong></span>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-3">Account</TableHead>
                  <TableHead>Label</TableHead>
                  <TableHead className="text-right">Debit</TableHead>
                  <TableHead className="text-right pr-3">Credit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {viewEntry.items.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell className="pl-3 text-xs">{item.accountName}</TableCell>
                    <TableCell className="text-xs text-[var(--text-muted)]">{item.label || '—'}</TableCell>
                    <TableCell className="text-right text-xs">{item.debit  ? fmt(item.debit)  : '—'}</TableCell>
                    <TableCell className="pr-3 text-right text-xs">{item.credit ? fmt(item.credit) : '—'}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="border-t-2">
                  <TableCell colSpan={2} className="pl-3 text-xs font-semibold">Totals</TableCell>
                  <TableCell className="text-right text-xs font-semibold">{fmt(viewEntry.totalDebit)}</TableCell>
                  <TableCell className="pr-3 text-right text-xs font-semibold">{fmt(viewEntry.totalCredit)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* ── Create Entry Form ─────────────────────────── */}
      {showForm && (
        <Card>
          <CardContent className="pt-4">
            {formErr && (
              <div className="auth-error mb-3">
                <span>{formErr}</span>
                <button onClick={() => setFormErr('')} className="auth-error-close">✕</button>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="auth-field">
                  <label className="auth-label">Journal <span className="text-red-400">*</span></label>
                  <select className="auth-input" value={form.journalId}
                    onChange={e => setForm(f => ({ ...f, journalId: +e.target.value }))}>
                    <option value={0}>— select —</option>
                    {journals.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
                  </select>
                </div>
                <div className="auth-field">
                  <label className="auth-label">Date <span className="text-red-400">*</span></label>
                  <input type="date" className="auth-input" value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
                </div>
                <div className="auth-field">
                  <label className="auth-label">Reference</label>
                  <input className="auth-input" value={form.reference}
                    onChange={e => setForm(f => ({ ...f, reference: e.target.value }))} />
                </div>
              </div>

              {/* Accounting Lines */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">Accounting Lines</p>
                  <button type="button" onClick={addLine}
                    className="text-xs text-[var(--accent)] hover:underline flex items-center gap-1">
                    <Plus size={11} /> Add Line
                  </button>
                </div>
                <div className="border border-[var(--border)] rounded-lg overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-[var(--surface-2)]">
                      <tr>
                        <th className="text-left px-3 py-2 font-semibold text-[var(--text-muted)]">Account</th>
                        <th className="text-left px-2 py-2 font-semibold text-[var(--text-muted)]">Label</th>
                        <th className="text-right px-2 py-2 font-semibold text-[var(--text-muted)] w-28">Debit (₹)</th>
                        <th className="text-right px-2 py-2 font-semibold text-[var(--text-muted)] w-28">Credit (₹)</th>
                        <th className="w-8" />
                      </tr>
                    </thead>
                    <tbody>
                      {form.items.map((line, idx) => (
                        <tr key={idx} className="border-t border-[var(--border)]">
                          <td className="px-3 py-1.5">
                            <select className="auth-input py-1 text-xs"
                              value={line.accountId}
                              onChange={e => updateLine(idx, 'accountId', +e.target.value)}>
                              <option value={0}>— select —</option>
                              {accounts.filter(a => !a.isArchived).map(a => (
                                <option key={a.id} value={a.id}>{a.code ? `[${a.code}] ` : ''}{a.name}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-2 py-1.5">
                            <input className="auth-input py-1 text-xs" value={line.label ?? ''}
                              onChange={e => updateLine(idx, 'label', e.target.value)} />
                          </td>
                          <td className="px-2 py-1.5">
                            <input type="number" min="0" step="0.01" className="auth-input py-1 text-xs text-right"
                              value={line.debit || ''}
                              onChange={e => updateLine(idx, 'debit', parseFloat(e.target.value) || 0)} />
                          </td>
                          <td className="px-2 py-1.5">
                            <input type="number" min="0" step="0.01" className="auth-input py-1 text-xs text-right"
                              value={line.credit || ''}
                              onChange={e => updateLine(idx, 'credit', parseFloat(e.target.value) || 0)} />
                          </td>
                          <td className="px-2 py-1.5">
                            {form.items.length > 2 && (
                              <button type="button" onClick={() => removeLine(idx)}
                                className="text-red-400 hover:text-red-300 transition-colors">
                                <X size={13} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-[var(--surface-2)] border-t border-[var(--border)]">
                      <tr>
                        <td colSpan={2} className="px-3 py-2 text-xs font-semibold text-[var(--text-muted)]">Totals</td>
                        <td className={`px-2 py-2 text-right text-xs font-bold ${isBalanced ? 'text-green-400' : 'text-red-400'}`}>
                          {fmt(totalDebit)}
                        </td>
                        <td className={`px-2 py-2 text-right text-xs font-bold ${isBalanced ? 'text-green-400' : 'text-red-400'}`}>
                          {fmt(totalCredit)}
                        </td>
                        <td />
                      </tr>
                    </tfoot>
                  </table>
                </div>
                {!isBalanced && totalDebit > 0 && (
                  <p className="text-xs text-red-400 mt-1">
                    ⚠ Debit and Credit must match. Difference: ₹{fmt(Math.abs(totalDebit - totalCredit))}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" size="sm" disabled={saving || !isBalanced}>
                  {saving ? <><Loader2 size={13} className="animate-spin mr-1" />Saving…</> : 'Save as Draft'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* ── Entries Table ─────────────────────────────── */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-10">
              <Loader2 size={22} className="animate-spin text-[var(--accent)]" />
            </div>
          ) : entries.length === 0 ? (
            <div className="flex flex-col items-center gap-2 p-10 text-[var(--text-muted)]">
              <FileText size={28} className="opacity-30" />
              <p className="text-sm">No journal entries yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-5">#</TableHead>
                  <TableHead>Journal</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead className="text-right">Debit</TableHead>
                  <TableHead className="text-right">Credit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="pr-5 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map(e => (
                  <TableRow key={e.id} className="cursor-pointer hover:bg-[var(--surface-2)]"
                    onClick={() => setViewEntry(e)}>
                    <TableCell className="pl-5 text-xs font-mono text-[var(--text-muted)]">#{e.id}</TableCell>
                    <TableCell className="text-sm text-[var(--text)]">{e.journalName}</TableCell>
                    <TableCell className="text-xs text-[var(--text-muted)]">{e.date}</TableCell>
                    <TableCell className="text-xs text-[var(--text-muted)]">{e.reference || '—'}</TableCell>
                    <TableCell className="text-right text-xs font-medium">₹{fmt(e.totalDebit)}</TableCell>
                    <TableCell className="text-right text-xs font-medium">₹{fmt(e.totalCredit)}</TableCell>
                    <TableCell onClick={ev => ev.stopPropagation()}>
                      <span className={`flex items-center gap-1 text-xs font-semibold w-fit px-2 py-0.5 rounded-full border ${
                        e.status === 'posted'
                          ? 'bg-green-500/10 text-green-400 border-green-500/20'
                          : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                      }`}>
                        {e.status === 'posted' ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                        {e.status}
                      </span>
                    </TableCell>
                    <TableCell className="pr-5 text-right" onClick={ev => ev.stopPropagation()}>
                      {e.status === 'draft' && (
                        <Button size="sm" variant="outline" className="h-6 text-xs px-2"
                          disabled={posting === e.id}
                          onClick={() => handlePost(e.id)}>
                          {posting === e.id ? <Loader2 size={11} className="animate-spin" /> : 'Post'}
                        </Button>
                      )}
                      {e.status === 'posted' && (
                        <span className="flex items-center justify-end gap-1 text-xs text-green-400">
                          <CheckCircle2 size={11} /> Posted
                        </span>
                      )}
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

/* ─── Page ──────────────────────────────────────────────────── */
export default function JournalsPage() {
  const { fetchJournals } = useJournalStore()
  const [tab, setTab] = useState<'journals' | 'entries'>('journals')

  useEffect(() => { fetchJournals() }, []) // eslint-disable-line

  return (
    <div className="db-page">
      <div className="db-page-header">
        <div>
          <h1 className="db-page-title">Journals & Entries</h1>
          <p className="db-page-sub">Configure journals and record double-entry transactions.</p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 mb-4 border-b border-[var(--border)]">
        {(['journals', 'entries'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              tab === t
                ? 'border-[var(--accent)] text-[var(--accent)]'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text)]'
            }`}
          >
            {t === 'journals' ? 'Journal Setup' : 'Journal Entries'}
          </button>
        ))}
      </div>

      {tab === 'journals' ? <JournalSetup /> : <JournalEntries />}
    </div>
  )
}
