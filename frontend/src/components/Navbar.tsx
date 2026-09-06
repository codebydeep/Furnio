import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import ThemeToggle from '@/components/ThemeToggle'
import { ArrowRight } from 'lucide-react'

const navLinks = [
  { label: 'Home',     id: 'home'     },
  { label: 'Features', id: 'features' },
  { label: 'Contact',  id: 'footer'   },
]

function ScrollNavLink({ id, label }: { id: string; label: string }) {
  const navigate = useNavigate()
  const location = useLocation()

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()

    const scroll = () => {
      if (id === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }
      const el = document.getElementById(id)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }

    if (location.pathname !== '/') {
      navigate('/')
      setTimeout(scroll, 200)
    } else {
      scroll()
    }
  }

  return (
    <a href={`#${id}`} onClick={handleClick} className="nav-link cursor-pointer">
      {label}
    </a>
  )
}

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()

  const handleBrandClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (location.pathname !== '/') {
      navigate('/')
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 200)
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-md bg-white/80 dark:bg-black/40 border-b border-black/[0.06] dark:border-white/[0.06]">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
        {/* Brand */}
        <a href="#home" onClick={handleBrandClick} className="navbar-brand cursor-pointer flex items-center gap-2.5">
          <div
            className="navbar-logo-mark"
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'rgba(255,85,0,0.15)',
              border: '1px solid rgba(255,85,0,0.35)',
              color: '#ff6b00',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.2"
              strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="9" y1="3"  x2="9"  y2="21" />
              <line x1="13" y1="8"  x2="18" y2="8"  />
              <line x1="13" y1="12" x2="18" y2="12" />
              <line x1="13" y1="16" x2="18" y2="16" />
            </svg>
          </div>
          <span className="navbar-brand-name font-extrabold text-neutral-900 dark:text-white text-2xl tracking-tight">
            FurNio
          </span>
        </a>

        {/* Section nav */}
        <nav className="navbar-pill">
          {navLinks.map(({ label, id }) => (
            <ScrollNavLink key={id} id={id} label={label} />
          ))}
        </nav>

        {/* Actions */}
        <div className="navbar-actions">
          <ThemeToggle />
          <Link to="/login">
            <Button variant="ghost" size="sm"
              className="text-neutral-700 hover:text-neutral-900 hover:bg-black/[0.05] dark:text-neutral-300 dark:hover:text-white dark:hover:bg-white/[0.08] rounded-full px-4 text-xs font-medium">
              Login
            </Button>
          </Link>
          <Link to="/register">
            <Button size="sm"
              className="bg-[#ff5500] hover:bg-[#ff6a1a] text-white rounded-full px-5 py-1.5 text-xs font-bold border-0 shadow-[0_0_20px_rgba(255,85,0,0.5)] transition-all flex items-center gap-1.5 cursor-pointer">
              Get Started <ArrowRight size={13} />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
