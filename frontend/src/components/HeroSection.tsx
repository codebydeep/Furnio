import { ArrowRight, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useScrollLink } from '@/lib/useScrollLink'
import FurnioDashboardPreview from './FurnioDashboardPreview'

export default function HeroSection() {
  const scrollToFeatures = useScrollLink('features')

  return (
    <section className="relative min-h-screen pt-28 pb-20 px-4 sm:px-6 flex flex-col items-center justify-start text-center overflow-hidden bg-[#06040f]" id="home">
      {/* ── Background Grid (matching Image 1) ────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.07) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 25%, black 20%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 25%, black 20%, transparent 80%)',
        }}
      />

      {/* ── Atmospheric Nebula Glow (matching Image 1) ────────────── */}
      <div className="absolute top-[-50px] left-1/2 -translate-x-1/2 w-[900px] h-[550px] pointer-events-none">
        <div className="w-full h-full bg-radial-[circle_at_center] from-purple-600/30 via-indigo-600/15 to-transparent blur-3xl" />
      </div>

      {/* ── Curved Planetary Horizon Arc (matching Image 1) ──────── */}
      <div className="absolute top-[140px] sm:top-[160px] left-1/2 -translate-x-1/2 w-[1300px] sm:w-[1500px] h-[650px] pointer-events-none overflow-hidden z-0">
        <div
          className="w-full h-full rounded-[100%] border-t-[2px] border-purple-300/80"
          style={{
            boxShadow:
              '0 -15px 50px rgba(168, 85, 247, 0.75), 0 -2px 25px rgba(255, 255, 255, 0.95), inset 0 10px 40px rgba(147, 51, 234, 0.35)',
          }}
        />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[220px] bg-purple-500/25 blur-[80px] rounded-full" />
      </div>

      {/* ── Hero Text Container (ui-hero-text strictly preserved) ── */}
      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
        {/* Badge - EXACT original text */}
        <Badge
          variant="outline"
          className="hero-badge inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-blue-500/10 border border-blue-500/30 text-blue-400 backdrop-blur-md shadow-[0_0_20px_rgba(59,130,246,0.25)] mb-6"
        >
          <span className="hero-badge-icon w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6] animate-pulse" />
          Odoo Hackathon — Urban Furniture Accounting
        </Badge>

        {/* Headline - EXACT original text */}
        <h1 className="hero-headline text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.08] mb-6">
          Double-entry accounting,
          <br />
          <em className="font-serif italic font-bold not-italic block mt-1 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-300 drop-shadow-[0_0_30px_rgba(99,102,241,0.35)]">
            built for furniture.
          </em>
        </h1>

        {/* Subtitle - EXACT original text */}
        <p className="hero-sub text-base sm:text-lg text-neutral-300/80 max-w-2xl mx-auto leading-relaxed mb-8">
          Invoices, vendor bills, ledgers, and financial reports — all connected
          in one system. Every rupee tracked, every entry balanced.
        </p>

        {/* Hero Actions (electric blue CTA matching Image 1) */}
        <div className="hero-actions flex flex-wrap items-center justify-center gap-3.5 mb-14">
          <Link to="/register">
            <Button
              size="lg"
              className="rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3 h-auto gap-2 shadow-[0_0_30px_rgba(59,130,246,0.55)] border-0 transition-all hover:scale-[1.02] cursor-pointer"
            >
              Start Free Trial <ArrowRight size={16} />
            </Button>
          </Link>
          <a href="#features" onClick={scrollToFeatures}>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full border-white/20 bg-white/[0.04] text-white hover:bg-white/10 hover:text-white px-8 py-3 h-auto gap-2 backdrop-blur-md transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Sparkles size={15} className="text-blue-400" /> Book a Demo
            </Button>
          </a>
        </div>
      </div>

      {/* ── FurNio's Own Dashboard Preview (below UI text, matching Image 1 & 2) ── */}
      <FurnioDashboardPreview />
    </section>
  )
}
