import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  ShoppingCart, FileText, CreditCard,
  Package, ClipboardList, Banknote,
  ArrowRight, ChevronRight,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLocomotiveScroll } from '@/lib/useLocomotiveScroll'

gsap.registerPlugin(ScrollTrigger)

/* ── data ────────────────────────────────────────────────────── */
const flows = [
  {
    id: 'purchase',
    label: 'Purchase Flow',
    accent: '#f97316',
    bg: 'rgba(249,115,22,0.07)',
    border: 'rgba(249,115,22,0.18)',
    description: 'Create a Purchase Order from a vendor, receive goods, convert to Vendor Bill, then register payment via Bank or Cash.',
    steps: [
      {
        icon: ShoppingCart,
        title: 'Purchase Order',
        sub: 'Select Vendor, Product, Qty, Unit Price',
        to: '/transactions/purchase-order',
      },
      {
        icon: ClipboardList,
        title: 'Vendor Bill',
        sub: 'Convert PO → Bill · Set invoice & due date',
        to: '/transactions/vendor-bill',
      },
      {
        icon: Banknote,
        title: 'Payment Out',
        sub: 'Register payment via Bank / Cash',
        to: '/transactions/payment',
      },
    ],
  },
  {
    id: 'sales',
    label: 'Sales Flow',
    accent: '#4ade80',
    bg: 'rgba(74,222,128,0.07)',
    border: 'rgba(74,222,128,0.18)',
    description: 'Create a Sales Order for a customer, generate a Customer Invoice from it, then receive payment via Bank or Cash.',
    steps: [
      {
        icon: Package,
        title: 'Sales Order',
        sub: 'Select Customer, Product, Qty, Price, Tax',
        to: '/transactions/sales-order',
      },
      {
        icon: FileText,
        title: 'Customer Invoice',
        sub: 'Generate Invoice from SO · Confirm',
        to: '/transactions/invoice',
      },
      {
        icon: CreditCard,
        title: 'Payment In',
        sub: 'Receive payment via Bank / Cash',
        to: '/transactions/payment',
      },
    ],
  },
]

/* ── sub-components ──────────────────────────────────────────── */
function StepNode({
  icon: Icon,
  title,
  sub,
  to,
  accent,
  index,
}: {
  icon: React.ElementType
  title: string
  sub: string
  to: string
  accent: string
  index: number
}) {
  return (
    <Link
      to={to}
      className="txn-step"
      style={{ '--txn-accent': accent, animationDelay: `${index * 0.15}s` } as React.CSSProperties}
    >
      <div className="txn-step-icon" style={{ background: `${accent}15`, border: `1px solid ${accent}30` }}>
        <Icon size={20} style={{ color: accent }} />
      </div>
      <div className="txn-step-body">
        <p className="txn-step-title">{title}</p>
        <p className="txn-step-sub">{sub}</p>
      </div>
      <div className="txn-step-num" style={{ color: accent }}>
        {String(index + 1).padStart(2, '0')}
      </div>
    </Link>
  )
}

function Arrow({ accent }: { accent: string }) {
  return (
    <div className="txn-arrow">
      <div className="txn-arrow-line" style={{ background: accent }} />
      <ChevronRight size={16} style={{ color: accent }} className="txn-arrow-head" />
    </div>
  )
}

/* ── main component ──────────────────────────────────────────── */
export default function TransactionFlowSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef  = useRef<HTMLDivElement>(null)
  const flowsRef   = useRef<HTMLDivElement>(null)
  const { containerRef } = useLocomotiveScroll()

  useEffect(() => {
    if (!sectionRef.current) return

    const scroller = containerRef.current ?? undefined
    const scrollerOpts = scroller ? { scroller } : {}
    const triggers: ScrollTrigger[] = []

    // header
    if (headerRef.current) {
      triggers.push(ScrollTrigger.create({
        trigger: headerRef.current,
        start: 'top 82%',
        toggleActions: 'play none none none',
        ...scrollerOpts,
        onEnter: () => gsap.fromTo(
          headerRef.current!,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.85, ease: 'power3.out' }
        ),
      }))
    }

    // each flow card slides in from alternating sides
    if (flowsRef.current) {
      const cards = flowsRef.current.querySelectorAll<HTMLElement>('.txn-flow-card')
      cards.forEach((card, i) => {
        triggers.push(ScrollTrigger.create({
          trigger: card,
          start: 'top 80%',
          toggleActions: 'play none none none',
          ...scrollerOpts,
          onEnter: () => gsap.fromTo(
            card,
            { opacity: 0, x: i % 2 === 0 ? -60 : 60 },
            { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out' }
          ),
        }))
      })

      // step nodes stagger
      triggers.push(ScrollTrigger.create({
        trigger: flowsRef.current,
        start: 'top 75%',
        toggleActions: 'play none none none',
        ...scrollerOpts,
        onEnter: () => {
          const steps = flowsRef.current!.querySelectorAll<HTMLElement>('.txn-step')
          gsap.fromTo(
            steps,
            { opacity: 0, y: 28, scale: 0.95 },
            { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: 'power2.out', stagger: 0.1 }
          )
          // arrow lines draw in
          const lines = flowsRef.current!.querySelectorAll<HTMLElement>('.txn-arrow-line')
          gsap.fromTo(
            lines,
            { scaleX: 0, transformOrigin: 'left center' },
            { scaleX: 1, duration: 0.6, ease: 'power2.inOut', stagger: 0.15 }
          )
        },
      }))
    }

    return () => { triggers.forEach(t => t.kill()) }
  }, [containerRef])

  return (
    <section className="txn-section" id="workflow" ref={sectionRef} data-scroll-section>

      {/* header */}
      <div className="section-header" ref={headerRef}>
        <Badge variant="outline" className="section-eyebrow">Transaction Flow</Badge>
        <h2 className="section-title">From order to payment — fully traced</h2>
        <p className="section-sub">
          Every purchase and sale moves through a defined pipeline. Each step
          auto-creates a journal entry so your ledger stays accurate in real time.
        </p>
      </div>

      {/* flows */}
      <div className="txn-flows" ref={flowsRef}>
        {flows.map(({ id, label, accent, bg, border, description, steps }) => (
          <div
            key={id}
            className="txn-flow-card"
            style={{ '--txn-accent': accent, background: bg, borderColor: border } as React.CSSProperties}
          >
            {/* flow label */}
            <div className="txn-flow-head">
              <span className="txn-flow-label" style={{ color: accent, borderColor: `${accent}40`, background: `${accent}10` }}>
                {label}
              </span>
              <p className="txn-flow-desc">{description}</p>
            </div>

            {/* pipeline */}
            <div className="txn-pipeline">
              {steps.map((step, i) => (
                <div key={step.title} className="txn-pipeline-slot">
                  <StepNode {...step} accent={accent} index={i} />
                  {i < steps.length - 1 && <Arrow accent={accent} />}
                </div>
              ))}
            </div>

            {/* bottom journal entry note */}
            <div className="txn-je-note" style={{ borderColor: `${accent}25`, background: `${accent}06` }}>
              <ArrowRight size={12} style={{ color: accent, flexShrink: 0 }} />
              <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '12px' }}>
                Each step auto-generates a <strong style={{ color: accent }}>double-entry journal record</strong> — debits and credits balanced automatically.
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
