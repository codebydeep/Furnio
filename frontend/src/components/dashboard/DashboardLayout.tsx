import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, FileSpreadsheet, BookMarked,
  BookOpenCheck, ShoppingCart, FileText, CreditCard,
  BarChart3, TrendingUp, PieChart, ChevronLeft, ChevronRight,
  LogOut, Settings, Bell, Search, Menu, X, UserCog,
  Activity, BookOpen,
} from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import ThemeToggle from '@/components/ThemeToggle'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/store/useAuthStore'

interface NavItem {
  label:  string
  to:     string
  icon:   React.ElementType
  badge?: string
  roles?: UserRole[]
}

const NAV_GROUPS: { group: string; items: NavItem[] }[] = [
  {
    group: 'Overview',
    items: [
      { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    group: 'Admin',
    items: [
      { label: 'User Management', to: '/admin/users', icon: UserCog, roles: ['ADMIN'] },
    ],
  },
  {
    group: 'Master Data',
    items: [
      { label: 'Contacts',          to: '/master/contacts',          icon: Users           },
      { label: 'Products',          to: '/master/products',          icon: FileSpreadsheet  },
      { label: 'Chart of Accounts', to: '/master/coa',               icon: BookMarked      },
      { label: 'Journals',          to: '/master/journals',          icon: BookOpenCheck   },
      { label: 'Analytic Accounts', to: '/master/analytic-accounts', icon: Activity        },
      { label: 'Budget',            to: '/master/budget',            icon: PieChart        },
    ],
  },
  {
    group: 'Transactions',
    items: [
      { label: 'Purchase Orders', to: '/transactions/purchase-order',    icon: ShoppingCart },
      { label: 'Vendor Bills',    to: '/transactions/vendor-bill',       icon: FileText     },
      { label: 'Sales Orders',    to: '/transactions/sales-order',       icon: ShoppingCart },
      { label: 'Invoices',        to: '/transactions/invoice',           icon: FileText     },
      { label: 'Payments',        to: '/transactions/payment',           icon: CreditCard   },
      { label: 'Journal Entries', to: '/transactions/journal-entries',   icon: BookOpen     },
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

const USER_ONLY_GROUPS: { group: string; items: NavItem[] }[] = [
  {
    group: 'Overview',
    items: [{ label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard }],
  },
  {
    group: 'Portal',
    items: [{ label: 'My Invoices', to: '/my-invoices', icon: FileText }],
  },
]

function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  const role = user?.role ?? 'USER'
  const groups = role === 'USER' ? USER_ONLY_GROUPS : NAV_GROUPS

  const visibleGroups = groups.map(g => ({
    ...g,
    items: g.items.filter(i => !i.roles || i.roles.includes(role as UserRole)),
  })).filter(g => g.items.length > 0)

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U'

  const roleBadge: Record<UserRole, string> = {
    ADMIN:      'Admin',
    ACCOUNTANT: 'Accountant',
    USER:       'Portal User',
  }

  return (
    <aside className={cn('db-sidebar', collapsed ? 'db-sidebar--collapsed' : 'db-sidebar--expanded')}>
      <div className="db-sidebar-header">
        {!collapsed && (
          <Link to="/dashboard" className="db-brand">
            <div className="db-brand-icon"><BookOpenCheck size={16} /></div>
            <span className="db-brand-name">UrbanBooks</span>
          </Link>
        )}
        <button className="db-collapse-btn" onClick={onToggle} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>

      <nav className="db-nav">
        {visibleGroups.map(({ group, items }) => (
          <div key={group} className="db-nav-group">
            {!collapsed && <span className="db-nav-group-label">{group}</span>}
            {items.map(({ label, to, icon: Icon, badge }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/dashboard'}
                className={({ isActive }) => cn('db-nav-link', isActive && 'db-nav-link--active')}
                title={collapsed ? label : undefined}
              >
                <Icon size={17} className="db-nav-icon" />
                {!collapsed && <span className="db-nav-label">{label}</span>}
                {!collapsed && badge && <Badge className="db-nav-badge">{badge}</Badge>}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="db-sidebar-footer">
        {!collapsed && (
          <div className="db-user-row">
            <Avatar className="h-7 w-7">
              <AvatarImage src={undefined} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="db-user-info">
              <span className="db-user-name">{user?.name}</span>
              <span className="db-user-role">{roleBadge[role as UserRole]}</span>
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

function Topbar({ onMobileMenu }: { onMobileMenu: () => void }) {
  const { user } = useAuthStore()
  const initials = user?.name ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'U'

  return (
    <header className="db-topbar">
      <button className="db-mobile-menu-btn" onClick={onMobileMenu}><Menu size={20} /></button>
      <div className="db-search-wrap">
        <Search size={14} className="db-search-icon" />
        <Input placeholder="Search invoices, contacts…" className="db-search-input" />
      </div>
      <div className="db-topbar-right">
        <ThemeToggle />
        <button className="db-notif-btn">
          <Bell size={17} />
          <span className="db-notif-dot" />
        </button>
        <Avatar className="h-8 w-8 cursor-pointer">
          <AvatarImage src={undefined} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}

export default function DashboardLayout() {
  const [collapsed,   setCollapsed]   = useState(false)
  const [mobileOpen,  setMobileOpen]  = useState(false)

  return (
    <div className="db-root">
      {mobileOpen && (
        <div className="db-mobile-overlay" onClick={() => setMobileOpen(false)}>
          <button className="db-mobile-close"><X size={20} /></button>
        </div>
      )}
      <div className={cn('db-sidebar-wrap', mobileOpen && 'db-sidebar-wrap--open')}>
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(v => !v)} />
      </div>
      <div className={cn('db-main', collapsed && 'db-main--collapsed')}>
        <Topbar onMobileMenu={() => setMobileOpen(v => !v)} />
        <main className="db-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
