import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import ThemeToggle from '@/components/ThemeToggle'

const navLinks = [
  { label: 'Home',        id: 'home'    },
  { label: 'Actors',      id: 'actors'  },
  { label: 'Features',    id: 'features'},
  { label: 'Workflow',    id: 'workflow' },
  { label: 'System',      id: 'system'  },
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
    <header className="navbar-wrapper">
      {/* Brand */}
      <Link to="/" className="navbar-brand">
        <div className="navbar-logo-mark">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.2"
            strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="9" y1="3"  x2="9"  y2="21" />
            <line x1="13" y1="8"  x2="18" y2="8"  />
            <line x1="13" y1="12" x2="18" y2="12" />
            <line x1="13" y1="16" x2="18" y2="16" />
          </svg>
        </div>
        <span className="navbar-brand-name">UrbanBooks</span>
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
            className="text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] rounded-full">
            Login
          </Button>
        </Link>
        <Link to="/register">
          <Button size="sm"
            className="bg-[var(--accent)] text-white hover:opacity-90 rounded-full px-5 font-semibold border-0">
            Get Started
          </Button>
        </Link>
      </div>
    </header>
  )
}
