import { useEffect, useState } from 'react'
import { PieChart, Loader2, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { useReportStore } from '@/store'

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
}

const STATUS_STYLE: Record<string, string> = {
  DRAFT:     'bg-zinc-500/10  text-zinc-400  border-zinc-500/20',
  CONFIRMED: 'bg-blue-500/10  text-blue-400  border-blue-500/20',
  REVISED:   'bg-orange-500/10 text-orange-400 border-orange-500/20',
  DONE:      'bg-green-500/10 text-green-400 border-green-500/20',
}

export default function BudgetReportPage() {
  const { budgetReport, loading, error, fetchBudgetReport, clearError } = useReportStore()

  useEffect(() => { fetchBudgetReport() }, []) // eslint-disable-line

  const br = budgetReport

  return (
    <div className="db-page">
      <div className="db-page-header">
        <div>
          <h1 className="db-page-title">Budget Report</h1>
          <p className="db-page-sub">Committed vs allocated vs actual amounts across all budgets.</p>
        </div>
        <Button size="sm" variant="outline" className="gap-1.5"
          disabled={loading} onClick={() => fetchBudgetReport()}>
          {loading ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
          Refresh
        </Button>
      </div>

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

      {!loading && !br && !error && (
        <div className="flex flex-col items-center gap-2 p-12 text-[var(--text-muted)]">
          <PieChart size={32} className="opacity-30" />
          <p className="text-sm">No budgets found. Create one in Budget Management.</p>
        </div>
      )}

      {!loading && br && (
        <>
          {/* ── KPI strip ─────────────────────────────── */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-[var(--text-muted)]">Total Committed</p>
                <p className="text-2xl font-bold text-[var(--text)] mt-0.5">{fmt(br.totalCommitted)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-[var(--text-muted)]">Total Allocated</p>
                <p className="text-2xl font-bold text-[var(--accent)] mt-0.5">{fmt(br.totalAllocated)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-[var(--text-muted)]">Total Actual (Ledger)</p>
                <p className={`text-2xl font-bold mt-0.5 ${br.totalActual > br.totalCommitted ? 'text-red-400' : 'text-green-400'}`}>
                  {fmt(br.totalActual)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* ── Overall utilisation bar ────────────────── */}
          {br.totalCommitted > 0 && (
            <Card className="mb-4">
              <CardContent className="pt-4">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-[var(--text-muted)]">Overall Budget Utilisation (Actual / Committed)</span>
                  <span className="font-semibold">
                    {((br.totalActual / br.totalCommitted) * 100).toFixed(1)}%
                  </span>
                </div>
                <Progress
                  value={Math.min((br.totalActual / br.totalCommitted) * 100, 100)}
                  className="h-2"
                />
              </CardContent>
            </Card>
          )}

          {/* ── Per-budget table ───────────────────────── */}
          <Card>
            <CardContent className="p-0">
              {br.budgets.length === 0 ? (
                <p className="text-center text-[var(--text-muted)] py-10 text-sm">
                  No budgets to display.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-5">Budget</TableHead>
                      <TableHead>Analytic Account</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Committed</TableHead>
                      <TableHead className="text-right">Allocated</TableHead>
                      <TableHead className="text-right">Actual</TableHead>
                      <TableHead className="text-right pr-5">Achieved %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {br.budgets.map(row => {
                      const overBudget = row.actual > row.totalCommitted
                      return (
                        <TableRow key={row.id}>
                          <TableCell className="pl-5">
                            <div>
                              <p className="text-sm font-medium text-[var(--text)]">{row.name}</p>
                              <p className="text-xs text-[var(--text-muted)]">{row.responsiblePerson}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-xs text-[var(--text)]">{row.analyticAccount}</p>
                              <span className={`text-xs ${row.analyticType === 'INCOME' ? 'text-green-400' : 'text-red-400'}`}>
                                {row.analyticType}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-[var(--text-muted)]">
                            {new Date(row.periodStart).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })} →{' '}
                            {new Date(row.periodEnd).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                          </TableCell>
                          <TableCell>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${STATUS_STYLE[row.status] ?? ''}`}>
                              {row.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-right text-sm">{fmt(row.totalCommitted)}</TableCell>
                          <TableCell className="text-right text-sm">{fmt(row.totalAllocated)}</TableCell>
                          <TableCell className={`text-right text-sm font-medium ${overBudget ? 'text-red-400' : 'text-green-400'}`}>
                            <span className="flex items-center justify-end gap-1">
                              {overBudget ? <TrendingDown size={11} /> : <TrendingUp size={11} />}
                              {fmt(row.actual)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right pr-5">
                            <div className="flex flex-col items-end gap-1">
                              <span className={`text-sm font-bold ${row.achievedPercent >= 100 ? 'text-green-400' : 'text-[var(--accent)]'}`}>
                                {row.achievedPercent.toFixed(1)}%
                              </span>
                              <Progress value={Math.min(row.achievedPercent, 100)} className="h-1 w-16" />
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
