import { Link } from 'react-router-dom'
import {
  TrendingUp, TrendingDown, ArrowRight,
  FileText, ShoppingCart, CreditCard, AlertCircle,
  Plus, Download,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAuthStore } from '@/store/useAuthStore'

/* ── Status pill ─────────────────────────────────────────────── */
function SPill({ s }: { s: 'paid' | 'overdue' | 'draft' | 'due' }) {
  const map: Record<string, string> = {
    paid:    'pill--paid',
    overdue: 'pill--overdue',
    draft:   'pill--draft',
    due:     'pill--posted',
  }
  const labels: Record<string, string> = {
    paid: 'Paid', overdue: 'Overdue', draft: 'Draft', due: 'Due Soon',
  }
  return <span className={`status-pill ${map[s]}`}>{labels[s]}</span>
}

/* ── KPI card ────────────────────────────────────────────────── */
function KpiCard({
  label, value, sub, trend, trendUp, icon: Icon, accent,
}: {
  label: string; value: string; sub: string
  trend: string; trendUp: boolean
  icon: React.ElementType; accent: string
}) {
  return (
    <Card className="db-kpi-card">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1 min-w-0">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-faint)]">
              {label}
            </span>
            <span className="text-2xl font-black tracking-tight text-[var(--text)] font-mono tabular-nums leading-none mt-1">
              {value}
            </span>
            <span className="text-xs text-[var(--text-muted)] mt-0.5">{sub}</span>
          </div>
          <div
            className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: `${accent}18`, color: accent }}
          >
            <Icon size={18} />
          </div>
        </div>
        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-[var(--border-subtle)]">
          {trendUp
            ? <TrendingUp  size={13} style={{ color: '#16a34a' }} />
            : <TrendingDown size={13} style={{ color: '#dc2626' }} />}
          <span
            className="text-xs font-semibold"
            style={{ color: trendUp ? '#16a34a' : '#dc2626' }}
          >
            {trend}
          </span>
          <span className="text-xs text-[var(--text-faint)]">vs last month</span>
        </div>
      </CardContent>
    </Card>
  )
}

/* ── Budget progress row ─────────────────────────────────────── */
function BudgetRow({
  name, planned, actual, color,
}: {
  name: string; planned: number; actual: number; color: string
}) {
  const pct = Math.min(100, Math.round((actual / planned) * 100))
  const over = actual > planned
  return (
    <div className="flex flex-col gap-1.5 py-2 border-b border-[var(--border-subtle)] last:border-0">
      <div className="flex items-center justify-between">
        <span className="text-sm text-[var(--text)]">{name}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--text-muted)] font-mono tabular-nums">
            ₹{actual.toLocaleString('en-IN')} / ₹{planned.toLocaleString('en-IN')}
          </span>
          <span
            className="text-xs font-bold"
            style={{ color: over ? '#dc2626' : '#16a34a' }}
          >
            {pct}%
          </span>
        </div>
      </div>
      <Progress
        value={pct}
        className="h-1.5"
        indicatorClassName={over ? '!bg-red-500' : undefined}
        style={{ '--accent': color } as React.CSSProperties}
      />
    </div>
  )
}

/* ── Mock data ───────────────────────────────────────────────── */
const kpis = [
  { label: 'Total Revenue',   value: '₹4,82,600', sub: 'Q2 FY 2025–26', trend: '+18.4%',  trendUp: true,  icon: TrendingUp,   accent: '#4ade80' },
  { label: 'Outstanding',     value: '₹ 31,211',  sub: '4 invoices due', trend: '+3 bills', trendUp: false, icon: AlertCircle,  accent: '#f87171' },
  { label: 'Collected',       value: '₹2,14,390', sub: 'This month',     trend: '+22.1%',  trendUp: true,  icon: CreditCard,   accent: '#60a5fa' },
  { label: 'Vendor Payables', value: '₹ 68,500',  sub: '6 bills pending',trend: '-5.2%',   trendUp: true,  icon: ShoppingCart, accent: '#fbbf24' },
]

const recentInvoices = [
  { id: 'INV-0051', party: 'Nimesh Pathak',   type: 'Customer', amount: '₹ 26,550', date: '02 Sep 2026', status: 'paid'    as const },
  { id: 'INV-0050', party: 'Riya Mehta',       type: 'Customer', amount: '₹  9,800', date: '01 Sep 2026', status: 'due'     as const },
  { id: 'BILL-0019',party: 'Azure Furniture',  type: 'Vendor',   amount: '₹ 41,200', date: '30 Aug 2026', status: 'overdue' as const },
  { id: 'INV-0049', party: 'Suresh Kumar',     type: 'Customer', amount: '₹  4,200', date: '28 Aug 2026', status: 'draft'   as const },
  { id: 'BILL-0018',party: 'Rahul Sharma',     type: 'Vendor',   amount: '₹ 13,300', date: '27 Aug 2026', status: 'paid'    as const },
  { id: 'INV-0048', party: 'Mohit Agarwal',    type: 'Customer', amount: '₹  7,650', date: '25 Aug 2026', status: 'overdue' as const },
]

const revenueData = [42, 38, 56, 61, 48, 72, 68, 84, 79, 96, 88, 104]
const months      = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const budgetLines = [
  { name: 'Sales Revenue', planned: 200000, actual: 172000, color: '#4ade80' },
  { name: 'Operations',    planned: 80000,  actual: 91000,  color: '#f87171' },
  { name: 'Marketing',     planned: 40000,  actual: 28000,  color: '#60a5fa' },
  { name: 'Procurement',   planned: 120000, actual: 96000,  color: '#fbbf24' },
]

