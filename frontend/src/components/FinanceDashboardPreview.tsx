import { useState, useEffect, useRef } from 'react'
import {
  LayoutDashboard,
  TrendingUp,
  Search,
  Bell,
  Clock,
  ChevronDown,
  CreditCard,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Sparkles,
  ExternalLink,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTheme } from '@/lib/useTheme'

export default function FinanceDashboardPreview() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [activeTab, setActiveTab] = useState('Overview')
  const [scrollProgress, setScrollProgress] = useState(0)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  // ── Scroll Animation: 3D perspective tilt & lighting progress ──
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      // Progress moves from 0 to 1 over first 450px of scroll
      const progress = Math.min(Math.max(scrollY / 450, 0), 1)
      setScrollProgress(progress)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // ── Mouse movement parallax ──
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    setMousePos({ x, y })
  }

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 })
  }

  // 3D perspective rotation: tilts forward at top, flattens to 0 as you scroll down
  const rotateX = (1 - scrollProgress) * 14 + mousePos.y * -6
  const rotateY = mousePos.x * 6
  const scale = 0.93 + scrollProgress * 0.07
  const translateY = (1 - scrollProgress) * 25

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-6xl mx-auto z-20 group perspective-[1200px]"
    >
      {/* ── Outer Shell with 3D Tilt & Scroll Lighting ── */}
      <div
        className="relative rounded-2xl overflow-hidden border border-neutral-200/90 dark:border-white/[0.14] bg-white/95 dark:bg-[#07080c]/95 backdrop-blur-2xl transition-all duration-200 ease-out will-change-transform"
        style={{
          transform: `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale}) translateY(${translateY}px)`,
          boxShadow: isDark
            ? `0 35px 120px rgba(0,0,0,0.95), 0 0 ${40 + scrollProgress * 50}px rgba(255,85,0,${0.12 + scrollProgress * 0.22}), 0 -10px 40px rgba(255,85,0,${0.08 + scrollProgress * 0.16})`
            : `0 25px 70px rgba(0,0,0,0.12), 0 0 ${30 + scrollProgress * 40}px rgba(255,85,0,${0.10 + scrollProgress * 0.15}), 0 4px 20px rgba(0,0,0,0.06)`,
        }}
      >
        {/* ── Scroll-Linked Sweeping Laser Rim (Lighting Effect) ── */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] pointer-events-none z-30 transition-all duration-200"
          style={{
            background: `linear-gradient(90deg, transparent 0%, rgba(255,85,0,0.3) ${Math.max(scrollProgress * 70, 5)}%, #fb923c ${Math.max(scrollProgress * 70 + 15, 20)}%, #ffedd5 ${Math.max(scrollProgress * 70 + 20, 25)}%, #fb923c ${Math.max(scrollProgress * 70 + 25, 30)}%, rgba(255,85,0,0.3) ${Math.max(scrollProgress * 70 + 40, 45)}%, transparent 100%)`,
            boxShadow: '0 0 15px #f97316, 0 0 35px #ea580c',
          }}
        />

        {/* ── Diagonal Glass Specular Light Beam (scroll reflection sweep) ── */}
        <div
          className="absolute inset-0 pointer-events-none z-20 mix-blend-screen transition-all duration-300"
          style={{
            background: `linear-gradient(115deg, transparent ${25 + scrollProgress * 25}%, rgba(251,146,60,0.06) ${35 + scrollProgress * 25}%, rgba(255,85,0,0.16) ${45 + scrollProgress * 25}%, rgba(251,146,60,0.06) ${55 + scrollProgress * 25}%, transparent ${65 + scrollProgress * 25}%)`,
          }}
        />

        {/* ── Interactive Cursor Spotlight Overlay ── */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300 opacity-60 z-20"
          style={{
            background: `radial-gradient(550px circle at ${(mousePos.x + 0.5) * 100}% ${(mousePos.y + 0.5) * 100}%, rgba(255,85,0,0.12), transparent 70%)`,
          }}
        />

        {/* Browser / Frame Top Bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-100/90 dark:bg-white/[0.03] border-b border-neutral-200 dark:border-white/[0.06] select-none">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-neutral-400 dark:bg-neutral-600" />
            <span className="w-2.5 h-2.5 rounded-full bg-neutral-400 dark:bg-neutral-600" />
            <span className="w-2.5 h-2.5 rounded-full bg-neutral-400 dark:bg-neutral-600" />
            <span className="ml-3 text-[11px] font-medium text-neutral-500 dark:text-neutral-400 hidden sm:inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping" />
              furnio.app/finance · Live Smart SaaS Tools
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-orange-500/15 border border-orange-500/30 text-orange-600 dark:text-orange-300 hover:bg-orange-500/25 transition-colors cursor-pointer"
            >
              <Sparkles size={12} className="text-orange-500" />
              <span>Open App</span>
              <ExternalLink size={11} className="text-orange-500/80" />
            </Link>
          </div>
        </div>

        {/* ── Main Dashboard Workspace ── */}
        <div className="flex w-full min-h-[560px] bg-neutral-50 dark:bg-[#07080c] text-neutral-800 dark:text-neutral-200 transition-colors duration-200">
          {/* ── Left Sidebar (matching reference image) ── */}
          <aside className="w-52 flex-shrink-0 bg-white dark:bg-[#0a0b10] border-r border-neutral-200 dark:border-white/[0.06] p-3 hidden md:flex flex-col justify-between select-none">
            <div className="space-y-5">
              {/* Brand Header */}
              <div className="px-2 pt-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-orange-500/20 border border-orange-400/50 flex items-center justify-center text-orange-500 shadow-[0_0_12px_rgba(255,85,0,0.35)]">
                    <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                  </div>
                  <div>
                    <span className="font-bold text-neutral-900 dark:text-white text-sm tracking-tight block leading-tight">FurNio</span>
                    <span className="text-[10px] text-neutral-500 tracking-wide uppercase font-medium">Finance Manager</span>
                  </div>
                </div>
              </div>

              {/* Sidebar Menu Items */}
              <div className="space-y-1 text-xs">
                {/* Dashboard Active */}
                <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-600 dark:text-orange-300 font-semibold cursor-pointer shadow-[0_0_15px_rgba(255,85,0,0.2)]">
                  <LayoutDashboard size={14} className="text-orange-500" />
                  <span>Dashboard</span>
                </div>

                {/* Markets with Expandable Items */}
                <div className="pt-2">
                  <div className="flex items-center justify-between px-3 py-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 cursor-pointer text-xs">
                    <div className="flex items-center gap-2.5">
                      <TrendingUp size={14} />
                      <span>Markets</span>
                    </div>
                    <ChevronDown size={13} className="text-neutral-500" />
                  </div>
                  <div className="pl-8 pr-2 py-1 space-y-1 text-[11px] text-neutral-500 dark:text-neutral-400">
                    <div className="py-0.5 hover:text-neutral-900 dark:hover:text-white cursor-pointer">Margin</div>
                    <div className="py-0.5 hover:text-neutral-900 dark:hover:text-white cursor-pointer">Fiat</div>
                    <div className="py-0.5 hover:text-neutral-900 dark:hover:text-white cursor-pointer">P2P</div>
                  </div>
                </div>

                {/* Trade */}
                <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-white/[0.04] transition-colors cursor-pointer">
                  <CreditCard size={14} />
                  <span>Trade</span>
                </div>

                {/* NFT / Accounting */}
                <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-white/[0.04] transition-colors cursor-pointer">
                  <Layers size={14} />
                  <span>Ledgers</span>
                </div>
              </div>
            </div>

            {/* Bottom Status */}
            <div className="pt-3 border-t border-neutral-200 dark:border-white/[0.06] text-[10.5px] text-neutral-500 flex items-center justify-between px-2">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                Connected
              </span>
              <span>v2.8</span>
            </div>
          </aside>

          {/* ── Main Panel ── */}
          <main className="flex-1 flex flex-col min-w-0 bg-neutral-50 dark:bg-[#07080c]">
            {/* Top Bar with Navigation Pills (matching reference image) */}
            <header className="flex items-center justify-between px-5 py-3 border-b border-neutral-200 dark:border-white/[0.06] bg-white/90 dark:bg-[#090a0f]/80 backdrop-blur-md">
              {/* Navigation Pills */}
              <div className="flex items-center gap-1.5">
                {['Overview', 'Activity', 'Manage', 'Card', 'Account'].map((tab) => {
                  const isActive = activeTab === tab
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#ff5500] text-white shadow-[0_0_15px_rgba(255,85,0,0.35)]'
                          : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/[0.04]'
                      }`}
                    >
                      {tab}
                    </button>
                  )
                })}
              </div>

              {/* Search, Notifications & User Avatar */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-neutral-500 dark:text-neutral-400">
                  <button type="button" className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-white/[0.06] hover:text-neutral-900 dark:hover:text-white transition-colors">
                    <Search size={14} />
                  </button>
                  <button type="button" className="relative p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-white/[0.06] hover:text-neutral-900 dark:hover:text-white transition-colors">
                    <Bell size={14} />
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-orange-500" />
                  </button>
                  <button type="button" className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-white/[0.06] hover:text-neutral-900 dark:hover:text-white transition-colors">
                    <Clock size={14} />
                  </button>
                </div>

                {/* Profile Avatar Pill */}
                <div className="flex items-center gap-2 pl-2 border-l border-neutral-200 dark:border-white/[0.08]">
                  <div className="w-7 h-7 rounded-full bg-neutral-200 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 flex items-center justify-center text-xs font-bold text-neutral-800 dark:text-white overflow-hidden">
                    <span>A</span>
                  </div>
                  <div className="hidden sm:block text-left leading-tight">
                    <span className="text-xs font-semibold text-neutral-900 dark:text-white block">Abraham</span>
                    <span className="text-[10px] text-neutral-500">abraham@gmail.com</span>
                  </div>
                  <ChevronDown size={13} className="text-neutral-500" />
                </div>
              </div>
            </header>

            {/* Content Body */}
            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto max-h-[620px]">
              {/* ── Row 1: 3 Balance Cards (USD, EUR, GBP) ── */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {/* USD Balance */}
                <div className="rounded-xl bg-white dark:bg-[#0e1017] border border-neutral-200 dark:border-white/[0.08] p-4 flex flex-col justify-between shadow-sm dark:shadow-none hover:border-orange-500/40 transition-all">
                  <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 text-xs mb-2">
                    <span className="font-medium">USD Balance</span>
                    <Wallet size={13} className="text-neutral-400 dark:text-neutral-500" />
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">$48,650.00</span>
                    <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-orange-600 dark:text-orange-400 bg-orange-500/10 border border-orange-500/25 px-2 py-0.5 rounded-full">
                      <ArrowUpRight size={12} />
                      2.8%
                    </span>
                  </div>
                </div>

                {/* EUR Balance */}
                <div className="rounded-xl bg-white dark:bg-[#0e1017] border border-neutral-200 dark:border-white/[0.08] p-4 flex flex-col justify-between shadow-sm dark:shadow-none hover:border-neutral-300 dark:hover:border-white/[0.15] transition-all">
                  <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 text-xs mb-2">
                    <span className="font-medium">EUR Balance</span>
                    <Wallet size={13} className="text-neutral-400 dark:text-neutral-500" />
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">€ 48,650.00</span>
                    <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-rose-500 dark:text-rose-400 bg-rose-500/10 border border-rose-500/25 px-2 py-0.5 rounded-full">
                      <ArrowDownRight size={12} />
                      3.8%
                    </span>
                  </div>
                </div>

                {/* GBP Balance */}
                <div className="rounded-xl bg-white dark:bg-[#0e1017] border border-neutral-200 dark:border-white/[0.08] p-4 flex flex-col justify-between shadow-sm dark:shadow-none hover:border-orange-500/40 transition-all">
                  <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 text-xs mb-2">
                    <span className="font-medium">GBP Balance</span>
                    <Wallet size={13} className="text-neutral-400 dark:text-neutral-500" />
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">$48,650.00</span>
                    <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-orange-600 dark:text-orange-400 bg-orange-500/10 border border-orange-500/25 px-2 py-0.5 rounded-full">
                      <ArrowUpRight size={12} />
                      2.8%
                    </span>
                  </div>
                </div>
              </div>

              {/* ── Row 2: Earning Overview (Wave Chart) & Spending Overview (Bar Chart) ── */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Earning Overview */}
                <div className="rounded-xl bg-white dark:bg-[#0e1017] border border-neutral-200 dark:border-white/[0.08] p-4 flex flex-col justify-between shadow-sm dark:shadow-none hover:border-orange-500/30 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-neutral-900 dark:text-white">Earning Overview</span>
                    <span className="text-[11px] text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-white/[0.04] border border-neutral-200 dark:border-white/[0.08] px-2 py-0.5 rounded-md flex items-center gap-1 cursor-pointer">
                      This Month <ChevronDown size={11} />
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-2xl font-extrabold text-neutral-900 dark:text-white tracking-tight">$20,520.32</span>
                    <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-orange-600 dark:text-orange-400 bg-orange-500/10 border border-orange-500/25 px-1.5 py-0.5 rounded-md">
                      <ArrowUpRight size={11} />
                      +15%
                    </span>
                  </div>

                  {/* Wave Chart Container with Floating Tooltip */}
                  <div className="relative pt-6">
                    {/* Tooltip Pill */}
                    <div className="absolute top-0 left-[58%] -translate-x-1/2 z-10 bg-orange-500/15 border border-orange-500/40 text-orange-600 dark:text-orange-300 text-[10.5px] font-semibold px-2.5 py-1 rounded-md backdrop-blur-md shadow-sm dark:shadow-[0_0_12px_rgba(255,85,0,0.3)] flex items-center gap-1">
                      May 2026 : $8,689.20
                    </div>

                    {/* SVG Wave Chart */}
                    <svg className="w-full h-28 overflow-visible" viewBox="0 0 400 110" fill="none">
                      <defs>
                        <linearGradient id="orangeWave" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ff5500" stopOpacity={isDark ? 0.35 : 0.22} />
                          <stop offset="100%" stopColor="#ff5500" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      {/* Gradient Area Fill */}
                      <path
                        d="M 0 85 C 50 85, 70 65, 110 65 C 150 65, 170 90, 200 90 C 230 90, 240 25, 270 25 C 300 25, 330 75, 360 75 C 380 75, 390 40, 400 40 L 400 110 L 0 110 Z"
                        fill="url(#orangeWave)"
                      />
                      {/* Curved Line Stroke */}
                      <path
                        d="M 0 85 C 50 85, 70 65, 110 65 C 150 65, 170 90, 200 90 C 230 90, 240 25, 270 25 C 300 25, 330 75, 360 75 C 380 75, 390 40, 400 40"
                        stroke="#ff5500"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                      {/* Dashed drop line */}
                      <line x1="270" y1="25" x2="270" y2="110" stroke="#ff5500" strokeDasharray="3 3" strokeOpacity="0.4" />
                      {/* Glowing pin point */}
                      <circle cx="270" cy="25" r="4.5" fill="#ffffff" stroke="#ff5500" strokeWidth="3" />
                    </svg>
                  </div>
                </div>

                {/* Spending Overview */}
                <div className="rounded-xl bg-white dark:bg-[#0e1017] border border-neutral-200 dark:border-white/[0.08] p-4 flex flex-col justify-between shadow-sm dark:shadow-none hover:border-orange-500/30 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-neutral-900 dark:text-white">Spending Overview</span>
                    <span className="text-[11px] text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-white/[0.04] border border-neutral-200 dark:border-white/[0.08] px-2 py-0.5 rounded-md flex items-center gap-1 cursor-pointer">
                      This Month <ChevronDown size={11} />
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-2xl font-extrabold text-neutral-900 dark:text-white tracking-tight">$20,520.32</span>
                    <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-rose-500 dark:text-rose-400 bg-rose-500/10 border border-rose-500/25 px-1.5 py-0.5 rounded-md">
                      <ArrowDownRight size={11} />
                      -13%
                    </span>
                  </div>

                  {/* Bar Chart with Glowing Orange Pillars */}
                  <div className="flex items-end justify-between gap-3 h-28 pt-4 px-2">
                    {[
                      { height: '45%', label: 'Jan' },
                      { height: '65%', label: 'Feb' },
                      { height: '35%', label: 'Mar' },
                      { height: '85%', label: 'Apr' },
                      { height: '100%', label: 'May', highlight: true },
                      { height: '55%', label: 'Jun' },
                      { height: '70%', label: 'Jul' },
                    ].map((bar) => (
                      <div key={bar.label} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                        <div
                          className={`w-full rounded-t-md transition-all ${
                            bar.highlight
                              ? 'bg-gradient-to-t from-orange-600 to-orange-400 shadow-[0_0_15px_rgba(255,85,0,0.5)]'
                              : 'bg-neutral-200 dark:bg-white/[0.08] hover:bg-orange-500/30'
                          }`}
                          style={{ height: bar.height }}
                        />
                        <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium">{bar.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>

        {/* Soft bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-neutral-50 dark:from-[#07080c] to-transparent pointer-events-none" />
      </div>
    </div>
  )
}
