import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  UserSquare2, FileSpreadsheet, BookMarked,
  BookOpenCheck, PieChart, ArrowRight,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLocomotiveScroll } from '@/lib/useLocomotiveScroll'

gsap.registerPlugin(ScrollTrigger)

/* ── Status pill (reused inline) ───────────────────────────── */
function Pill({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="md-status-pill"
      style={{ color, background: `${color}18`, borderColor: `${color}30` }}
    >
      {label}
    </span>
  )
}

/* ── Per-card preview widgets ───────────────────────────────── */

/* Contact card preview */
function ContactPreview() {
  return (
    <div className="md-preview">
      {[
        { name: 'Nimesh Pathak',   type: 'Customer', color: '#4ade80' },
        { name: 'Rahul Sharma',    type: 'Vendor',   color: '#60a5fa' },
        { name: 'Azure Furniture', type: 'Both',     color: '#f472b6' },
      ].map(r => (
        <div key={r.name} className="md-prev-row">
          <div className="md-prev-avatar" style={{ background: `${r.color}22`, color: r.color }}>
            {r.name[0]}
          </div>
          <span className="md-prev-name">{r.name}</span>
          <Pill label={r.type} color={r.color} />
        </div>
      ))}
    </div>
  )
}

/* Product/price-list card preview */
function ProductPreview() {
  return (
    <div className="md-preview">
      <div className="md-prev-thead">
        <span>Item</span><span>Sale Price</span><span>Cost</span>
      </div>
      {[
        { name: 'Office Chair', sale: '₹ 4,500', cost: '₹ 2,800' },
        { name: 'Sofa Set',     sale: '₹12,000', cost: '₹ 7,200' },
        { name: 'Dining Table', sale: '₹ 8,200', cost: '₹ 4,900' },
      ].map(r => (
        <div key={r.name} className="md-prev-row md-prev-row--3">
          <span className="md-prev-name">{r.name}</span>
          <span className="md-prev-num md-prev-num--green">{r.sale}</span>
          <span className="md-prev-num">{r.cost}</span>
        </div>
      ))}
    </div>
  )
}

/* Chart of Accounts — ledger account list */
function CoAPreview() {
  return (
    <div className="md-preview">
      {[
        { name: 'Cash A/c',         type: 'Asset',     balance: '₹  82,000', color: '#60a5fa' },
        { name: 'Debtors A/c',      type: 'Asset',     balance: '₹  45,200', color: '#60a5fa' },
        { name: 'Sales Income',     type: 'Income',    balance: '₹1,24,800', color: '#4ade80' },
        { name: 'Purchase Expense', type: 'Expense',   balance: '₹  68,500', color: '#f87171' },
        { name: 'Creditors A/c',    type: 'Liability', balance: '₹  31,000', color: '#fbbf24' },
      ].map(r => (
        <div key={r.name} className="md-prev-row md-prev-row--3">
          <span className="md-prev-name">{r.name}</span>
          <Pill label={r.type} color={r.color} />
          <span className="md-prev-num" style={{ color: r.color }}>{r.balance}</span>
        </div>
      ))}
    </div>
  )
}

/* Journals — entry log */
function JournalPreview() {
  return (
    <div className="md-preview">
      <div className="md-prev-thead"><span>Journal</span><span>Type</span><span>Entries</span></div>
      {[
        { name: 'Sales Journal',    type: 'Sales',    entries: '48', color: '#4ade80' },
        { name: 'Purchase Journal', type: 'Purchase', entries: '31', color: '#f97316' },
        { name: 'Bank Journal',     type: 'Bank',     entries: '62', color: '#60a5fa' },
        { name: 'Cash Journal',     type: 'Cash',     entries: '19', color: '#fbbf24' },
      ].map(r => (
        <div key={r.name} className="md-prev-row md-prev-row--3">
          <span className="md-prev-name">{r.name}</span>
          <Pill label={r.type} color={r.color} />
          <span className="md-prev-num">{r.entries}</span>
        </div>
      ))}
    </div>
  )
}

