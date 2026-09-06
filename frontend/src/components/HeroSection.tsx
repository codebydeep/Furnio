import { ArrowRight, Play, Feather, Zap, Hexagon, Box } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useScrollLink } from '@/lib/useScrollLink'
import { useTheme } from '@/lib/useTheme'
import FinanceDashboardPreview from './FinanceDashboardPreview'

export default function HeroSection() {
  const scrollToFeatures = useScrollLink('features')
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <section
      className="relative min-h-screen pt-32 pb-24 px-4 sm:px-6 flex flex-col items-center justify-start text-center overflow-hidden bg-[var(--lp-bg)] text-[var(--lp-text)] transition-colors duration-300"
      id="home"
    >
      {/* ── Subtle Star Dust / Sparkles in the dark sky ── */}
      <div className={`absolute inset-0 pointer-events-none z-0 transition-opacity duration-300 ${isDark ? 'opacity-100' : 'opacity-0'}`}>
        <div className="absolute top-[18%] left-[22%] w-1 h-1 bg-white/40 rounded-full blur-[0.5px]" />
        <div className="absolute top-[28%] left-[78%] w-1 h-1 bg-white/50 rounded-full blur-[0.5px]" />
        <div className="absolute top-[14%] right-[30%] w-1.5 h-1.5 bg-orange-400/50 rounded-full blur-[1px]" />
        <div className="absolute top-[35%] left-[15%] w-1 h-1 bg-white/30 rounded-full" />
        <div className="absolute top-[40%] right-[18%] w-1 h-1 bg-amber-300/40 rounded-full" />
        <div className="absolute top-[22%] right-[12%] w-1 h-1 bg-white/40 rounded-full" />
        <div className="absolute top-[30%] left-[34%] w-1 h-1 bg-white/35 rounded-full" />
      </div>

      {/* ── Hero Text Container (matching reference image) ── */}
      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
        {/* Pill Badge matching reference image */}
        <div className="inline-flex items-center gap-2 pl-4 pr-1.5 py-1.5 rounded-full bg-neutral-100 dark:bg-white/[0.05] border border-neutral-200 dark:border-white/10 backdrop-blur-md mb-8 hover:border-orange-500/40 transition-colors cursor-pointer group shadow-sm dark:shadow-[0_0_20px_rgba(0,0,0,0.6)]">
          <span className="text-neutral-700 dark:text-neutral-300 font-medium text-xs sm:text-sm">
            New version is out! Read more
          </span>
          <span className="w-5 h-5 rounded-full bg-[#ff5500] text-white flex items-center justify-center group-hover:translate-x-0.5 transition-transform shadow-[0_0_12px_rgba(255,85,0,0.6)]">
            <ArrowRight size={12} strokeWidth={2.5} />
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-[68px] font-extrabold text-neutral-900 dark:text-white tracking-tight leading-[1.14] mb-6 drop-shadow-sm dark:drop-shadow-[0_4px_30px_rgba(0,0,0,0.9)]">
          From Purchase 🧾<br className="hidden sm:inline" />
          {' '}to Payment, Every<br className="hidden sm:inline" />
          {' '}Entry Balances Itself.
        </h1>

        {/* Subtitle */}
        <p className="text-neutral-600 dark:text-neutral-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed mb-10">
          A retailer selling dining tables or a vendor supplying office chairs — the same double-entry engine handles it all, with real-time reports.
        </p>

        {/* Action Buttons (Watch Demo and Get started for free) */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-8 relative z-10">
          <a href="#features" onClick={scrollToFeatures}>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full border-neutral-300 dark:border-white/15 bg-white dark:bg-white/[0.06] text-neutral-900 dark:text-white hover:bg-neutral-100 dark:hover:bg-white/10 hover:text-neutral-900 dark:hover:text-white px-7 py-3.5 h-auto gap-2.5 backdrop-blur-md transition-all hover:scale-[1.02] cursor-pointer font-medium text-sm shadow-sm"
            >
              <Play size={14} className="fill-neutral-900 dark:fill-white text-neutral-900 dark:text-white" />
              Watch Demo
            </Button>
          </a>

          <Link to="/register">
            <Button
              size="lg"
              className="rounded-full bg-[#ff5500] hover:bg-[#ff6a1a] text-white font-semibold text-sm px-8 py-3.5 h-auto shadow-[0_0_35px_rgba(255,85,0,0.5)] border-0 transition-all hover:scale-[1.02] cursor-pointer"
            >
              Get started for free
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Giant Curved Planet Horizon / Dome ("the circle type" matching reference image) ── */}
      <div className="relative w-full overflow-hidden mt-4 mb-10">
        {/* Atmospheric glow behind/above the curved rim */}
        <div
          className="absolute -top-12 left-1/2 -translate-x-1/2 w-[1100px] h-[280px] pointer-events-none"
          style={{
            background: isDark
              ? 'radial-gradient(ellipse 55% 45% at 50% 100%, rgba(255,85,0,0.48) 0%, rgba(234,88,12,0.18) 50%, transparent 80%)'
              : 'radial-gradient(ellipse 55% 45% at 50% 100%, rgba(255,85,0,0.22) 0%, rgba(234,88,12,0.08) 50%, transparent 80%)',
          }}
        />

        {/* Subtle vertical ray lines radiating upwards from horizon */}
        <div
          className="absolute -top-10 left-1/2 -translate-x-1/2 w-[1200px] h-[240px] pointer-events-none opacity-25"
          style={{
            backgroundImage:
              'repeating-linear-gradient(90deg, rgba(251,146,60,0.4) 0px, transparent 2px, transparent 24px)',
            maskImage: 'radial-gradient(ellipse 70% 50% at 50% 100%, black 20%, transparent 85%)',
            WebkitMaskImage:
              'radial-gradient(ellipse 70% 50% at 50% 100%, black 20%, transparent 85%)',
          }}
        />

        {/* The Planet / Circle Dome Arc */}
        <div
          className="relative w-[130%] -left-[15%] pt-14 pb-12 rounded-t-[100%] border-t flex flex-col items-center justify-start text-center transition-all duration-300"
          style={{
            background: isDark
              ? 'linear-gradient(180deg, rgba(255,85,0,0.24) 0%, rgba(26,10,3,0.96) 25%, rgba(0,0,0,0.98) 100%)'
              : 'linear-gradient(180deg, rgba(255,85,0,0.14) 0%, rgba(255,247,237,0.95) 28%, #ffffff 100%)',
            boxShadow: isDark
              ? '0 -20px 65px rgba(255,85,0,0.4), inset 0 25px 65px rgba(255,85,0,0.2)'
              : '0 -15px 50px rgba(255,85,0,0.15), inset 0 20px 40px rgba(255,85,0,0.08)',
            borderColor: isDark ? 'rgba(255,85,0,0.7)' : 'rgba(234,88,12,0.35)',
          }}
        >
          {/* Horizon Neon Beam Line */}
          <div className="absolute top-0 left-1/4 right-1/4 h-[1.5px] bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_25px_#ff5500]" />

          {/* Trusted By 200+ Companies */}
          <div className="relative z-10 max-w-4xl mx-auto px-4 mt-1">
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 font-medium tracking-wider mb-8">
              Trusted by 200+ companies
            </p>

            {/* Brand Logos */}
            <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 text-neutral-600 dark:text-neutral-400 font-semibold text-sm sm:text-base">
              {/* FeatherDev */}
              <div className="flex items-center gap-2 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer">
                <Feather size={18} />
                <span className="tracking-tight">FeatherDev</span>
              </div>

              {/* Boltshift */}
              <div className="flex items-center gap-2 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer">
                <div className="w-5 h-5 rounded-full border border-neutral-400 dark:border-neutral-500 flex items-center justify-center">
                  <Zap size={11} className="fill-current" />
                </div>
                <span className="tracking-tight">Boltshift</span>
              </div>

              {/* GlobalBank */}
              <div className="flex items-center gap-2 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer">
                <Hexagon size={18} />
                <span className="tracking-tight">GlobalBank</span>
              </div>

              {/* Lightbox */}
              <div className="flex items-center gap-2 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer">
                <Box size={18} />
                <span className="tracking-tight">Lightbox</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Dashboard Preview (below UI text, matching reference image) ── */}
      <FinanceDashboardPreview />
    </section>
  )
}
