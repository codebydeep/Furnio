import { useEffect, useRef } from 'react'
import {
  ShieldCheck, Calculator, BookOpenCheck, DatabaseZap,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLocomotiveScroll } from '@/lib/useLocomotiveScroll'

gsap.registerPlugin(ScrollTrigger)

/* ── data ─────────────────────────────────────────────────── */
const steps = [
  {
    id: 'validate',
    step: '01',
    icon: ShieldCheck,
    title: 'Validate Data',
    accent: '#60a5fa',
    description:
      'Every transaction is validated before recording — required fields, contact existence, product availability, and account mapping are all checked.',
    checks: [
      'Vendor / Customer must exist in Contacts',
      'Product must exist in Product Master',
      'Account must be in Chart of Accounts',
      'Journal must be configured',
    ],
  },
  {
    id: 'tax',
    step: '02',
    icon: Calculator,
    title: 'Compute Tax',
    accent: '#f472b6',
    description:
      'Tax is calculated automatically on Sales Orders and Customer Invoices based on the product and applicable tax rate configured in the system.',
    checks: [
      'Tax rate applied per product line',
      'Subtotal + Tax = Invoice Total',
      'Tax account mapped to Income / Liability',
      'Visible as separate line on invoice',
    ],
  },
  {
    id: 'journal-entry',
    step: '03',
    icon: BookOpenCheck,
    title: 'Create Journal Entry',
    accent: '#fbbf24',
    description:
      'Every financial event — a sale, purchase, or payment — generates a Journal Entry following double-entry accounting. Debits always equal credits.',
    checks: [
      'Cash received → Debit: Cash,  Credit: Debtor',
      'Purchase on credit → Debit: Purchase Exp,  Credit: Creditor',
      'Payment out → Debit: Creditor,  Credit: Bank',
      'Payment in → Debit: Bank,  Credit: Debtor',
    ],
    highlight: true,
  },
  {
    id: 'ledger',
    step: '04',
    icon: DatabaseZap,
    title: 'Update Ledger Balances',
    accent: '#4ade80',
    description:
      'Ledger account balances update in real time after every posted entry. Reports like Balance Sheet and P&L always reflect the current state.',
    checks: [
      'Asset / Liability balances recalculated',
      'Income & Expense totals updated',
      'Capital account adjusted',
      'Reports refreshed immediately',
    ],
  },
]

/* ── debit/credit example rows ────────────────────────────── */
const journalExample = [
  { account: 'Cash (Asset)',            dr: '₹25,000', cr: '—',       side: 'debit' },
  { account: 'Sales Income (Income)',   dr: '—',       cr: '₹25,000', side: 'credit' },
]

