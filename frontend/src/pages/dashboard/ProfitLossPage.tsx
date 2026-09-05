import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Loader2, RefreshCw, DollarSign } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { useReportStore, type PLRow } from '@/store'

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n)
}

function PLGroup({
  title, rows, total, colorClass, icon: Icon,
}: {
  title: string
  rows: PLRow[]
  total: number
  colorClass: string
  icon: React.ElementType
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Icon size={14} className={colorClass} /> {title}
          </span>
          <span className={`text-base font-bold ${colorClass}`}>{fmt(total)}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 pb-2">
        {rows.length === 0 ? (
          <p className="px-5 py-3 text-xs text-[var(--text-faint)]">No entries.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-5">Account</TableHead>
                <TableHead className="pr-5 text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(r => (
                <TableRow key={r.accountId}>
                  <TableCell className="pl-5 text-xs text-[var(--text)]">{r.accountName}</TableCell>
                  <TableCell className="pr-5 text-right text-xs font-medium">{fmt(r.amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

export default function ProfitLossPage() {
  const { profitLoss, loading, error, fetchProfitLoss, clearError } = useReportStore()

  // Default: current month
  const now   = new Date()
  const y     = now.getFullYear()
  const m     = String(now.getMonth() + 1).padStart(2, '0')
  const [from, setFrom] = useState(`${y}-${m}-01`)
  const [to,   setTo]   = useState(new Date().toISOString().slice(0, 10))

  useEffect(() => { fetchProfitLoss({ from, to }) }, []) // eslint-disable-line

  function handleFetch(e: React.FormEvent) {
    e.preventDefault()
    fetchProfitLoss({ from, to })
  }

  const pl = profitLoss
  const profitMargin = pl && pl.totalIncome > 0
    ? (pl.netProfit / pl.totalIncome) * 100
    : 0
  const expenseRatio = pl && pl.totalIncome > 0
    ? (pl.totalExpenses / pl.totalIncome) * 100
    : 0

  return (
    <div className="db-page">
      <div className="db-page-header">
        <div>
          <h1 className="db-page-title">Profit & Loss</h1>
          <p className="db-page-sub">Income vs expenses for a selected date range.</p>
        </div>
      </div>

      {/* ── Date range picker ─────────────────────────── */}
      <Card className="mb-4">
        <CardContent className="pt-4">
          <form onSubmit={handleFetch} className="flex flex-wrap items-end gap-3">
            <div className="auth-field mb-0">
              <label className="auth-label">From Date</label>
              <input type="date" className="auth-input" value={from}
                onChange={e => setFrom(e.target.value)} required />
            </div>
            <div className="auth-field mb-0">
              <label className="auth-label">To Date</label>
              <input type="date" className="auth-input" value={to}
                onChange={e => setTo(e.target.value)} required />
            </div>
            <Button type="submit" size="sm" className="gap-1.5 mb-0.5" disabled={loading}>
              {loading ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
              Generate
            </Button>
            {/* Quick ranges */}
            <div className="flex gap-1 mb-0.5">
              {[
                { label: 'This Month', from: `${y}-${m}-01`, to: new Date().toISOString().slice(0, 10) },
                { label: 'This Year',  from: `${y}-01-01`,   to: `${y}-12-31` },
                { label: 'Last Month',
                  from: new Date(y, now.getMonth() - 1, 1).toISOString().slice(0, 10),
                  to:   new Date(y, now.getMonth(), 0).toISOString().slice(0, 10),
                },
              ].map(r => (
                <button
                  key={r.label} type="button"
                  onClick={() => { setFrom(r.from); setTo(r.to) }}
                  className="px-2 py-1 text-xs rounded border border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
                >
                  {r.label}
                </button>
              ))}
            </div>
          </form>
        </CardContent>
      </Card>

      {error && (
        <div className="auth-error mb-3">
          <span>{error}</span>
          <button onClick={clearError} className="auth-error-close">✕</button>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center p-12">
          <Loader2 size={24} className="animate-spin text-[var(--accent)]" />
        </div>
      )}

      {!loading && !pl && !error && (
        <div className="flex flex-col items-center gap-2 p-12 text-[var(--text-muted)]">
          <TrendingUp size={32} className="opacity-30" />
          <p className="text-sm">Click Generate to load the P&L report.</p>
        </div>
      )}

      {!loading && pl && (
        <>
          {/* ── Summary KPIs ──────────────────────────── */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp size={14} className="text-green-400" />
                  <p className="text-xs text-[var(--text-muted)]">Total Income</p>
                </div>
                <p className="text-2xl font-bold text-green-400">{fmt(pl.totalIncome)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingDown size={14} className="text-red-400" />
                  <p className="text-xs text-[var(--text-muted)]">Total Expenses</p>
                </div>
                <p className="text-2xl font-bold text-red-400">{fmt(pl.totalExpenses)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign size={14} className={pl.netProfit >= 0 ? 'text-[var(--accent)]' : 'text-orange-400'} />
                  <p className="text-xs text-[var(--text-muted)]">Net {pl.netProfit >= 0 ? 'Profit' : 'Loss'}</p>
                </div>
                <p className={`text-2xl font-bold ${pl.netProfit >= 0 ? 'text-[var(--accent)]' : 'text-orange-400'}`}>
                  {fmt(Math.abs(pl.netProfit))}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* ── Ratios ────────────────────────────────── */}
          <Card className="mb-4">
            <CardContent className="pt-4 space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[var(--text-muted)]">Profit Margin</span>
                  <span className={profitMargin >= 0 ? 'text-green-400 font-semibold' : 'text-red-400 font-semibold'}>
                    {profitMargin.toFixed(1)}%
                  </span>
                </div>
                <Progress value={Math.max(0, profitMargin)} className="h-1.5" />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[var(--text-muted)]">Expense Ratio</span>
                  <span className={expenseRatio > 80 ? 'text-red-400 font-semibold' : 'text-[var(--text)] font-semibold'}>
                    {expenseRatio.toFixed(1)}%
                  </span>
                </div>
                <Progress value={Math.min(100, expenseRatio)} className="h-1.5" />
              </div>
              <p className="text-xs text-[var(--text-faint)]">
                Period: {pl.from} → {pl.to}
              </p>
            </CardContent>
          </Card>

          {/* ── Income + Expense groups ────────────────── */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <PLGroup
              title="Income"
              rows={pl.income}
              total={pl.totalIncome}
              colorClass="text-green-400"
              icon={TrendingUp}
            />
            <PLGroup
              title="Expenses"
              rows={pl.expenses}
              total={pl.totalExpenses}
              colorClass="text-red-400"
              icon={TrendingDown}
            />
          </div>

          {/* ── Net summary ────────────────────────────── */}
          <Card className="mt-4">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-[var(--text)]">
                  Net {pl.netProfit >= 0 ? 'Profit' : 'Loss'}
                </span>
                <span className={`text-xl font-bold ${pl.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {fmt(pl.netProfit)}
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-1">Income − Expenses</p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