const quickActions = [
  { label: 'New Invoice',       to: '/transactions/invoice',        icon: FileText,     accent: '#4ade80' },
  { label: 'Record Payment',    to: '/transactions/payment',        icon: CreditCard,   accent: '#60a5fa' },
  { label: 'New Purchase Order',to: '/transactions/purchase-order', icon: ShoppingCart, accent: '#fbbf24' },
  { label: 'Add Contact',       to: '/master/contacts',             icon: AlertCircle,  accent: '#f472b6' },
]

/* ── Page ────────────────────────────────────────────────────── */
export default function DashboardHome() {
  const { user } = useAuthStore()
  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="db-page">
      {/* Page header */}
      <div className="db-page-header">
        <div>
          <h1 className="db-page-title">
            {greeting}, {user?.name?.split(' ')[0] ?? 'there'} 👋
          </h1>
          <p className="db-page-sub">
            Here's what's happening with Urban Furniture today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Download size={13} /> Export
          </Button>
          <Link to="/transactions/invoice">
            <Button size="sm" className="gap-1.5">
              <Plus size={13} /> New Invoice
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI row */}
      <div className="db-kpi-grid">
        {kpis.map(k => <KpiCard key={k.label} {...k} />)}
      </div>

      {/* Middle row — revenue chart + quick actions */}
      <div className="db-mid-grid">
        {/* Revenue chart */}
        <Card className="db-chart-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-[var(--text)]">
                Revenue Overview
              </CardTitle>
              <select className="text-xs border border-[var(--border-subtle)] bg-[var(--surface-2)] text-[var(--text-muted)] rounded-md px-2 py-1 focus:outline-none">
                <option>FY 2025–26</option>
                <option>FY 2024–25</option>
              </select>
            </div>
          </CardHeader>
          <CardContent className="pt-2 pb-4 px-5">
            {/* Simple bar chart using divs */}
            <div className="flex items-end gap-1.5 h-28">
              {revenueData.map((v, i) => {
                const pct = (v / Math.max(...revenueData)) * 100
                const isLast3 = i >= revenueData.length - 3
                return (
                  <div key={i} className="flex flex-col items-center gap-1 flex-1">
                    <div
                      className="w-full rounded-t-sm transition-all"
                      style={{
                        height: `${pct}%`,
                        background: isLast3 ? 'var(--accent)' : 'var(--surface-2)',
                        border: isLast3 ? '1px solid var(--accent-border)' : '1px solid var(--border-subtle)',
                      }}
                    />
                  </div>
                )
              })}
            </div>
            <div className="flex justify-between mt-1.5">
              {months.map(m => (
                <span key={m} className="text-[9px] text-[var(--text-faint)]">{m}</span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick actions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-[var(--text)]">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 flex flex-col gap-2">
            {quickActions.map(({ label, to, icon: Icon, accent }) => (
              <Link
                key={to}
                to={to}
                className="db-quick-action"
                style={{ '--qa-accent': accent } as React.CSSProperties}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${accent}18`, color: accent }}
                >
                  <Icon size={15} />
                </div>
                <span className="text-sm font-medium text-[var(--text)]">{label}</span>
                <ArrowRight size={14} className="ml-auto text-[var(--text-faint)]" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Bottom row — invoices table + budget */}
      <div className="db-bottom-grid">
        {/* Recent invoices */}
        <Card>
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-[var(--text)]">
                Recent Activity
              </CardTitle>
              <Tabs defaultValue="all">
                <TabsList className="h-7">
                  <TabsTrigger value="all"     className="text-xs px-2 h-5">All</TabsTrigger>
                  <TabsTrigger value="invoices"className="text-xs px-2 h-5">Invoices</TabsTrigger>
                  <TabsTrigger value="bills"   className="text-xs px-2 h-5">Bills</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-5">#</TableHead>
                  <TableHead>Party</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="pr-5" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentInvoices.map(({ id, party, type, amount, date, status }) => (
                  <TableRow key={id}>
                    <TableCell className="pl-5 font-mono text-xs font-semibold text-[var(--accent)]">
                      {id}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-[10px]">{party[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{party}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-[var(--text-muted)]">{type}</span>
                    </TableCell>
                    <TableCell className="text-xs text-[var(--text-muted)]">{date}</TableCell>
                    <TableCell className="font-mono tabular-nums font-semibold">{amount}</TableCell>
                    <TableCell><SPill s={status} /></TableCell>
                    <TableCell className="pr-5">
                      <Link
                        to="/transactions/invoice"
                        className="text-xs text-[var(--accent)] hover:underline"
                      >
                        View
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="p-4 border-t border-[var(--border-subtle)]">
              <Link
                to="/transactions/invoice"
                className="flex items-center justify-center gap-1.5 text-xs font-semibold text-[var(--accent)] hover:underline"
              >
                View all transactions <ArrowRight size={12} />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Budget tracker */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-[var(--text)]">
                Budget Tracker
              </CardTitle>
              <Badge variant="outline" className="text-[10px]">Q2 FY26</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {budgetLines.map(l => <BudgetRow key={l.name} {...l} />)}
            <Link
              to="/reports/budget"
              className="flex items-center justify-center gap-1.5 text-xs font-semibold text-[var(--accent)] hover:underline mt-4"
            >
              View full budget report <ArrowRight size={12} />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
