import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  TrendingUp, TrendingDown, ArrowRight,
  FileText, ShoppingCart, CreditCard, AlertCircle,
  Plus, Download, Loader2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { useAuthStore } from '@/store/useAuthStore'
import { api } from '@/lib/api'

interface PLData   { totalIncome: number; totalExpenses: number; netProfit: number }
interface BSData   { totalAssets: number; totalLiabilities: number; totalCapital: number }
interface BudgetLine { name: string; plannedAmount: number; analyticAccount: string; type: string }
interface Invoice  { id: number; invoiceDate: string; totalAmount: string; customer: { name: string } }

function KpiCard({ label, value, sub, trend, trendUp, icon: Icon, accent }: {
  label: string; value: string; sub: string
  trend: string; trendUp: boolean
  icon: React.ElementType; accent: string
}) {
  return (
    <Card className="db-kpi-card">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1 min-w-0">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-faint)]">{label}</span>
            <span className="text-2xl font-black tracking-tight text-[var(--text)] font-mono tabular-nums leading-none mt-1">{value}</span>
            <span className="text-xs text-[var(--text-muted)] mt-0.5">{sub}</span>
          </div>
          <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${accent}18`, color: accent }}>
            <Icon size={18} />
          </div>
        </div>
        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-[var(--border-subtle)]">
          {trendUp ? <TrendingUp size={13} style={{ color: '#16a34a' }} /> : <TrendingDown size={13} style={{ color: '#dc2626' }} />}
          <span className="text-xs font-semibold" style={{ color: trendUp ? '#16a34a' : '#dc2626' }}>{trend}</span>
          <span className="text-xs text-[var(--text-faint)]">live data</span>
        </div>
      </CardContent>
    </Card>
  )
}

function BudgetRow({ name, planned, color }: { name: string; planned: number; color: string }) {
  return (
    <div className="flex flex-col gap-1.5 py-2 border-b border-[var(--border-subtle)] last:border-0">
      <div className="flex items-center justify-between">
        <span className="text-sm text-[var(--text)]">{name}</span>
        <span className="text-xs text-[var(--text-muted)] font-mono tabular-nums">
          ₹{planned.toLocaleString('en-IN')}
        </span>
      </div>
      <Progress value={60} className="h-1.5" style={{ '--accent': color } as React.CSSProperties} />
    </div>
  )
}

const ACCENT_COLORS = ['#4ade80', '#60a5fa', '#fbbf24', '#f472b6', '#a78bfa']

export default function DashboardHome() {
  const { user } = useAuthStore()
  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening'

  const [pl,       setPl]       = useState<PLData | null>(null)
  const [bs,       setBs]       = useState<BSData | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [budgets,  setBudgets]  = useState<BudgetLine[]>([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    const isStaff = user?.role === 'ADMIN' || user?.role === 'ACCOUNTANT'
    if (!isStaff) { setLoading(false); return }

    Promise.allSettled([
      api.get<PLData>('/reports/profit-loss'),
      api.get<BSData>('/reports/balance-sheet'),
      api.get<{ budgets: BudgetLine[] }>('/reports/budget'),
      api.get<Invoice[]>('/invoices'),
    ]).then(([plRes, bsRes, budgetRes, invRes]) => {
      if (plRes.status     === 'fulfilled') setPl(plRes.value.data)
      if (bsRes.status     === 'fulfilled') setBs(bsRes.value.data)
      if (budgetRes.status === 'fulfilled') setBudgets(budgetRes.value.data.budgets ?? [])
      if (invRes.status    === 'fulfilled') setInvoices((invRes.value.data as unknown as Invoice[]).slice(0, 6))
      setLoading(false)
    })
  }, [user])

  const fmt = (n: number) =>
    '₹' + Math.abs(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })

  if (loading) {
    return (
      <div className="db-page flex items-center justify-center min-h-[60vh]">
        <Loader2 size={28} className="animate-spin text-[var(--accent)]" />
      </div>
    )
  }

  const isStaff = user?.role === 'ADMIN' || user?.role === 'ACCOUNTANT'

  const kpis = isStaff ? [
    { label: 'Total Revenue',  value: fmt(pl?.totalIncome   ?? 0), sub: 'From journal entries',  trend: 'Live',  trendUp: true,  icon: TrendingUp,   accent: '#4ade80' },
    { label: 'Total Expenses', value: fmt(pl?.totalExpenses ?? 0), sub: 'From journal entries',  trend: 'Live',  trendUp: false, icon: AlertCircle,  accent: '#f87171' },
    { label: 'Net Profit',     value: fmt(pl?.netProfit     ?? 0), sub: 'Revenue − Expenses',    trend: 'Live',  trendUp: (pl?.netProfit ?? 0) >= 0, icon: CreditCard, accent: '#60a5fa' },
    { label: 'Total Assets',   value: fmt(bs?.totalAssets   ?? 0), sub: 'Balance sheet',         trend: 'Live',  trendUp: true,  icon: ShoppingCart, accent: '#fbbf24' },
  ] : []

  const quickActions = [
    { label: 'New Invoice',        to: '/transactions/invoice',        icon: FileText,     accent: '#4ade80' },
    { label: 'Record Payment',     to: '/transactions/payment',        icon: CreditCard,   accent: '#60a5fa' },
    { label: 'New Purchase Order', to: '/transactions/purchase-order', icon: ShoppingCart, accent: '#fbbf24' },
    { label: 'Add Contact',        to: '/master/contacts',             icon: AlertCircle,  accent: '#f472b6' },
  ]

  return (
    <div className="db-page">
      <div className="db-page-header">
        <div>
          <h1 className="db-page-title">{greeting}, {user?.name?.split(' ')[0] ?? 'there'} 👋</h1>
          <p className="db-page-sub">Here's what's happening with Urban Furniture today.</p>
        </div>
        {isStaff && (
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
        )}
      </div>

      {isStaff && (
        <>
          <div className="db-kpi-grid">
            {kpis.map(k => <KpiCard key={k.label} {...k} />)}
          </div>

          <div className="db-mid-grid">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-[var(--text)]">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 flex flex-col gap-2">
                {quickActions.map(({ label, to, icon: Icon, accent }) => (
                  <Link key={to} to={to} className="db-quick-action" style={{ '--qa-accent': accent } as React.CSSProperties}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${accent}18`, color: accent }}>
                      <Icon size={15} />
                    </div>
                    <span className="text-sm font-medium text-[var(--text)]">{label}</span>
                    <ArrowRight size={14} className="ml-auto text-[var(--text-faint)]" />
                  </Link>
                ))}
              </CardContent>
            </Card>

            {budgets.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-[var(--text)]">Budget Overview</CardTitle>
                    <Badge variant="outline" className="text-[10px]">Live</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {budgets.slice(0, 5).map((b, i) => (
                    <BudgetRow key={b.name} name={b.name} planned={b.plannedAmount} color={ACCENT_COLORS[i % ACCENT_COLORS.length]} />
                  ))}
                  <Link to="/reports/budget" className="flex items-center justify-center gap-1.5 text-xs font-semibold text-[var(--accent)] hover:underline mt-4">
                    Full budget report <ArrowRight size={12} />
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>

          {invoices.length > 0 && (
            <Card>
              <CardHeader className="pb-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-[var(--text)]">Recent Invoices</CardTitle>
                  <Link to="/transactions/invoice" className="text-xs text-[var(--accent)] hover:underline">View all</Link>
                </div>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-5">#</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="pr-5" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map(inv => (
                      <TableRow key={inv.id}>
                        <TableCell className="pl-5 font-mono text-xs font-semibold text-[var(--accent)]">INV-{String(inv.id).padStart(4, '0')}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-[10px]">{inv.customer?.name?.[0] ?? '?'}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{inv.customer?.name ?? '—'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-[var(--text-muted)]">
                          {new Date(inv.invoiceDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </TableCell>
                        <TableCell className="font-mono tabular-nums font-semibold">
                          ₹{Number(inv.totalAmount).toLocaleString('en-IN')}
                        </TableCell>
                        <TableCell className="pr-5">
                          <Link to="/transactions/invoice" className="text-xs text-[var(--accent)] hover:underline">View</Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {invoices.length === 0 && budgets.length === 0 && (
            <Card>
              <CardContent className="p-10 text-center">
                <p className="text-[var(--text-muted)] text-sm">No data yet. Start by adding master data and recording transactions.</p>
                <div className="flex justify-center gap-3 mt-4">
                  <Link to="/master/contacts"><Button variant="outline" size="sm">Add Contact</Button></Link>
                  <Link to="/master/products"><Button variant="outline" size="sm">Add Product</Button></Link>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {!isStaff && (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText size={32} className="mx-auto mb-3 text-[var(--accent)]" />
            <h2 className="text-base font-semibold text-[var(--text)] mb-1">Your Invoices & Bills</h2>
            <p className="text-sm text-[var(--text-muted)] mb-4">View and pay your outstanding invoices here.</p>
            <Link to="/my-invoices"><Button size="sm">View My Invoices</Button></Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
