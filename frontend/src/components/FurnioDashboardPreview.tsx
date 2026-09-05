import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Package,
  BookOpen,
  BookMarked,
  Activity,
  Target,
  ShoppingCart,
  Receipt,
  ShoppingBag,
  FileText,
  CreditCard,
  Layers,
  ChevronDown,
  ChevronLeft,
  Search,
  Sun,
  Bell,
  Plus,
  BarChart3,
  ExternalLink,
  Sparkles,
} from 'lucide-react'

export default function FurnioDashboardPreview() {
  const [activeMaster, setActiveMaster] = useState<string>('Contact')

  return (
    <div className="relative w-full max-w-6xl mx-auto z-20 group">
      {/* ── Top Laser Glow Beam (matching Image 1) ────────────────────── */}
      <div className="relative w-full flex items-center justify-center mb-[-1px] pointer-events-none">
        <div className="w-full max-w-4xl h-[2px] bg-gradient-to-r from-transparent via-purple-400 to-transparent shadow-[0_0_20px_#c084fc,0_0_40px_#818cf8]" />
        <div className="absolute w-64 h-8 bg-purple-500/30 blur-xl rounded-full" />
      </div>

      {/* ── Outer Glass Window Container (matching Image 1) ───────────── */}
      <div className="relative rounded-2xl overflow-hidden border border-purple-500/30 bg-[#0a0b10]/95 backdrop-blur-2xl shadow-[0_25px_90px_rgba(0,0,0,0.85),0_0_80px_rgba(139,92,246,0.22)] transition-all duration-300">
        {/* Ambient Top Glow Line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-300/60 to-transparent z-30" />

        {/* Browser / Application Title Bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-white/[0.03] border-b border-white/[0.08] select-none">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#ff5f56]/80 border border-[#e0443e]" />
            <span className="w-3 h-3 rounded-full bg-[#ffbd2e]/80 border border-[#dea123]" />
            <span className="w-3 h-3 rounded-full bg-[#27c93f]/80 border border-[#1aab29]" />
            <span className="ml-3 text-[11px] font-medium text-neutral-400 hidden sm:inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
              furnio.app/dashboard · Live Interactive Preview
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-blue-500/15 border border-blue-500/30 text-blue-300 hover:bg-blue-500/25 transition-colors"
            >
              <Sparkles size={12} className="text-blue-400" />
              <span>Enter Live App</span>
              <ExternalLink size={11} className="text-blue-400/80" />
            </Link>
          </div>
        </div>

        {/* ── FurNio Dashboard Main UI (precisely matching Image 2) ─────── */}
        <div className="flex w-full min-h-[580px] bg-[#090a0f] text-neutral-200">
          {/* ── Left Sidebar ────────────────────────────────────────── */}
          <aside className="w-56 flex-shrink-0 bg-[#0d0e16] border-r border-white/[0.06] p-3 hidden md:flex flex-col justify-between select-none">
            <div className="space-y-4">
              {/* Brand Logo Header */}
              <div className="flex items-center justify-between px-2 pt-1 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <line x1="9" y1="3" x2="9" y2="21" />
                      <line x1="13" y1="8" x2="18" y2="8" />
                      <line x1="13" y1="12" x2="18" y2="12" />
                      <line x1="13" y1="16" x2="18" y2="16" />
                    </svg>
                  </div>
                  <span className="font-extrabold text-white text-base tracking-tight">FurNio</span>
                </div>
                <button type="button" className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-white/[0.06] transition-colors">
                  <ChevronLeft size={14} />
                </button>
              </div>

              {/* Navigation Sections */}
              <div className="space-y-3 text-[11.5px]">
                {/* OVERVIEW */}
                <div>
                  <div className="px-2 mb-1 text-[10px] font-bold uppercase tracking-wider text-neutral-500">Overview</div>
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-300 font-semibold cursor-pointer">
                    <LayoutDashboard size={14} className="text-blue-400" />
                    <span>Dashboard</span>
                  </div>
                </div>

                {/* ADMIN */}
                <div>
                  <div className="px-2 mb-1 text-[10px] font-bold uppercase tracking-wider text-neutral-500">Admin</div>
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.04] transition-colors cursor-pointer">
                    <Users size={14} />
                    <span>User Management</span>
                  </div>
                </div>

                {/* MASTER DATA */}
                <div>
                  <div className="px-2 mb-1 text-[10px] font-bold uppercase tracking-wider text-neutral-500">Master Data</div>
                  <div className="space-y-0.5">
                    {[
                      { label: 'Contacts', icon: Users },
                      { label: 'Products', icon: Package },
                      { label: 'Chart of Accounts', icon: BookOpen },
                      { label: 'Journals', icon: BookMarked },
                      { label: 'Analytic Accounts', icon: Activity },
                      { label: 'Budget', icon: Target },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center gap-2 px-2.5 py-1 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.04] transition-colors cursor-pointer"
                      >
                        <item.icon size={13} className="text-neutral-500" />
                        <span>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* TRANSACTIONS */}
                <div>
                  <div className="px-2 mb-1 text-[10px] font-bold uppercase tracking-wider text-neutral-500">Transactions</div>
                  <div className="space-y-0.5">
                    {[
                      { label: 'Purchase Orders', icon: ShoppingCart },
                      { label: 'Vendor Bills', icon: Receipt },
                      { label: 'Sales Orders', icon: ShoppingBag },
                      { label: 'Invoices', icon: FileText },
                      { label: 'Payments', icon: CreditCard },
                      { label: 'Journal Entries', icon: Layers },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center gap-2 px-2.5 py-1 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.04] transition-colors cursor-pointer"
                      >
                        <item.icon size={13} className="text-neutral-500" />
                        <span>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Status */}
            <div className="pt-2 border-t border-white/[0.06] text-[10px] text-neutral-500 flex items-center justify-between px-2">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Double-Entry Active
              </span>
              <span>v2.4</span>
            </div>
          </aside>

          {/* ── Main Dashboard Content ──────────────────────────────── */}
          <main className="flex-1 flex flex-col min-w-0 bg-[#090a10]">
            {/* Top Navigation Bar (from Image 2) */}
            <header className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06] bg-[#0c0d14]/70">
              {/* Dropdown Links */}
              <div className="flex items-center gap-4 text-xs font-medium text-neutral-300">
                {['Sales', 'Purchase', 'Account', 'Report'].map((item) => (
                  <button
                    key={item}
                    type="button"
                    className="flex items-center gap-1 hover:text-white transition-colors"
                  >
                    <span>{item}</span>
                    <ChevronDown size={13} className="text-neutral-400" />
                  </button>
                ))}
              </div>

              {/* Search Bar & Action Icons */}
              <div className="flex items-center gap-3">
                <div className="relative hidden sm:block">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                  <input
                    type="text"
                    readOnly
                    placeholder="Search invoices, contacts..."
                    className="w-52 pl-8 pr-3 py-1.5 rounded-lg bg-neutral-900/90 border border-neutral-800 text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-none cursor-default"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button type="button" className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60 transition-colors">
                    <Sun size={14} />
                  </button>
                  <button type="button" className="relative p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60 transition-colors">
                    <Bell size={14} />
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-rose-500" />
                  </button>
                </div>
              </div>
            </header>

            {/* Dashboard Workspace */}
            <div className="p-5 sm:p-6 space-y-5 overflow-y-auto max-h-[640px]">
              {/* Greeting Header (from Image 2) */}
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                  Good morning, Doraemon <span className="text-xl">👋</span>
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  FurNio Accounting & Financial Overview
                </p>
              </div>

              {/* ── Row 1: Top 3 Metric Cards (Sales, Purchase, Budget Reports) ── */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Sales Card */}
                <div className="rounded-xl bg-[#11131c] border border-white/[0.08] p-4 flex flex-col justify-between hover:border-blue-500/30 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-white text-sm">Sales</span>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 bg-white text-black font-semibold text-[11px] px-2.5 py-0.5 rounded-md hover:bg-neutral-200 transition-colors"
                    >
                      <Plus size={11} strokeWidth={3} />
                      <span>New</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-3 text-center border-t border-white/[0.06] pt-3">
                    <div>
                      <div className="text-[10px] text-neutral-400 font-medium">All</div>
                      <div className="text-base font-bold text-white mt-0.5">1</div>
                    </div>
                    <div className="border-x border-white/[0.06]">
                      <div className="text-[10px] text-neutral-400 font-medium">Confirmed</div>
                      <div className="text-base font-bold text-white mt-0.5">0</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-neutral-400 font-medium">Draft</div>
                      <div className="text-base font-bold text-white mt-0.5">1</div>
                    </div>
                  </div>
                </div>

                {/* Purchase Card */}
                <div className="rounded-xl bg-[#11131c] border border-white/[0.08] p-4 flex flex-col justify-between hover:border-blue-500/30 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-white text-sm">Purchase</span>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 bg-white text-black font-semibold text-[11px] px-2.5 py-0.5 rounded-md hover:bg-neutral-200 transition-colors"
                    >
                      <Plus size={11} strokeWidth={3} />
                      <span>New</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-3 text-center border-t border-white/[0.06] pt-3">
                    <div>
                      <div className="text-[10px] text-neutral-400 font-medium">All</div>
                      <div className="text-base font-bold text-white mt-0.5">1</div>
                    </div>
                    <div className="border-x border-white/[0.06]">
                      <div className="text-[10px] text-neutral-400 font-medium">Confirmed</div>
                      <div className="text-base font-bold text-white mt-0.5">1</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-neutral-400 font-medium">Draft</div>
                      <div className="text-base font-bold text-white mt-0.5">0</div>
                    </div>
                  </div>
                </div>

                {/* Budget Reports Card */}
                <div className="rounded-xl bg-[#11131c] border border-white/[0.08] p-4 flex flex-col justify-between hover:border-purple-500/30 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-white text-sm">Budget Reports</span>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 bg-[#5D3653] text-white font-semibold text-[11px] px-2.5 py-0.5 rounded-md hover:bg-[#6e4163] transition-colors"
                    >
                      <BarChart3 size={11} />
                      <span>Report</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-3 text-center border-t border-white/[0.06] pt-3">
                    <div>
                      <div className="text-[10px] text-neutral-400 font-medium">Achieved</div>
                      <div className="text-base font-bold text-white mt-0.5">0</div>
                    </div>
                    <div className="border-x border-white/[0.06]">
                      <div className="text-[10px] text-neutral-400 font-medium">Budget</div>
                      <div className="text-base font-bold text-white mt-0.5">3</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-neutral-400 font-medium">Committed</div>
                      <div className="text-base font-bold text-white mt-0.5">3</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Row 2: MASTER DATA Workflow Banner (from Image 2) ──────── */}
              <div className="rounded-xl bg-[#11131c]/90 border border-white/[0.08] p-4 space-y-3">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-wider">
                    Master Data
                  </span>
                  <span className="text-neutral-300 font-medium">
                    Workflow standard: List view default → Click record to edit details or +New for blank form.
                  </span>
                </div>

                <p className="text-[11px] text-neutral-400 italic">
                  "All Master will have list view as default and clicking on New button it will open blank form view to enter new record, Clicking on already saved record - it will open form view with saved details."
                </p>

                {/* 6 Quick Action Pill Modules */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {[
                    { name: 'Contact', icon: Users },
                    { name: 'Product', icon: Package },
                    { name: 'Analyticals', icon: Activity },
                    { name: 'Analytical Budget', icon: Target },
                    { name: 'Chart of Account', icon: BookOpen },
                    { name: 'Journals', icon: Layers },
                  ].map((m) => {
                    const isSelected = activeMaster === m.name
                    return (
                      <button
                        key={m.name}
                        type="button"
                        onClick={() => setActiveMaster(m.name)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-blue-500/20 border border-blue-500/40 text-blue-300 shadow-[0_0_12px_rgba(59,130,246,0.3)]'
                            : 'bg-white/[0.04] border border-white/[0.08] text-neutral-300 hover:bg-white/[0.08] hover:text-white'
                        }`}
                      >
                        <m.icon size={12} className={isSelected ? 'text-blue-400' : 'text-neutral-400'} />
                        <span>{m.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* ── Row 3: 4 Financial Health Metrics (from Image 2) ───────── */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                {/* Total Revenue */}
                <div className="rounded-xl bg-[#11131c] border border-white/[0.08] p-4 flex flex-col justify-between hover:border-emerald-500/30 transition-all">
                  <div className="text-[10.5px] font-bold uppercase tracking-wider text-neutral-400">Total Revenue</div>
                  <div className="text-2xl font-extrabold text-emerald-400 my-1 tracking-tight">₹40,000</div>
                  <div className="text-[11px] text-neutral-500">From journal entries</div>
                </div>

                {/* Total Expenses */}
                <div className="rounded-xl bg-[#11131c] border border-white/[0.08] p-4 flex flex-col justify-between hover:border-rose-500/30 transition-all">
                  <div className="text-[10.5px] font-bold uppercase tracking-wider text-neutral-400">Total Expenses</div>
                  <div className="text-2xl font-extrabold text-rose-400 my-1 tracking-tight">₹6,000</div>
                  <div className="text-[11px] text-neutral-500">From journal entries</div>
                </div>

                {/* Net Profit */}
                <div className="rounded-xl bg-[#11131c] border border-white/[0.08] p-4 flex flex-col justify-between hover:border-blue-500/30 transition-all">
                  <div className="text-[10.5px] font-bold uppercase tracking-wider text-neutral-400">Net Profit</div>
                  <div className="text-2xl font-extrabold text-blue-400 my-1 tracking-tight">₹34,000</div>
                  <div className="text-[11px] text-neutral-500">Revenue – Expenses</div>
                </div>

                {/* Total Assets */}
                <div className="rounded-xl bg-[#11131c] border border-white/[0.08] p-4 flex flex-col justify-between hover:border-amber-500/30 transition-all">
                  <div className="text-[10.5px] font-bold uppercase tracking-wider text-neutral-400">Total Assets</div>
                  <div className="text-2xl font-extrabold text-amber-400 my-1 tracking-tight">₹65,000</div>
                  <div className="text-[11px] text-neutral-500">Balance sheet</div>
                </div>
              </div>
            </div>
          </main>
        </div>

        {/* ── Soft Bottom Fade Overlay matching Image 1 ──────────────── */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0a0b10] to-transparent pointer-events-none" />
      </div>
    </div>
  )
}
