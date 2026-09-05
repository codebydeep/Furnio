import { NavLink } from 'react-router-dom'
import { Button } from '@/components/ui/button'

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Features', to: '#features' },
  { label: 'Workflow', to: '#workflow' },
  { label: 'Reports', to: '#reports' },
]

export default function Navbar() {
  return (
    <header className="navbar-wrapper">
      <div className="navbar-brand">
        <div className="navbar-logo-mark">
          {/* Ledger / book icon */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="9" y1="3" x2="9" y2="21" />
            <line x1="13" y1="8" x2="18" y2="8" />
            <line x1="13" y1="12" x2="18" y2="12" />
            <line x1="13" y1="16" x2="18" y2="16" />
          </svg>
        </div>
        <span className="navbar-brand-name">UrbanBooks</span>
      </div>

      <nav className="navbar-pill">
        {navLinks.map(({ label, to }) => (
          <NavLink
            key={label}
            to={to}
            end
            className={({ isActive }) =>
              isActive ? 'nav-link nav-link--active' : 'nav-link'
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="navbar-actions">
        <Button
          variant="ghost"
          size="sm"
          className="text-white/60 hover:text-white hover:bg-white/10 rounded-full"
        >
          Login
        </Button>
        <Button
          size="sm"
          className="bg-white text-black hover:bg-white/90 rounded-full px-5 font-semibold"
        >
          Get Started
        </Button>
      </div>
    </header>
  )
}
