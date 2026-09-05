import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import ThemeToggle from '@/components/ThemeToggle'
import { ArrowRight } from 'lucide-react'

const navLinks = [
  { label: 'Features',    id: 'features' },
  { label: 'Invoices',    id: 'invoices' },
  { label: 'Accounting',  id: 'system'   },
  { label: 'Workflow',    id: 'workflow' },
  { label: 'Reports',     id: 'reports'  },
]

function ScrollNavLink({ id, label }: { id: string; label: string }) {
  const navigate = useNavigate()
  const location = useLocation()

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    const scroll = () => {
      const ls = (window as any).__locomotiveScroll
      const el = document.getElementById(id)
      if (ls && el) {
        ls.scrollTo(el, { offset: -80, duration: 1.2 })
      } else if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
    if (location.pathname !== '/') {
      navigate('/')
      setTimeout(scroll, 300)
    } else {
      scroll()
    }
  }

  return (
    <a href={`#${id}`} onClick={handleClick} className="nav-link">
      {label}
    </a>
  )
}

export default function Navbar() {
  return (
    <header className="navbar-wrapper" style={{ background: 'transparent', borderBottom: 'none', boxShadow: 'none' }}>
      {/* Brand */}
      <Link to="/" className="navbar-brand">
        <div
          className="navbar-logo-mark"
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: 'rgba(59,130,246,0.15)',
            border: '1px solid rgba(59,130,246,0.3)',
            color: '#60a5fa',
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
        <span className="navbar-brand-name" style={{ fontSize: '26px', fontWeight: 800, color: '#ffffff' }}>
          FurNio
        </span>
      </Link>

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
            className="text-neutral-300 hover:text-white hover:bg-white/[0.08] rounded-full px-4 text-xs font-medium">
            Login
          </Button>
        </Link>
        <Link to="/register">
          <Button size="sm"
            className="bg-blue-600 hover:bg-blue-500 text-white rounded-full px-5 py-1.5 text-xs font-semibold border-0 shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all flex items-center gap-1.5 cursor-pointer">
            Get Started <ArrowRight size={13} />
          </Button>
        </Link>
      </div>
    </header>
  )
}
