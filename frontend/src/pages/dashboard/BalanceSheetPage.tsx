import { useEffect, useState } from 'react'
import { BarChart3, Loader2, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { useReportStore, type BalanceSheetRow } from '@/store'

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n)
}

function AccountGroup({
  title, rows, total, colorClass,
}: {
  title: string
  rows: BalanceSheetRow[]
  total: number
  colorClass: string
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-[var(--text)] flex items-center justify-between">
          <span>{title}</span>
          <span className={`text-base font-bold ${colorClass}`}>{fmt(total)}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 pb-2">
        {rows.length === 0 ? (
          <p className="px-5 py-3 text-xs text-[var(--text-faint)]">No accounts.</p>
        ) : (
          <Table>
            <TableBody>
              {rows.map(r => (
                <TableRow key={r.accountId}>
                  <TableCell className="pl-5 text-xs text-[var(--text)]">{r.accountName}</TableCell>
                  <TableCell className="text-xs text-[var(--text-muted)] capitalize">{r.accountType}</TableCell>
                  <TableCell className="pr-5 text-right text-xs font-medium">{fmt(r.balance)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

export default function BalanceSheetPage() {
  const { balanceSheet, loading, error, fetchBalanceSheet, clearError } = useReportStore()
  const [asOf, setAsOf] = useState(new Date().toISOString().slice(0, 10))

  useEffect(() => { fetchBalanceSheet({ asOf }) }, []) // eslint-disable-line

  function handleFetch(e: React.FormEvent) {
    e.preventDefault()
    fetchBalanceSheet({ asOf })
  }

  const bs = balanceSheet

  return (
    <div className="db-page">
      <div className="db-page-header">
        <div>
          <h1 className="db-page-title">Balance Sheet</h1>
          <p className="db-page-sub">Snapshot of assets, liabilities and capital at a point in time.</p>
        </div>
      </div>

      {/* ── Date picker ──────────────────────────────── */}
      <Card className="mb-4">
        <CardContent className="pt-4">
          <form onSubmit={handleFetch} className="flex items-end gap-3">
            <div className="auth-field mb-0">
              <label className="auth-label">As Of Date</label>
              <input type="date" className="auth-input" value={asOf}
                onChange={e => setAsOf(e.target.value)} required />
            </div>
            <Button type="submit" size="sm" className="gap-1.5 mb-0.5" disabled={loading}>
              {loading ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
              Generate
            </Button>
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

      {!loading && !bs && !error && (
        <div className="flex flex-col items-center gap-2 p-12 text-[var(--text-muted)]">
          <BarChart3 size={32} className="opacity-30" />
          <p className="text-sm">Click Generate to load the balance sheet.</p>
        </div>
      )}

      {!loading && bs && (
        <>
          {/* ── Balance indicator ─────────────────────── */}
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border mb-4 text-sm font-medium ${
            bs.balanced
              ? 'bg-green-500/10 border-green-500/20 text-green-400'
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}>
            {bs.balanced
              ? <><CheckCircle2 size={15} /> Balanced — Assets = Liabilities + Capital</>
              : <><AlertTriangle size={15} /> Unbalanced — check your journal entries</>}
            <span className="ml-auto text-xs opacity-70">As of {bs.asOf}</span>
          </div>

          {/* ── Two-column layout ─────────────────────── */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Left — Assets */}
            <div className="space-y-4">
              <AccountGroup
                title="Assets"
                rows={bs.assets}
                total={bs.totalAssets}
                colorClass="text-blue-400"
              />
            </div>

            {/* Right — Liabilities + Capital */}
            <div className="space-y-4">
              <AccountGroup
                title="Liabilities"
                rows={bs.liabilities}
                total={bs.totalLiabilities}
                colorClass="text-red-400"
              />
              <AccountGroup
                title="Capital / Equity"
                rows={bs.capital}
                total={bs.totalCapital}
                colorClass="text-purple-400"
              />

              {/* Summary */}
              <Card>
                <CardContent className="pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--text-muted)]">Total Assets</span>
                    <span className="font-semibold text-blue-400">{fmt(bs.totalAssets)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--text-muted)]">Total Liabilities</span>
                    <span className="font-semibold text-red-400">{fmt(bs.totalLiabilities)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--text-muted)]">Total Capital</span>
                    <span className="font-semibold text-purple-400">{fmt(bs.totalCapital)}</span>
                  </div>
                  <div className="border-t border-[var(--border)] pt-2 flex justify-between text-sm font-bold">
                    <span className="text-[var(--text)]">Liabilities + Capital</span>
                    <span className={bs.balanced ? 'text-green-400' : 'text-red-400'}>
                      {fmt(bs.totalLiabilities + bs.totalCapital)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
