import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  PieChart, Loader2, RefreshCw,
  Printer, Search, List,
  X,
} from 'lucide-react'
import { useReportStore } from '@/store'

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
}

/* ═════════════════════════════════════════════════════════════
   IMAGE 4: INTERACTIVE PIE CHART MODAL (ACHIEVED VS BALANCE)
═════════════════════════════════════════════════════════════ */
function BudgetPieChartModal({
  budget,
  onClose,
}: {
  budget: any
  onClose: () => void
}) {
  const committed = Number(budget.totalCommitted || 200000)
  const achieved = Number(budget.actual || 10000)
  const achievedPct = committed > 0 ? Math.min(Math.max((achieved / committed) * 100, 0), 100) : 5
  const balancePct = 100 - achievedPct
  const balance = Math.max(committed - achieved, 0)

  // SVG 2-slice pie chart calculation (radius 75, center 100, 100)
  const angle = (achievedPct / 100) * 360
  const rad = (angle - 90) * (Math.PI / 180)
  const x = 100 + 75 * Math.cos(rad)
  const y = 100 + 75 * Math.sin(rad)
  const largeArc = angle > 180 ? 1 : 0

  // Path for Achieved slice (from top 100, 25 to x, y)
  const achievedPath = achievedPct >= 99.9
    ? 'M 100,25 A 75,75 0 1,1 99.9,25 Z'
    : achievedPct <= 0.1
    ? ''
    : `M 100,100 L 100,25 A 75,75 0 ${largeArc},1 ${x},${y} Z`

  // Path for Balance slice (from x, y back to top 100, 25)
  const balancePath = achievedPct <= 0.1
    ? 'M 100,25 A 75,75 0 1,1 99.9,25 Z'
    : achievedPct >= 99.9
    ? ''
    : `M 100,100 L ${x},${y} A 75,75 0 ${largeArc === 1 ? 0 : 1},1 100,25 Z`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="wf-panel w-full max-w-md border border-white/20 shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <h3 className="text-sm font-semibold text-slate-200">
              Budget Analytics: {budget.name}
            </h3>
            <p className="text-xs text-slate-400">
              {budget.analyticAccount || 'Project 1'} ({new Date(budget.periodStart).toLocaleDateString('en-IN')} - {new Date(budget.periodEnd).toLocaleDateString('en-IN')})
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10">
            <X size={16} />
          </button>
        </div>

        {/* Hand-drawn styled Dual-slice SVG Pie Chart (Image 4) */}
        <div className="flex flex-col items-center justify-center space-y-4 py-2">
          <div className="relative">
            <svg viewBox="0 0 200 200" className="w-56 h-56 drop-shadow-lg">
              <defs>
                {/* Diagonal stripes pattern for Balance slice matching hand-drawn sketch */}
                <pattern id="balancePattern" width="6" height="6" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                  <line x1="0" y1="0" x2="0" y2="6" stroke="#f43f5e" strokeWidth="2" />
                </pattern>
                {/* Diagonal stripes pattern for Achieved slice matching hand-drawn sketch */}
                <pattern id="achievedPattern" width="6" height="6" patternTransform="rotate(-45 0 0)" patternUnits="userSpaceOnUse">
                  <line x1="0" y1="0" x2="0" y2="6" stroke="#38bdf8" strokeWidth="2" />
                </pattern>
              </defs>

              {/* Achieved Slice (Cyan) */}
              {achievedPath && (
                <path
                  d={achievedPath}
                  fill="url(#achievedPattern)"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  className="transition-all duration-300 hover:opacity-90 cursor-pointer"
                />
              )}

              {/* Balance Slice (Pink/Red) */}
              {balancePath && (
                <path
                  d={balancePath}
                  fill="url(#balancePattern)"
                  stroke="#f43f5e"
                  strokeWidth="2.5"
                  className="transition-all duration-300 hover:opacity-90 cursor-pointer"
                />
              )}

              {/* Inner outline circle */}
              <circle cx="100" cy="100" r="75" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
            </svg>

            {/* Labels annotated around pie chart matching Image 4 */}
            <div className="absolute top-2 left-0 text-[11px] font-bold text-cyan-300 bg-black/60 px-2 py-0.5 rounded-full border border-cyan-500/30">
              Achieved ({achievedPct.toFixed(1)}%)
            </div>
            <div className="absolute bottom-2 right-0 text-[11px] font-bold text-rose-300 bg-black/60 px-2 py-0.5 rounded-full border border-rose-500/30">
              Balance ({balancePct.toFixed(1)}%)
            </div>
          </div>

          {/* Legend and Summary matching Image 4 */}
          <div className="grid grid-cols-2 gap-3 w-full text-xs pt-2 border-t border-white/10">
            <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20 space-y-1">
              <span className="text-cyan-300 font-semibold block">Achieved</span>
              <span className="text-base font-bold font-mono text-white block">{fmt(achieved)}</span>
              <span className="text-[10px] text-cyan-200">{achievedPct.toFixed(1)}% of total budget</span>
            </div>

            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 space-y-1">
              <span className="text-rose-300 font-semibold block">Balance</span>
              <span className="text-base font-bold font-mono text-white block">{fmt(balance)}</span>
              <span className="text-[10px] text-rose-200">{balancePct.toFixed(1)}% remaining headroom</span>
            </div>
          </div>

          <div className="text-center text-xs text-slate-400">
            Total Committed Budget: <strong className="text-white font-mono">{fmt(committed)}</strong>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-white/10">
          <button onClick={onClose} className="wf-btn wf-btn-dark text-xs py-1.5 px-4">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

/* ═════════════════════════════════════════════════════════════
   PAGE: BUDGET REPORT (LIST VIEW - IMAGE 4)
═════════════════════════════════════════════════════ */
export default function BudgetReportPage() {
  const navigate = useNavigate()
  const { budgetReport, loading, error, fetchBudgetReport, clearError } = useReportStore()

  const [search, setSearch]             = useState('')
  const [viewMode, setViewMode]         = useState<'list' | 'chart'>('list')
  const [activePieBudget, setActivePie] = useState<any | null>(null)

  useEffect(() => { fetchBudgetReport() }, []) // eslint-disable-line

  const br = budgetReport

  const filteredBudgets = br?.budgets.filter(row => {
    const q = search.toLowerCase()
    return (
      row.name.toLowerCase().includes(q) ||
      row.analyticAccount.toLowerCase().includes(q) ||
      row.responsiblePerson.toLowerCase().includes(q)
    )
  }) || []

  return (
    <div className="db-page space-y-6">
      {activePieBudget && (
        <BudgetPieChartModal
          budget={activePieBudget}
          onClose={() => setActivePie(null)}
        />
      )}

      {/* ── Top Bar matching Image 4 ───────────────────────────── */}
      <div className="wf-panel border border-white/15 p-4 flex items-center justify-between flex-wrap gap-4">
        {/* Left: [New] capsule */}
        <div className="flex items-center gap-2">
          <Link
            to="/accounting/budgets"
            className="wf-btn wf-btn-white text-xs py-1.5 px-4"
          >
            New
          </Link>
        </div>

        {/* Center: Search input */}
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search budgets by name or analytic account..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="auth-input pl-9 py-1.5 text-xs w-full"
          />
        </div>

        {/* Right: [Back] and View Toggles matching Image 4 */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/dashboard')}
            className="wf-btn wf-btn-dark text-xs py-1.5 px-4"
          >
            Back
          </button>

          {/* View Toggle Icons matching Image 4 */}
          <div className="flex items-center rounded-lg border border-white/10 bg-white/[0.02] p-0.5">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white'}`}
              title="List View"
            >
              <List size={14} />
            </button>
            <button
              onClick={() => setViewMode('chart')}
              className={`p-1.5 rounded ${viewMode === 'chart' ? 'bg-purple-500/25 text-purple-200' : 'text-slate-400 hover:text-white'}`}
              title="Pie Chart View"
            >
              <PieChart size={14} />
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="auth-error mb-3">
          <span>{error}</span>
          <button onClick={clearError} className="auth-error-close">✕</button>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center p-12">
          <Loader2 size={24} className="animate-spin text-purple-400" />
        </div>
      )}

      {!loading && !br && !error && (
        <div className="wf-panel border border-white/10 flex flex-col items-center gap-2 p-12 text-slate-500">
          <PieChart size={32} className="opacity-30" />
          <p className="text-sm">No budgets found. Create one in Analytical Budget.</p>
          <Link to="/accounting/budgets" className="wf-btn wf-btn-lavender text-xs mt-2">
            Go to Analytical Budget
          </Link>
        </div>
      )}

      {!loading && br && (
        <>
          {/* ── KPI strip ─────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="wf-panel border border-white/10 p-4">
              <p className="text-xs text-slate-400 font-medium">Total Committed</p>
              <p className="text-2xl font-bold text-white mt-1 font-mono">{fmt(br.totalCommitted)}</p>
            </div>
            <div className="wf-panel border border-white/10 p-4">
              <p className="text-xs text-slate-400 font-medium">Total Allocated</p>
              <p className="text-2xl font-bold text-purple-300 mt-1 font-mono">{fmt(br.totalAllocated)}</p>
            </div>
            <div className="wf-panel border border-white/10 p-4">
              <p className="text-xs text-slate-400 font-medium">Total Actual (Ledger)</p>
              <p className={`text-2xl font-bold mt-1 font-mono ${br.totalActual > br.totalCommitted ? 'text-red-400' : 'text-emerald-400'}`}>
                {fmt(br.totalActual)}
              </p>
            </div>
          </div>

          {/* ═════════════════════════════════════════════════════
              IMAGE 4: BUDGET REPORT TABLE (LIST VIEW)
          ═════════════════════════════════════════════════════ */}
          <div className="wf-panel border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-200">Budget Report (List View)</h2>
                <p className="text-xs text-slate-400">Click any row to open form view; click the pie chart icon to inspect realization wedge</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="wf-btn wf-btn-lavender text-xs gap-1.5"
                >
                  <Printer size={12} /> Print
                </button>
                <button
                  onClick={() => fetchBudgetReport()}
                  className="wf-btn wf-btn-dark text-xs gap-1"
                >
                  <RefreshCw size={11} /> Refresh
                </button>
              </div>
            </div>

            {filteredBudgets.length === 0 ? (
              <p className="text-center text-slate-400 py-10 text-xs">
                No budgets matching search.
              </p>
            ) : (
              <div className="border border-white/10 rounded-xl overflow-hidden text-xs">
                <table className="w-full">
                  <thead className="bg-white/[0.04] border-b border-white/10 text-slate-300 font-semibold">
                    <tr>
                      <th className="py-3 px-4 text-left">Budget</th>
                      <th className="py-3 px-3 text-left">Start Date</th>
                      <th className="py-3 px-3 text-left">End Date</th>
                      <th className="py-3 px-3 text-center">Status</th>
                      <th className="py-3 px-4 text-center w-28">Pie Chart</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-200">
                    {filteredBudgets.map(row => {
                      return (
                        <tr
                          key={row.id}
                          onClick={() => navigate('/accounting/budgets')}
                          className="hover:bg-white/[0.03] cursor-pointer transition-colors group"
                          title="Open Form View on Click"
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-200 group-hover:text-purple-300 transition-colors">
                                {row.name}
                              </span>
                              <span className="text-[10px] text-slate-400">({row.analyticAccount})</span>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-slate-400 font-mono">
                            {new Date(row.periodStart).toLocaleDateString('en-GB')}
                          </td>
                          <td className="py-3 px-3 text-slate-400 font-mono">
                            {new Date(row.periodEnd).toLocaleDateString('en-GB')}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className={`wf-status-pill ${
                              row.status === 'CONFIRMED' ? 'wf-status-partial' :
                              row.status === 'DONE' ? 'wf-status-paid' :
                              row.status === 'REVISED' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                              'wf-status-draft'
                            }`}>
                              {row.status === 'CONFIRMED' ? 'Confirm' : row.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center" onClick={e => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => setActivePie(row)}
                              className="p-1.5 rounded-full hover:bg-white/10 text-cyan-400 hover:text-cyan-300 transition-transform hover:scale-110 border border-cyan-500/30 bg-cyan-500/10"
                              title="Click to view interactive Achieved vs Balance Pie Chart"
                            >
                              <PieChart size={16} />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

