import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, FileSpreadsheet, BookMarked,
  BookOpenCheck, ShoppingCart, FileText, CreditCard,
  BarChart3, TrendingUp, PieChart, ChevronLeft, ChevronRight, ChevronDown,
  LogOut, Settings, Bell, Search, Menu, X, UserCog,
  Activity, BookOpen,
} from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import ThemeToggle from '@/components/ThemeToggle'
import { cn } from '@/lib/utils'
import { getAvatarInitial } from '@/lib/avatar'
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
  {
    group: 'Portal',
    items: [
      { label: 'Customer Portal', to: '/my-invoices', icon: FileText },
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
    items: [
      { label: 'Invoices & Bills', to: '/my-invoices', icon: FileText },
      { label: 'Payment History',  to: '/my-invoices?tab=payments', icon: CreditCard },
    ],
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

  const avatarInitial = getAvatarInitial(user?.name)

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
            <span className="db-brand-name">FurNio</span>
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
              <AvatarFallback aria-label={`${user?.name ?? 'User'} avatar`}>{avatarInitial}</AvatarFallback>
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

const TOP_CATEGORIES = [
  {
    name: 'Sales',
    items: [
      { label: 'Sales order',  to: '/transactions/sales-order' },
      { label: 'Sale Invoice', to: '/transactions/invoice' },
      { label: 'Receipt',      to: '/transactions/payment' },
    ],
  },
  {
    name: 'Purchase',
    items: [
      { label: 'Purchase Order', to: '/transactions/purchase-order' },
      { label: 'Purchase Bill',  to: '/transactions/vendor-bill' },
      { label: 'Payment',        to: '/transactions/payment' },
    ],
  },
  {
    name: 'Account',
    items: [
      { label: 'Contact',           to: '/master/contacts' },
      { label: 'Product',           to: '/master/products' },
      { label: 'Analyticals',       to: '/master/analytic-accounts' },
      { label: 'Analytical Budget', to: '/master/budget' },
      { label: 'Chart of Account',  to: '/master/coa' },
      { label: 'Journals',          to: '/master/journals' },
      { label: 'Journal Entries',   to: '/transactions/journal-entries' },
    ],
  },
  {
    name: 'Report',
    items: [
      { label: 'Balancesheet',   to: '/reports/balance-sheet' },
      { label: 'Profit and Loss', to: '/reports/profit-loss' },
      { label: 'Budget Report',  to: '/reports/budget' },
    ],
  },
]

function Topbar({ onMobileMenu }: { onMobileMenu: () => void }) {
  const { user } = useAuthStore()
  const avatarInitial = getAvatarInitial(user?.name)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)

  return (
    <header className="db-topbar flex-wrap gap-y-2">
      <button className="db-mobile-menu-btn" onClick={onMobileMenu}><Menu size={20} /></button>

      {/* Wireframe top category navigation (Screenshot 5) */}
      <nav className="wf-topbar-nav hidden md:flex" onMouseLeave={() => setActiveMenu(null)}>
        {TOP_CATEGORIES.map(cat => {
          const isOpen = activeMenu === cat.name
          return (
            <div key={cat.name} className="relative">
              <button
                type="button"
                className="wf-nav-dropdown-trigger"
                data-active={isOpen}
                onClick={() => setActiveMenu(isOpen ? null : cat.name)}
                onMouseEnter={() => setActiveMenu(cat.name)}
              >
                <span>{cat.name}</span>
                <ChevronDown size={13} className={cn('transition-transform duration-150', isOpen && 'rotate-180 text-white')} />
              </button>
              {isOpen && (
                <div className="wf-dropdown-menu">
                  {cat.items.map(item => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="wf-dropdown-item"
                      onClick={() => setActiveMenu(null)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      <div className="db-search-wrap ml-auto">
        <Search size={14} className="db-search-icon" />
        <Input placeholder="Search invoices, contacts…" className="db-search-input" />
      </div>
      <div className="db-topbar-right">
        <ThemeToggle />
        <button className="db-notif-btn" title="Notifications">
          <Bell size={17} />
          <span className="db-notif-dot" />
        </button>
        <Avatar className="h-8 w-8 cursor-pointer">
          <AvatarFallback aria-label={`${user?.name ?? 'User'} avatar`}>{avatarInitial}</AvatarFallback>
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
