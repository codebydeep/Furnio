import { useEffect, useState } from 'react'
import {
  CreditCard, Loader2, ArrowDownCircle, ArrowUpCircle,
  Banknote, Building2, Filter,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { useTransactionStore } from '@/store'

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n)
}

export default function PaymentPage() {
  const { payments, loading, error, fetchPayments } = useTransactionStore()

  const [from,           setFrom]           = useState('')
  const [to,             setTo]             = useState('')
  const [dirFilter,      setDirFilter]      = useState<'all' | 'RECEIVED' | 'SEND'>('all')
  const [journalFilter,  setJournalFilter]  = useState<'all' | 'BANK' | 'CASH'>('all')

  useEffect(() => { fetchPayments() }, []) // eslint-disable-line

  function handleFilter(e: React.FormEvent) {
    e.preventDefault()
    fetchPayments({ from: from || undefined, to: to || undefined })
  }

  const filtered = payments.filter(p => {
    const dirOk     = dirFilter    === 'all' || p.direction         === dirFilter
    const journalOk = journalFilter === 'all' || (p.journal?.type ?? '') === journalFilter
    return dirOk && journalOk
  })

  const totalReceived = filtered.filter(p => p.direction === 'RECEIVED').reduce((s, p) => s + Number(p.amount), 0)
  const totalSent     = filtered.filter(p => p.direction === 'SEND').reduce((s, p) => s + Number(p.amount), 0)
  const net = totalReceived - totalSent

  return (
    <div className="db-page">
      <div className="db-page-header">
        <div>
          <h1 className="db-page-title">Payments</h1>
          <p className="db-page-sub">All inbound (received) and outbound (sent) payment records.</p>
        </div>
      </div>

      {/* ── KPI strip ────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1">
              <ArrowDownCircle size={15} className="text-green-400" />
              <p className="text-xs text-[var(--text-muted)]">Total Received</p>
            </div>
            <p className="text-2xl font-bold text-green-400">{fmt(totalReceived)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1">
              <ArrowUpCircle size={15} className="text-red-400" />
              <p className="text-xs text-[var(--text-muted)]">Total Sent</p>
            </div>
            <p className="text-2xl font-bold text-red-400">{fmt(totalSent)}</p>
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
              <input type="date" className="auth-input" value={from} onChange={e => setFrom(e.target.value)} />
            </div>
            <div className="auth-field mb-0">
              <label className="auth-label">To Date</label>
              <input type="date" className="auth-input" value={to} onChange={e => setTo(e.target.value)} />
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
          {(['all', 'RECEIVED', 'SEND'] as const).map(d => (
            <button key={d} onClick={() => setDirFilter(d)}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                dirFilter === d
                  ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
                  : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)]'
              }`}>
              {d === 'all' ? 'All' : d === 'RECEIVED' ? 'Received' : 'Sent'}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {(['all', 'BANK', 'CASH'] as const).map(m => (
            <button key={m} onClick={() => setJournalFilter(m)}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                journalFilter === m
                  ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
                  : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)]'
              }`}>
              {m === 'BANK' ? <><Building2 size={10} className="inline mr-1" />Bank</>
               : m === 'CASH' ? <><Banknote size={10} className="inline mr-1" />Cash</>
               : 'All'}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="auth-error mb-3"><span>{error}</span></div>}

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
                  <TableHead>Direction</TableHead>
                  <TableHead>Journal</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Linked To</TableHead>
                  <TableHead className="text-right pr-5">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="pl-5 font-mono text-xs text-[var(--text-muted)]">#{p.id}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${
                        p.direction === 'RECEIVED'
                          ? 'bg-green-500/10 text-green-400 border-green-500/20'
                          : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {p.direction === 'RECEIVED'
                          ? <ArrowDownCircle size={10} />
                          : <ArrowUpCircle size={10} />}
                        {p.direction === 'RECEIVED' ? 'Received' : 'Sent'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)]">
                        {p.journal?.type === 'BANK' ? <Building2 size={11} /> : <Banknote size={11} />}
                        {p.journal?.name ?? '—'}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-[var(--text-muted)]">
                      {p.date ? new Date(p.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    </TableCell>
                    <TableCell className="text-xs text-[var(--text-muted)]">
                      {p.customerInvoiceId ? `Invoice #${p.customerInvoiceId}`
                        : p.vendorBillId   ? `Bill #${p.vendorBillId}`
                        : '—'}
                    </TableCell>
                    <TableCell className={`text-right pr-5 text-sm font-bold ${
                      p.direction === 'RECEIVED' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {p.direction === 'SEND' ? '−' : '+'}{fmt(Number(p.amount))}
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
