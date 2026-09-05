import { ArrowRight, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useScrollLink } from '@/lib/useScrollLink'

/* ── Status pill ────────────────────────────────────────────── */
function StatusPill({ status }: { status: 'paid' | 'overdue' | 'draft' | 'posted' }) {
  const map = {
    paid:    { label: 'Paid',    cls: 'pill--paid'    },
    overdue: { label: 'Overdue', cls: 'pill--overdue' },
    draft:   { label: 'Draft',   cls: 'pill--draft'   },
    posted:  { label: 'Posted',  cls: 'pill--posted'  },
  }
  const { label, cls } = map[status]
  return <span className={`status-pill ${cls}`}>{label}</span>
}

/* ── Floating invoice card ──────────────────────────────────── */
function InvoiceFloat({
  invNo, party, amount, status, style, delay,
}: {
  invNo: string; party: string; amount: string
  status: 'paid' | 'overdue' | 'draft'
  style: React.CSSProperties; delay: string
}) {
  return (
    <div className="floating-invoice" style={{ ...style, animationDelay: delay } as React.CSSProperties}>
      <div className="fi-row">
        <span className="fi-inv">{invNo}</span>
        <StatusPill status={status} />
      </div>
      <div className="fi-party">{party}</div>
      <div className="fi-amount">₹ {amount}</div>
    </div>
  )
}

/* ── Floating journal entry snippet ────────────────────────── */
function JournalFloat({ style, delay }: { style: React.CSSProperties; delay: string }) {
  return (
    <div className="floating-je" style={{ ...style, animationDelay: delay } as React.CSSProperties}>
      <div className="fje-head">Journal Entry · JE-0042</div>
      <table className="fje-table">
        <thead>
          <tr><th>Account</th><th>Dr</th><th>Cr</th></tr>
        </thead>
        <tbody>
          <tr>
            <td>Bank A/c</td>
            <td className="fje-dr">25,000</td>
            <td className="fje-neutral">—</td>
          </tr>
          <tr>
            <td>Sales Income</td>
            <td className="fje-neutral">—</td>
            <td className="fje-cr">25,000</td>
          </tr>
        </tbody>
      </table>
      <div className="fje-note">✓ Balanced · Double-entry</div>
    </div>
  )
}

/* ── Hero bottom cards — ledger / invoice / report previews ── */
const heroCards = [
  {
    accent: '#f97316',
    rotate: '-3deg', raise: '14px',
    tag: 'Vendor Bill',
    icon: '📄',
    title: 'BILL-0018',
    rows: [
      { desc: 'Wooden Chairs ×10', amt: '₹ 12,500' },
      { desc: 'Delivery charges',   amt: '₹    800' },
    ],
    total: '₹ 13,300',
    status: 'overdue' as const,
    cta: false,
  },
  {
    accent: '#3b82f6',
    rotate: '0deg', raise: '0px',
    tag: 'Customer Invoice',
    icon: '🧾',
    title: 'INV-0047',
    rows: [
      { desc: 'Office Chair ×5',    amt: '₹ 22,500' },
      { desc: 'GST 18%',            amt: '₹  4,050' },
    ],
    total: '₹ 26,550',
    status: 'paid' as const,
    cta: true,
  },
  {
    accent: '#8b5cf6',
    rotate: '3deg', raise: '14px',
    tag: 'Balance Sheet',
    icon: '📊',
    title: 'FY 2025–26',
    rows: [
      { desc: 'Total Assets',       amt: '₹ 4,82,000' },
      { desc: 'Total Liabilities',  amt: '₹ 1,90,000' },
    ],
    total: '₹ 2,92,000',
    status: 'posted' as const,
    cta: false,
  },
]

function HeroBottomCards() {
  return (
    <div className="hero-cards">
      {heroCards.map(({ accent, rotate, raise, tag, icon, title, rows, total, status, cta }) => (
        <div
          key={title}
          className="bottom-card"
          style={{ transform: `rotate(${rotate}) translateY(${raise})`, '--card-accent': accent } as React.CSSProperties}
        >
          {/* Card header */}
          <div className="bc-head">
            <span className="bc-icon">{icon}</span>
            <div>
              <span className="bottom-card-tag">{tag}</span>
              <p className="bottom-card-title">{title}</p>
            </div>
            <StatusPill status={status} />
          </div>

          {/* Line items */}
          <div className="bc-lines">
            {rows.map(r => (
              <div key={r.desc} className="bc-line">
                <span className="bc-line-desc">{r.desc}</span>
                <span className="bc-line-amt">{r.amt}</span>
              </div>
            ))}
            <div className="bc-total-row">
              <span>Total</span>
              <span className="bc-total-amt">{total}</span>
            </div>
          </div>

          {cta && (
            <Link to="/register" className="bottom-card-cta-btn">
              Open UrbanBooks <ArrowRight size={11} />
            </Link>
          )}
        </div>
      ))}
    </div>
  )
}

/* ── Main section ───────────────────────────────────────────── */
export default function HeroSection() {
  const scrollToActors = useScrollLink('actors')

  return (
    <section className="hero" id="home">
      <Badge variant="outline" className="hero-badge">
        <span className="hero-badge-icon" />
        Odoo Hackathon — Urban Furniture Accounting
      </Badge>

      <h1 className="hero-headline">
        Double-entry accounting,
        <br />
        <em>built for furniture.</em>
      </h1>

      <p className="hero-sub">
        Invoices, vendor bills, ledgers, and financial reports — all connected
        in one system. Every rupee tracked, every entry balanced.
      </p>

      <div className="hero-actions">
        <Link to="/register">
          <Button size="lg" className="rounded-full bg-white text-black hover:bg-white/90 px-8 gap-2 font-semibold">
            Start Free Trial <ArrowRight size={16} />
          </Button>
        </Link>
        <a href="#actors" onClick={scrollToActors}>
          <Button size="lg" variant="outline" className="rounded-full border-white/20 text-white hover:bg-white/10 px-8 gap-2">
            <TrendingUp size={15} /> See How It Works
          </Button>
        </a>
      </div>

      {/* Floating invoice snippets */}
      <InvoiceFloat
        invNo="INV-0041" party="Nimesh Pathak"
        amount="18,900" status="paid"
        style={{ top: '22%', left: '4%' }} delay="0s"
      />
      <InvoiceFloat
        invNo="BILL-0016" party="Azure Furniture"
        amount="52,400" status="overdue"
        style={{ top: '52%', left: '3%' }} delay="1.4s"
      />

      {/* Floating journal entry */}
      <JournalFloat style={{ top: '26%', right: '3%' }} delay="0.7s" />

      {/* Floating P&L snippet */}
      <div
        className="floating-pl"
        style={{ top: '56%', right: '4%', animationDelay: '2s' } as React.CSSProperties}
      >
        <div className="fpl-label">Net Profit · Q2 FY26</div>
        <div className="fpl-amount">₹ 1,24,800</div>
        <div className="fpl-change">
          <TrendingUp size={11} style={{ color: '#4ade80' }} />
          <span style={{ color: '#4ade80' }}>+14.2% vs Q1</span>
        </div>
      </div>

      <HeroBottomCards />
    </section>
  )
}
