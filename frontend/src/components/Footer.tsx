import { useState } from "react"
import { NavLink } from "react-router-dom"
import { CheckCircle2 } from "lucide-react"

export default function Footer({ footerRef }: { footerRef?: React.RefObject<HTMLElement | null> }) {
  const [email, setEmail] = useState("")
  const [subscribed, setSubscribed] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (email.trim()) {
      setSubscribed(true)
      setEmail("")
      setTimeout(() => setSubscribed(false), 5000)
    }
  }

  const handleLinkClick = (to: string, e: React.MouseEvent) => {
    if (to.startsWith("#")) {
      const id = to.slice(1)
      const el = document.getElementById(id)
      if (el) {
        e.preventDefault()
        const ls = (window as any).__locomotiveScroll
        if (ls) {
          ls.scrollTo(el, { offset: -80, duration: 1.2 })
        } else {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }
    }
  }

  const quickLinks = [
    { label: "Home",        to: "#home" },
    { label: "Features",    to: "#features" },
    { label: "Dashboard",   to: "/dashboard" },
    { label: "Contact",     to: "#footer" },
  ]

  return (
    <footer
      ref={footerRef}
      className="w-full bg-[var(--lp-bg)] border-t border-black/[0.08] dark:border-white/[0.08] text-[var(--lp-text)] transition-colors duration-300"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Top section */}
        <div className="grid grid-cols-1 gap-8 py-14 lg:grid-cols-3">
          {/* Newsletter */}
          <div className="lg:col-span-2">
            <h3 className="mb-3 text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">Stay Updated</h3>
            <p className="mb-6 max-w-lg text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              Get the latest product updates, feature releases, and furniture accounting tips
              delivered straight to your inbox. Join the FurNio community.
            </p>
            <form onSubmit={handleSubmit} className="flex max-w-md flex-col gap-3 sm:flex-row">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 rounded-lg border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.04] px-4 py-2.5 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-500 outline-none transition focus:border-[#ff5500] focus:ring-2 focus:ring-[#ff5500]/20"
              />
              <button
                type="submit"
                className="rounded-lg bg-[#ff5500] px-6 py-2.5 text-sm font-bold text-white transition-colors duration-200 hover:bg-[#ff6a1a] shadow-[0_0_20px_rgba(255,85,0,0.35)] cursor-pointer"
              >
                Subscribe
              </button>
            </form>
            {subscribed ? (
              <p className="mt-3 text-xs text-[#ff5500] font-medium flex items-center gap-1.5">
                <CheckCircle2 size={13} />
                Thank you for subscribing to FurNio updates!
              </p>
            ) : (
              <p className="mt-3 text-xs text-neutral-500">
                We respect your privacy. Unsubscribe at any time.
              </p>
            )}
          </div>

          {/* Quick links */}
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.map(({ label, to }) => (
                <li key={label}>
                  <NavLink
                    to={to}
                    onClick={(e) => handleLinkClick(to, e)}
                    className="text-sm text-neutral-600 dark:text-neutral-400 transition-colors hover:text-neutral-900 dark:hover:text-white"
                  >
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-black/[0.08] dark:border-white/[0.08] py-6 md:flex-row">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            © 2026 <span className="font-semibold text-neutral-900 dark:text-white">FurNio</span>. All rights reserved.
          </p>
          <div className="flex gap-6">
            {["Privacy Policy", "Terms", "Cookies"].map((item) => (
              <NavLink
                key={item}
                to="/"
                className="text-xs text-neutral-600 dark:text-neutral-400 transition-colors hover:text-neutral-900 dark:hover:text-white"
              >
                {item}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
