import { useEffect, useState } from 'react'
import {
  CreditCard, Loader2, ArrowDownCircle, ArrowUpCircle,
  Banknote, Building2, Filter,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { useTransactionStore, type Payment } from '@/store'

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n)
}

export default function PaymentPage() {
  const { payments, loading, error, fetchPayments } = useTransactionStore()

  const [from,        setFrom]        = useState('')
  const [to,          setTo]          = useState('')
  const [typeFilter,  setTypeFilter]  = useState<'all' | 'inbound' | 'outbound'>('all')
  const [methodFilter, setMethodFilter] = useState<'all' | 'bank' | 'cash'>('all')

  useEffect(() => { fetchPayments() }, []) // eslint-disable-line

  function handleFilter(e: React.FormEvent) {
    e.preventDefault()
    fetchPayments({ from: from || undefined, to: to || undefined })
  }

  const filtered = payments.filter(p => {
    const typeOk   = typeFilter   === 'all' || p.type   === typeFilter
    const methodOk = methodFilter === 'all' || p.method === methodFilter
    return typeOk && methodOk
  })

  const totalInbound  = filtered.filter(p => p.type === 'inbound').reduce((s, p) => s + p.amount, 0)
  const totalOutbound = filtered.filter(p => p.type === 'outbound').reduce((s, p) => s + p.amount, 0)
  const net = totalInbound - totalOutbound

  return (
    <div className="db-page">
      <div className="db-page-header">
        <div>
          <h1 className="db-page-title">Payments</h1>
          <p className="db-page-sub">All inbound and outbound payment records.</p>
        </div>
      </div>

      {/* ── KPI strip ────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1">
              <ArrowDownCircle size={15} className="text-green-400" />
              <p className="text-xs text-[var(--text-muted)]">Total Inbound</p>
            </div>
            <p className="text-2xl font-bold text-green-400">{fmt(totalInbound)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1">
              <ArrowUpCircle size={15} className="text-red-400" />
              <p className="text-xs text-[var(--text-muted)]">Total Outbound</p>
            </div>
            <p className="text-2xl font-bold text-red-400">{fmt(totalOutbound)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1">
              <CreditCard size={15} className="text-[var(--accent)]" />
              <p className="text-xs text-[var(--text-muted)]">Net Cash Flow</p>
            </div>
            <p className={`text-2xl font-bold ${net >= 0 ? 'text-green-400' : 'text-red-400'}`}>{fmt(net)}</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Date Filter ──────────────────────────────── */}
      <Card className="mb-4">
        <CardContent className="pt-4">
          <form onSubmit={handleFilter} className="flex flex-wrap items-end gap-3">
            <div className="auth-field mb-0">
              <label className="auth-label">From Date</label>
              <input type="date" className="auth-input" value={from}
                onChange={e => setFrom(e.target.value)} />
            </div>
            <div className="auth-field mb-0">
              <label className="auth-label">To Date</label>
              <input type="date" className="auth-input" value={to}
                onChange={e => setTo(e.target.value)} />
            </div>
            <Button type="submit" size="sm" variant="outline" className="gap-1.5 mb-0.5">
              <Filter size={13} /> Apply
            </Button>
            <Button type="button" size="sm" variant="ghost" className="mb-0.5 text-[var(--text-muted)]"
              onClick={() => { setFrom(''); setTo(''); fetchPayments() }}>
              Clear
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* ── Filter Pills ─────────────────────────────── */}
      <div className="flex flex-wrap gap-2 mb-3">
        <div className="flex gap-1">
          {(['all', 'inbound', 'outbound'] as const).map(t => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`px-3 py-1 text-xs rounded-full border transition-colors capitalize ${
                typeFilter === t
                  ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
                  : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)]'
              }`}>
              {t}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {(['all', 'bank', 'cash'] as const).map(m => (
            <button key={m} onClick={() => setMethodFilter(m)}
              className={`px-3 py-1 text-xs rounded-full border transition-colors capitalize ${
                methodFilter === m
                  ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
                  : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)]'
              }`}>
              {m === 'bank' ? <><Building2 size={10} className="inline mr-1" />Bank</>
               : m === 'cash' ? <><Banknote size={10} className="inline mr-1" />Cash</>
               : 'All Methods'}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="auth-error mb-3"><span>{error}</span></div>}

      {/* ── Table ───────────────────────────────────── */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 size={24} className="animate-spin text-[var(--accent)]" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 p-12 text-[var(--text-muted)]">
              <CreditCard size={32} className="opacity-30" />
              <p className="text-sm">No payments found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-5">#</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Linked To</TableHead>
                  <TableHead className="text-right">Journal Entry</TableHead>
                  <TableHead className="text-right pr-5">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="pl-5 font-mono text-xs text-[var(--text-muted)]">#{p.id}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${
                        p.type === 'inbound'
                          ? 'bg-green-500/10 text-green-400 border-green-500/20'
                          : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {p.type === 'inbound'
                          ? <ArrowDownCircle size={10} />
                          : <ArrowUpCircle size={10} />}
                        {p.type}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)]">
                        {p.method === 'bank' ? <Building2 size={11} /> : <Banknote size={11} />}
                        {p.method}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-[var(--text-muted)]">{p.date}</TableCell>
                    <TableCell className="text-xs font-mono text-[var(--text-muted)]">{p.reference || '—'}</TableCell>
                    <TableCell className="text-xs text-[var(--text-muted)]">
                      {p.invoiceId ? `Invoice #${p.invoiceId}` : p.billId ? `Bill #${p.billId}` : '—'}
                    </TableCell>
                    <TableCell className="text-right text-xs font-mono text-[var(--text-muted)]">
                      #{p.journalEntryId}
                    </TableCell>
                    <TableCell className={`text-right pr-5 text-sm font-bold ${
                      p.type === 'inbound' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {p.type === 'outbound' ? '−' : '+'}{fmt(p.amount)}
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
