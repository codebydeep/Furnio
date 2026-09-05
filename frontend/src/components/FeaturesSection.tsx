import {
  FileText,
  Wallet,
  BarChart3,
  Receipt,
  ShoppingCart,
  BookOpen,
  TrendingUp,
  Users,
} from 'lucide-react'

const features = [
  {
    icon: FileText,
    title: 'Smart Invoicing',
    desc: 'Generate, send, and track customer invoices automatically. GST-ready templates with one-click PDF export.',
    accent: '#a78bfa',
    tag: 'Invoice',
  },
  {
    icon: Wallet,
    title: 'Payslip Management',
    desc: 'Create and distribute payslips for every pay period. Salary components, deductions, and net pay — all automated.',
    accent: '#60a5fa',
    tag: 'Payslip',
  },
  {
    icon: BarChart3,
    title: 'Financial Reports',
    desc: 'Balance Sheet, Profit & Loss, and Budget Reports generated in real time with drill-down capability.',
    accent: '#38bdf8',
    tag: 'Reports',
  },
  {
    icon: Receipt,
    title: 'Vendor Bills',
    desc: 'Capture vendor bills, match them to purchase orders, and schedule payments without manual reconciliation.',
    accent: '#fb923c',
    tag: 'Purchase',
  },
  {
    icon: ShoppingCart,
    title: 'Sales & Purchase Orders',
    desc: 'Create orders and convert them into invoices or vendor bills in a single click.',
    accent: '#f472b6',
    tag: 'Transactions',
  },
  {
    icon: BookOpen,
    title: 'Chart of Accounts',
    desc: 'Define ledger accounts — Assets, Liabilities, Income, Expenses — and keep every entry balanced.',
    accent: '#fbbf24',
    tag: 'Accounting',
  },
  {
    icon: TrendingUp,
    title: 'Budget Tracking',
    desc: 'Set analytic accounts, define budgets by period, and monitor planned vs actual spend live.',
    accent: '#6366f1',
    tag: 'Budget',
  },
  {
    icon: Users,
    title: 'Contact Master',
    desc: 'Unified directory for customers and vendors with role-based access and full transaction history.',
    accent: '#f87171',
    tag: 'Master Data',
  },
]

export default function FeaturesSection() {
  return (
    <section className="lp-features-section" id="features">
      {/* section header */}
      <div className="lp-section-header">
        <span className="lp-section-eyebrow">Everything You Need</span>
        <h2 className="lp-section-title">Built for the full accounting workflow</h2>
        <p className="lp-section-sub">
          From smart invoicing and payslips to real-time financial reports — every module
          connects seamlessly so nothing falls through the cracks.
        </p>
      </div>

      {/* grid */}
      <div className="lp-features-grid">
        {features.map(({ icon: Icon, title, desc, accent, tag }) => (
          <div key={title} className="lp-feat-card">
            {/* top accent line */}
            <div className="lp-feat-bar" style={{ background: accent }} />

            {/* icon */}
            <div
              className="lp-feat-icon"
              style={{ background: `${accent}18`, border: `1px solid ${accent}30` }}
            >
              <Icon size={18} style={{ color: accent }} />
            </div>

            {/* copy */}
            <div className="lp-feat-tag" style={{ color: accent, borderColor: `${accent}40` }}>
              {tag}
            </div>
            <h3 className="lp-feat-title">{title}</h3>
            <p className="lp-feat-desc">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
