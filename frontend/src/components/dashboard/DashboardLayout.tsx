import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, FileSpreadsheet, BookMarked,
  BookOpenCheck, ShoppingCart, FileText, CreditCard,
  BarChart3, TrendingUp, PieChart, ChevronLeft, ChevronRight,
  LogOut, Settings, Bell, Search, Menu, X,
} from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import ThemeToggle from '@/components/ThemeToggle'
import { cn } from '@/lib/utils'

/* ── Sidebar nav items ──────────────────────────────────────── */
interface NavItem {
  label:    string
  to:       string
  icon:     React.ElementType
  badge?:   string
  roles?:   string[]
}

const NAV_GROUPS: { group: string; items: NavItem[] }[] = [
  {
    group: 'Overview',
    items: [
      { label: 'Dashboard',  to: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    group: 'Master Data',
    items: [
      { label: 'Contacts',         to: '/master/contacts', icon: Users          },
      { label: 'Products',         to: '/master/products', icon: FileSpreadsheet },
      { label: 'Chart of Accounts',to: '/master/coa',      icon: BookMarked     },
      { label: 'Journals',         to: '/master/journals', icon: BookOpenCheck  },
      { label: 'Budget',           to: '/master/budget',   icon: PieChart       },
    ],
  },
  {
    group: 'Transactions',
    items: [
      { label: 'Purchase Orders', to: '/transactions/purchase-order', icon: ShoppingCart },
      { label: 'Vendor Bills',    to: '/transactions/vendor-bill',    icon: FileText, badge: '3' },
      { label: 'Sales Orders',    to: '/transactions/sales-order',    icon: ShoppingCart },
      { label: 'Invoices',        to: '/transactions/invoice',        icon: FileText, badge: '5' },
      { label: 'Payments',        to: '/transactions/payment',        icon: CreditCard },
    ],
  },
  {
    group: 'Reports',
    items: [
      { label: 'Balance Sheet', to: '/reports/balance-sheet', icon: BarChart3  },
      { label: 'Profit & Loss', to: '/reports/profit-loss',   icon: TrendingUp },
      { label: 'Budget Report', to: '/reports/budget',        icon: PieChart   },
    ],
  },
]

/* ── Sidebar ────────────────────────────────────────────────── */
function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : user?.email?.[0].toUpperCase() ?? 'U'

  return (
    <aside
      className={cn(
        'db-sidebar',
        collapsed ? 'db-sidebar--collapsed' : 'db-sidebar--expanded'
      )}
    >
      {/* Logo + collapse toggle */}
      <div className="db-sidebar-header">
        {!collapsed && (
          <Link to="/dashboard" className="db-brand">
            <div className="db-brand-icon">
              <BookOpenCheck size={16} />
            </div>
            <span className="db-brand-name">UrbanBooks</span>
          </Link>
        )}
        <button
          className="db-collapse-btn"
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="db-nav">
        {NAV_GROUPS.map(({ group, items }) => (
          <div key={group} className="db-nav-group">
            {!collapsed && <span className="db-nav-group-label">{group}</span>}
            {items.map(({ label, to, icon: Icon, badge }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/dashboard'}
                className={({ isActive }) =>
                  cn('db-nav-link', isActive && 'db-nav-link--active')
                }
                title={collapsed ? label : undefined}
              >
                <Icon size={17} className="db-nav-icon" />
                {!collapsed && <span className="db-nav-label">{label}</span>}
                {!collapsed && badge && (
                  <Badge className="db-nav-badge">{badge}</Badge>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Bottom: user + settings */}
      <div className="db-sidebar-footer">
        {!collapsed && (
          <div className="db-user-row">
            <Avatar className="h-7 w-7">
              <AvatarImage src={user?.image ?? undefined} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="db-user-info">
              <span className="db-user-name">{user?.name ?? user?.email}</span>
              <span className="db-user-role">{user?.role}</span>
            </div>
          </div>
        )}
        <div className={cn('db-footer-actions', collapsed && 'flex-col')}>
          <Link to="/settings" className="db-footer-btn" title="Settings">
            <Settings size={15} />
          </Link>
          <button className="db-footer-btn" onClick={handleLogout} title="Log out">
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  )
}

/* ── Topbar ─────────────────────────────────────────────────── */
function Topbar({ onMobileMenu }: { onMobileMenu: () => void }) {
  const { user } = useAuthStore()
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : user?.email?.[0].toUpperCase() ?? 'U'

  return (
    <header className="db-topbar">
      {/* Mobile hamburger */}
      <button className="db-mobile-menu-btn" onClick={onMobileMenu}>
        <Menu size={20} />
      </button>

      {/* Search */}
      <div className="db-search-wrap">
        <Search size={14} className="db-search-icon" />
        <Input
          placeholder="Search invoices, contacts…"
          className="db-search-input"
        />
      </div>

      <div className="db-topbar-right">
        <ThemeToggle />

        {/* Notifications */}
        <button className="db-notif-btn">
          <Bell size={17} />
          <span className="db-notif-dot" />
        </button>

        {/* Avatar */}
        <Avatar className="h-8 w-8 cursor-pointer">
          <AvatarImage src={user?.image ?? undefined} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}

/* ── Layout root ────────────────────────────────────────────── */
export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="db-root">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="db-mobile-overlay" onClick={() => setMobileOpen(false)}>
          <button className="db-mobile-close"><X size={20} /></button>
        </div>
      )}

      {/* Sidebar */}
      <div className={cn('db-sidebar-wrap', mobileOpen && 'db-sidebar-wrap--open')}>
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(v => !v)} />
      </div>

      {/* Main */}
      <div className={cn('db-main', collapsed && 'db-main--collapsed')}>
        <Topbar onMobileMenu={() => setMobileOpen(v => !v)} />
        <main className="db-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
