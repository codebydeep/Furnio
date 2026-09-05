import { ArrowRight, Sparkles } from 'lucide-react'
import FloatingLabel from '@/components/FloatingLabel'
import BottomCard from '@/components/BottomCard'
import { Button } from './ui/button'
import { Badge } from './ui/badge'

export default function HeroSection() {
  return (
    <section className="hero">
      {/* Badge */}
      <Badge variant="outline" className="hero-badge">
        <span className="hero-badge-icon" />
        Odoo Hackathon — Urban Furniture
      </Badge>

      {/* Headline */}
      <h1 className="hero-headline">
        Smart Accounting for
        <br />
        <em>Urban Furniture</em>
      </h1>

      {/* Sub */}
      <p className="hero-sub">
        A complete end-to-end accounting system — manage contacts, products,
        journals, record sales &amp; purchases, and generate real-time financial
        reports, all in one place.
      </p>

      {/* CTAs */}
      <div className="hero-actions">
        <Button
          size="lg"
          className="rounded-full bg-white text-black hover:bg-white/90 px-8 gap-2 font-semibold"
        >
          Get Started <ArrowRight size={16} />
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="rounded-full border-white/20 text-white hover:bg-white/10 px-8 gap-2"
        >
          <Sparkles size={15} /> View Demo
        </Button>
      </div>

      {/* Floating labels — contacts from the problem statement */}
      <FloatingLabel
        name="Nimesh Pathak"
        color="#4ade80"
        style={{ top: '26%', left: '6%' }}
      />
      <FloatingLabel
        name="Azure Furniture"
        color="#60a5fa"
        style={{ top: '46%', right: '6%' }}
      />
      <FloatingLabel
        name="Rahul Sharma"
        color="#f472b6"
        style={{ top: '64%', left: '10%' }}
      />
      <FloatingLabel
        name="Balance Sheet ✓"
        color="#fbbf24"
        style={{ top: '32%', right: '9%' }}
      />

      {/* Bottom cards */}
      <div className="hero-cards">
        <BottomCard
          title="Purchase Orders"
          subtitle="Vendor bills &amp; POs"
          accent="#f97316"
          emoji="📦"
          tag="Purchase"
          style={{ transform: 'rotate(-3deg) translateY(12px)' }}
        />
        <BottomCard
          title="UrbanBooks"
          subtitle="Full accounting suite"
          accent="#3b82f6"
          cta
          emoji="🪑"
          tag="Core"
        />
        <BottomCard
          title="Financial Reports"
          subtitle="P&amp;L · Balance Sheet · Budget"
          accent="#8b5cf6"
          emoji="📊"
          tag="Reports"
          style={{ transform: 'rotate(3deg) translateY(12px)' }}
        />
      </div>
    </section>
  )
}
