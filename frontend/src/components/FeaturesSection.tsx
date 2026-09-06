import { useState, useRef } from 'react'
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
import { useTheme } from '@/lib/useTheme'

const features = [
  {
    icon: FileText,
    title: 'Smart Invoicing',
    desc: 'Generate, send, and track customer invoices automatically. GST-ready templates with one-click PDF export.',
    accent: '#ff5500',
    tag: 'Invoice',
  },
  {
    icon: Wallet,
    title: 'Payslip Management',
    desc: 'Create and distribute payslips for every pay period. Salary components, deductions, and net pay — all automated.',
    accent: '#fb923c',
    tag: 'Payslip',
  },
  {
    icon: BarChart3,
    title: 'Financial Reports',
    desc: 'Balance Sheet, Profit & Loss, and Budget Reports generated in real time with drill-down capability.',
    accent: '#f97316',
    tag: 'Reports',
  },
  {
    icon: Receipt,
    title: 'Vendor Bills',
    desc: 'Capture vendor bills, match them to purchase orders, and schedule payments without manual reconciliation.',
    accent: '#ff6a1a',
    tag: 'Purchase',
  },
  {
    icon: ShoppingCart,
    title: 'Sales & Purchase Orders',
    desc: 'Create orders and convert them into invoices or vendor bills in a single click.',
    accent: '#ea580c',
    tag: 'Transactions',
  },
  {
    icon: BookOpen,
    title: 'Chart of Accounts',
    desc: 'Define ledger accounts — Assets, Liabilities, Income, Expenses — and keep every entry balanced.',
    accent: '#fb923c',
    tag: 'Accounting',
  },
  {
    icon: TrendingUp,
    title: 'Budget Tracking',
    desc: 'Set analytic accounts, define budgets by period, and monitor planned vs actual spend live.',
    accent: '#ff5500',
    tag: 'Budget',
  },
  {
    icon: Users,
    title: 'Contact Master',
    desc: 'Unified directory for customers and vendors with role-based access and full transaction history.',
    accent: '#fdba74',
    tag: 'Master Data',
  },
]

function SpotlightCard({
  icon: Icon,
  title,
  desc,
  accent,
  tag,
}: {
  icon: any
  title: string
  desc: string
  accent: string
  tag: string
}) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const cardRef = useRef<HTMLDivElement>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="lp-feat-card relative group transition-all duration-300 overflow-hidden"
      style={{
        background: isDark ? '#090b0e' : '#ffffff',
        border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
        boxShadow: isDark ? 'none' : '0 4px 20px rgba(0, 0, 0, 0.04)',
      }}
    >
      {/* ── Dynamic Radial Spotlight Glow beneath cursor ── */}
      <div
        className="pointer-events-none absolute -inset-px rounded-xl transition-opacity duration-300 z-10"
        style={{
          opacity: isHovered ? 1 : 0,
          background: isDark
            ? `radial-gradient(280px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255, 85, 0, 0.16), transparent 80%)`
            : `radial-gradient(280px circle at ${mousePos.x}px ${mousePos.y}px, rgba(234, 88, 12, 0.10), transparent 80%)`,
        }}
      />

      {/* ── Glowing Border Ring under Cursor ── */}
      <div
        className="pointer-events-none absolute -inset-px rounded-xl transition-opacity duration-300 z-10"
        style={{
          opacity: isHovered ? 1 : 0,
          background: isDark
            ? `radial-gradient(200px circle at ${mousePos.x}px ${mousePos.y}px, rgba(251, 146, 60, 0.45), transparent 75%)`
            : `radial-gradient(200px circle at ${mousePos.x}px ${mousePos.y}px, rgba(234, 88, 12, 0.35), transparent 75%)`,
          maskImage: 'linear-gradient(black, black) content-box, linear-gradient(black, black)',
          WebkitMaskImage: 'linear-gradient(black, black) content-box, linear-gradient(black, black)',
          maskComposite: 'exclude',
          WebkitMaskComposite: 'xor',
          padding: '1px',
        }}
      />

      {/* top accent line */}
      <div className="lp-feat-bar relative z-20" style={{ background: accent }} />

      {/* icon */}
      <div
        className="lp-feat-icon relative z-20"
        style={{ background: `${accent}18`, border: `1px solid ${accent}35` }}
      >
        <Icon size={18} style={{ color: accent }} />
      </div>

      {/* copy */}
      <div className="lp-feat-tag relative z-20" style={{ color: accent, borderColor: `${accent}40` }}>
        {tag}
      </div>
      <h3 className="lp-feat-title relative z-20">{title}</h3>
      <p className="lp-feat-desc relative z-20">{desc}</p>
    </div>
  )
}

export default function FeaturesSection() {
  return (
    <section className="lp-features-section relative" id="features">
      {/* ── Luminous Horizon Divider connecting Hero and Features ── */}
      <div className="relative w-full max-w-4xl mx-auto mb-16 flex items-center justify-center">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-orange-500/40 to-transparent" />
        <div className="absolute w-1/2 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent blur-[3px]" />
        <div className="absolute w-2 h-2 rounded-full bg-orange-400 shadow-[0_0_15px_#ff5500]" />
      </div>

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
        {features.map((feat) => (
          <SpotlightCard key={feat.title} {...feat} />
        ))}
      </div>
    </section>
  )
}