/* Budget — planned vs actual bar */
function BudgetPreview() {
  const lines = [
    { name: 'Sales Revenue',  planned: 200000, actual: 172000, color: '#4ade80' },
    { name: 'Operations',     planned: 80000,  actual: 91000,  color: '#f87171' },
    { name: 'Marketing',      planned: 40000,  actual: 28000,  color: '#60a5fa' },
  ]
  return (
    <div className="md-preview">
      {lines.map(l => {
        const pct = Math.min(100, Math.round((l.actual / l.planned) * 100))
        const over = l.actual > l.planned
        return (
          <div key={l.name} className="md-prev-budget-row">
            <div className="md-prev-budget-head">
              <span className="md-prev-name">{l.name}</span>
              <span className="md-prev-num" style={{ color: over ? '#f87171' : '#4ade80' }}>
                {pct}%
              </span>
            </div>
            <div className="md-prev-bar-track">
              <div
                className="md-prev-bar-fill"
                style={{ width: `${Math.min(pct, 100)}%`, background: over ? '#f87171' : l.color }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ── Module definitions ─────────────────────────────────────── */
const modules = [
  {
    id: 'contacts',
    icon: UserSquare2,
    title: 'Contact Master',
    accent: '#4ade80',
    tag: 'Module 01',
    description: 'Central directory of all customers and vendors with type classification and address details.',
    fields: ['Name', 'Type (Customer / Vendor / Both)', 'Email & Mobile', 'City, State, Pincode'],
    preview: <ContactPreview />,
    to: '/master/contacts',
  },
  {
    id: 'products',
    icon: FileSpreadsheet,
    title: 'Price List & Products',
    accent: '#60a5fa',
    tag: 'Module 02',
    description: 'Itemised price list for goods and services — sales price, cost price, and category in one place.',
    fields: ['Product Name', 'Type (Goods / Service / Combo)', 'Sales Price', 'Cost Price', 'Category'],
    preview: <ProductPreview />,
    to: '/master/products',
  },
  {
    id: 'coa',
    icon: BookMarked,
    title: 'Chart of Accounts',
    accent: '#f472b6',
    tag: 'Module 03',
    description: 'Master ledger list — every financial transaction maps to an account here.',
    fields: ['Account Name', 'Type (Asset / Liability / Income / Expense / Capital)'],
    preview: <CoAPreview />,
    to: '/master/coa',
  },
  {
    id: 'journals',
    icon: BookOpenCheck,
    title: 'Journals',
    accent: '#fb923c',
    tag: 'Module 04',
    description: 'Groups accounting transactions by activity: sales, purchases, bank, and cash.',
    fields: ['Journal Name', 'Type (Sales / Purchase / Bank / Cash)', 'Default Accounts'],
    preview: <JournalPreview />,
    to: '/master/journals',
  },
  {
    id: 'budget',
    icon: PieChart,
    title: 'Analytic Accounts & Budget',
    accent: '#fbbf24',
    tag: 'Module 05',
    description: 'Set planned amounts per analytic account and track actual vs budget variance in real time.',
    fields: ['Analytic Account Name', 'Type (Income / Expenses)', 'Period', 'Planned Amount'],
    preview: <BudgetPreview />,
    to: '/master/budget',
  },
]

/* ── Section ────────────────────────────────────────────────── */
export default function MasterDataSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef  = useRef<HTMLDivElement>(null)
  const cardsRef   = useRef<HTMLDivElement>(null)
  const { containerRef } = useLocomotiveScroll()

  useEffect(() => {
    if (!sectionRef.current) return
    const scroller = containerRef.current ?? undefined
    const opts = scroller ? { scroller } : {}
    const triggers: ScrollTrigger[] = []

    if (headerRef.current) {
      triggers.push(ScrollTrigger.create({
        trigger: headerRef.current, start: 'top 82%', ...opts,
        onEnter: () => gsap.fromTo(headerRef.current!,
          { opacity: 0, y: 48 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }),
      }))
    }

    if (cardsRef.current) {
      const cards = cardsRef.current.querySelectorAll<HTMLElement>('.md-card')
      triggers.push(ScrollTrigger.create({
        trigger: cardsRef.current, start: 'top 80%', ...opts,
        onEnter: () => gsap.fromTo(cards,
          { opacity: 0, y: 60, scale: 0.97 },
          { opacity: 1, y: 0, scale: 1, duration: 0.75, ease: 'power3.out', stagger: 0.12 }),
      }))
    }

    return () => { triggers.forEach(t => t.kill()) }
  }, [containerRef])

  return (
    <section className="md-section" id="features" ref={sectionRef} data-scroll-section>
      <div className="section-header" ref={headerRef}>
        <Badge variant="outline" className="section-eyebrow">Master Data</Badge>
        <h2 className="section-title">Five ledgers. One source of truth.</h2>
        <p className="section-sub">
          Configure once — every invoice, bill, payment, and journal entry
          flows directly from this structured master data.
        </p>
      </div>

      <div className="md-grid" ref={cardsRef}>
        {modules.map(({ id, icon: Icon, title, accent, tag, description, fields, preview, to }) => (
          <div
            key={id}
            className="md-card"
            style={{ '--md-accent': accent } as React.CSSProperties}
            data-scroll data-scroll-speed="0.4"
          >
            <div className="md-card-bar" />

            {/* Header */}
            <div className="md-card-head">
              <div className="md-icon-wrap" style={{ background: `${accent}15`, border: `1px solid ${accent}30` }}>
                <Icon size={20} style={{ color: accent }} />
              </div>
              <div>
                <span className="md-tag" style={{ color: accent, background: `${accent}12`, borderColor: `${accent}35` }}>
                  {tag}
                </span>
                <h3 className="md-title">{title}</h3>
              </div>
            </div>

            <p className="md-desc">{description}</p>

            {/* ── Live data preview ── */}
            {preview}

            {/* Fields */}
            <div className="md-block">
              <p className="md-block-label">Fields</p>
              <ul className="md-fields">
                {fields.map(f => (
                  <li key={f} className="md-field-item">
                    <span className="md-field-dot" style={{ background: accent }} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <Link to={to} className="md-cta" style={{ '--md-accent': accent } as React.CSSProperties}>
              Open Module <ArrowRight size={13} />
            </Link>
          </div>
        ))}
      </div>
    </section>
  )
}