/* ── component ─────────────────────────────────────────────── */
export default function SystemEngineSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef  = useRef<HTMLDivElement>(null)
  const stepsRef   = useRef<HTMLDivElement>(null)
  const jeRef      = useRef<HTMLDivElement>(null)
  const { containerRef } = useLocomotiveScroll()

  useEffect(() => {
    if (!sectionRef.current) return

    const scroller = containerRef.current ?? undefined
    const opts     = scroller ? { scroller } : {}
    const triggers: ScrollTrigger[] = []

    // header
    if (headerRef.current) {
      triggers.push(ScrollTrigger.create({
        trigger: headerRef.current,
        start: 'top 83%',
        ...opts,
        onEnter: () => gsap.fromTo(
          headerRef.current!,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.85, ease: 'power3.out' }
        ),
      }))
    }

    // step cards — stagger in
    if (stepsRef.current) {
      const cards = stepsRef.current.querySelectorAll<HTMLElement>('.sys-card')
      triggers.push(ScrollTrigger.create({
        trigger: stepsRef.current,
        start: 'top 78%',
        ...opts,
        onEnter: () => gsap.fromTo(
          cards,
          { opacity: 0, y: 55, scale: 0.96 },
          { opacity: 1, y: 0, scale: 1, duration: 0.72, ease: 'power3.out', stagger: 0.13 }
        ),
      }))

      // connector lines draw in left→right
      const connectors = stepsRef.current.querySelectorAll<HTMLElement>('.sys-connector')
      triggers.push(ScrollTrigger.create({
        trigger: stepsRef.current,
        start: 'top 78%',
        ...opts,
        onEnter: () => gsap.fromTo(
          connectors,
          { scaleX: 0, transformOrigin: 'left center' },
          { scaleX: 1, duration: 0.5, ease: 'power2.inOut', stagger: 0.13, delay: 0.3 }
        ),
      }))

      // step numbers count up
      const nums = stepsRef.current.querySelectorAll<HTMLElement>('.sys-step-num')
      triggers.push(ScrollTrigger.create({
        trigger: stepsRef.current,
        start: 'top 78%',
        ...opts,
        onEnter: () => gsap.fromTo(
          nums,
          { opacity: 0, scale: 0.4 },
          { opacity: 1, scale: 1, duration: 0.45, ease: 'back.out(1.7)', stagger: 0.13, delay: 0.1 }
        ),
      }))
    }

    // journal entry example slides up
    if (jeRef.current) {
      triggers.push(ScrollTrigger.create({
        trigger: jeRef.current,
        start: 'top 82%',
        ...opts,
        onEnter: () => gsap.fromTo(
          jeRef.current!,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
        ),
      }))
    }

    return () => { triggers.forEach(t => t.kill()) }
  }, [containerRef])

  return (
    <section className="sys-section" id="system" ref={sectionRef} data-scroll-section>

      {/* header */}
      <div className="section-header" ref={headerRef} style={{ opacity: 0 }}>
        <Badge variant="outline" className="section-eyebrow">System Engine</Badge>
        <h2 className="section-title">What happens under the hood</h2>
        <p className="section-sub">
          Every transaction you record triggers an automatic 4-step engine —
          validation, tax computation, journal entry creation, and live ledger update.
        </p>
      </div>

      {/* step pipeline */}
      <div className="sys-pipeline" ref={stepsRef}>
        {steps.map(({ id, step, icon: Icon, title, accent, description, checks, highlight }, i) => (
          <div key={id} className="sys-pipeline-slot">

            {/* connector before card (skip first) */}
            {i > 0 && (
              <div className="sys-connector-wrap">
                <div className="sys-connector" style={{ background: accent }} />
              </div>
            )}

            {/* card */}
            <div
              className={`sys-card${highlight ? ' sys-card--highlight' : ''}`}
              style={{ '--sys-accent': accent } as React.CSSProperties}
            >
              {/* top bar */}
              <div className="sys-card-bar" style={{ background: accent }} />

              {/* step number */}
              <div className="sys-step-num" style={{ color: accent, opacity: 0 }}>{step}</div>

              {/* icon + title */}
              <div className="sys-card-head">
                <div className="sys-icon-wrap" style={{ background: `${accent}15`, border: `1px solid ${accent}30` }}>
                  <Icon size={20} style={{ color: accent }} />
                </div>
                <h3 className="sys-title">{title}</h3>
              </div>

              {/* description */}
              <p className="sys-desc">{description}</p>

              {/* checks */}
              <ul className="sys-checks">
                {checks.map(c => (
                  <li key={c} className="sys-check-item">
                    <span className="sys-check-dot" style={{ background: accent }} />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* ── live journal entry example ───────────────────────── */}
      <div className="sys-je-wrap" ref={jeRef} style={{ opacity: 0 }}>
        <div className="sys-je-card">
          <div className="sys-je-head">
            <span className="sys-je-eyebrow">Live Example</span>
            <h4 className="sys-je-title">Cash Sale — Journal Entry</h4>
            <p className="sys-je-sub">Customer pays ₹25,000 cash for 5 Office Chairs</p>
          </div>

          <div className="sys-je-table">
            {/* header row */}
            <div className="sys-je-row sys-je-row--head">
              <span>Account</span>
              <span>Debit (Dr)</span>
              <span>Credit (Cr)</span>
            </div>
            {/* data rows */}
            {journalExample.map(row => (
              <div key={row.account} className={`sys-je-row sys-je-row--${row.side}`}>
                <span className="sys-je-account">{row.account}</span>
                <span className={`sys-je-amount${row.side === 'debit' ? ' sys-je-amount--dr' : ''}`}>
                  {row.dr}
                </span>
                <span className={`sys-je-amount${row.side === 'credit' ? ' sys-je-amount--cr' : ''}`}>
                  {row.cr}
                </span>
              </div>
            ))}
            {/* balance row */}
            <div className="sys-je-row sys-je-row--total">
              <span>Total</span>
              <span className="sys-je-amount--dr">₹25,000</span>
              <span className="sys-je-amount--cr">₹25,000</span>
            </div>
          </div>

          <p className="sys-je-note">
            ✓ Debits = Credits — double-entry principle satisfied automatically
          </p>
        </div>
      </div>

    </section>
  )
}
