/**
 * Temporary dashboard stub — will be replaced with full dashboard pages.
 * Shows role, user info, and links to all modules.
 */
import { Link, useNavigate } from 'react-router-dom'
import {
  Users, Package, BookOpen, Layers, ShoppingCart,
  FileText, BarChart3, LogOut,
} from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'

const moduleLinks = [
  { icon: Users,       label: 'Contacts',         to: '/master/contacts'   },
  { icon: Package,     label: 'Products',          to: '/master/products'   },
  { icon: BookOpen,    label: 'Chart of Accounts', to: '/master/coa'        },
  { icon: Layers,      label: 'Journals',          to: '/master/journals'   },
  { icon: BarChart3,   label: 'Budget',            to: '/master/budget'     },
  { icon: ShoppingCart,label: 'Purchase Orders',   to: '/transactions/purchase-order' },
  { icon: FileText,    label: 'Sales Orders',      to: '/transactions/sales-order'    },
  { icon: FileText,    label: 'Invoices',          to: '/transactions/invoice'        },
  { icon: BarChart3,   label: 'Balance Sheet',     to: '/reports/balance-sheet'       },
  { icon: BarChart3,   label: 'P&L Report',        to: '/reports/profit-loss'         },
]

export default function DashboardStub() {
  const navigate         = useNavigate()
  const { user, logout } = useAuthStore()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="dash-stub">
      {/* Top bar */}
      <header className="dash-stub-header">
        <Link to="/" className="auth-logo">
          <span className="auth-logo-name">FurNio</span>
        </Link>
        <div className="dash-stub-user">
          <span className="dash-stub-role">{user?.role}</span>
          <span className="dash-stub-name">{user?.name}</span>
          <button onClick={handleLogout} className="dash-stub-logout" title="Log out">
            <LogOut size={10} />
          </button>
        </div>
      </header>

      {/* Grid of module cards */}
      <main className="dash-stub-body">
        <h2 className="dash-stub-title">Dashboard</h2>
        <div className="dash-stub-grid">
          {moduleLinks.map(({ icon: Icon, label, to }) => (
            <Link key={to} to={to} className="dash-stub-card">
              <div className="dash-stub-card-icon">
                <Icon size={22} />
              </div>
              <span>{label}</span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
