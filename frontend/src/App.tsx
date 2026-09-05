import { Routes, Route, Navigate } from 'react-router-dom'
import ThemeProvider    from '@/lib/ThemeProvider'
import ProtectedRoute   from '@/components/ProtectedRoute'
import DashboardLayout  from '@/components/dashboard/DashboardLayout'

/* ── Public pages ──────────────────────────────────────────── */
import LandingPage      from '@/pages/LandingPage'
import LoginPage        from '@/pages/LoginPage'
import RegisterPage     from '@/pages/RegisterPage'
import UnauthorizedPage from '@/pages/UnauthorizedPage'

/* ── Dashboard ─────────────────────────────────────────────── */
import DashboardHome    from '@/pages/dashboard/DashboardHome'

/* ── Admin ─────────────────────────────────────────────────── */
import UsersPage        from '@/pages/dashboard/UsersPage'

/* ── Master Data ────────────────────────────────────────────── */
import ContactsPage           from '@/pages/dashboard/ContactsPage'
import ProductsPage           from '@/pages/dashboard/ProductsPage'
import ChartOfAccountsPage    from '@/pages/dashboard/ChartOfAccountsPage'
import JournalsPage           from '@/pages/dashboard/JournalsPage'
import AnalyticAccountsPage   from '@/pages/dashboard/AnalyticAccountsPage'
import BudgetPage             from '@/pages/dashboard/BudgetPage'

/* ── Transactions ───────────────────────────────────────────── */
import PurchaseOrderPage  from '@/pages/dashboard/PurchaseOrderPage'
import VendorBillPage     from '@/pages/dashboard/VendorBillPage'
import SalesOrderPage     from '@/pages/dashboard/SalesOrderPage'
import InvoicePage        from '@/pages/dashboard/InvoicePage'
import PaymentPage        from '@/pages/dashboard/PaymentPage'
import JournalEntriesPage from '@/pages/dashboard/JournalEntriesPage'

/* ── Reports ────────────────────────────────────────────────── */
import BalanceSheetPage  from '@/pages/dashboard/BalanceSheetPage'
import ProfitLossPage    from '@/pages/dashboard/ProfitLossPage'
import BudgetReportPage  from '@/pages/dashboard/BudgetReportPage'

/* ── Portal ─────────────────────────────────────────────────── */
import MyInvoicesPage    from '@/pages/dashboard/MyInvoicesPage'

/* ── Account ────────────────────────────────────────────────── */
import SettingsPage      from '@/pages/dashboard/SettingsPage'

export default function App() {
  return (
    <ThemeProvider>
      <Routes>
        {/* Public */}
        <Route path="/"             element={<LandingPage />} />
        <Route path="/login"        element={<LoginPage />} />
        <Route path="/register"     element={<RegisterPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Protected — all roles */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* Overview */}
          <Route path="/dashboard" element={<DashboardHome />} />

          {/* Admin-only */}
          <Route path="/admin/users"
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <UsersPage />
              </ProtectedRoute>
            }
          />

          {/* Master Data — ACCOUNTANT + ADMIN */}
          <Route path="/master/contacts"
            element={
              <ProtectedRoute roles={['ADMIN', 'ACCOUNTANT']}>
                <ContactsPage />
              </ProtectedRoute>
            }
          />
          <Route path="/master/products"
            element={
              <ProtectedRoute roles={['ADMIN', 'ACCOUNTANT']}>
                <ProductsPage />
              </ProtectedRoute>
            }
          />
          <Route path="/master/coa"
            element={
              <ProtectedRoute roles={['ADMIN', 'ACCOUNTANT']}>
                <ChartOfAccountsPage />
              </ProtectedRoute>
            }
          />
          <Route path="/master/journals"
            element={
              <ProtectedRoute roles={['ADMIN', 'ACCOUNTANT']}>
                <JournalsPage />
              </ProtectedRoute>
            }
          />
          <Route path="/master/analytic-accounts"
            element={
              <ProtectedRoute roles={['ADMIN', 'ACCOUNTANT']}>
                <AnalyticAccountsPage />
              </ProtectedRoute>
            }
          />
          <Route path="/master/budget"
            element={
              <ProtectedRoute roles={['ADMIN', 'ACCOUNTANT']}>
                <BudgetPage />
              </ProtectedRoute>
            }
          />

          {/* Transactions — ACCOUNTANT + ADMIN */}
          <Route path="/transactions/purchase-order"
            element={
              <ProtectedRoute roles={['ADMIN', 'ACCOUNTANT']}>
                <PurchaseOrderPage />
              </ProtectedRoute>
            }
          />
          <Route path="/transactions/vendor-bill"
            element={
              <ProtectedRoute roles={['ADMIN', 'ACCOUNTANT']}>
                <VendorBillPage />
              </ProtectedRoute>
            }
          />
          <Route path="/transactions/sales-order"
            element={
              <ProtectedRoute roles={['ADMIN', 'ACCOUNTANT']}>
                <SalesOrderPage />
              </ProtectedRoute>
            }
          />
          <Route path="/transactions/invoice"
            element={
              <ProtectedRoute roles={['ADMIN', 'ACCOUNTANT']}>
                <InvoicePage />
              </ProtectedRoute>
            }
          />
          <Route path="/transactions/payment"
            element={
              <ProtectedRoute roles={['ADMIN', 'ACCOUNTANT']}>
                <PaymentPage />
              </ProtectedRoute>
            }
          />
          <Route path="/transactions/journal-entries"
            element={
              <ProtectedRoute roles={['ADMIN', 'ACCOUNTANT']}>
                <JournalEntriesPage />
              </ProtectedRoute>
            }
          />

          {/* Reports — ACCOUNTANT + ADMIN */}
          <Route path="/reports/balance-sheet"
            element={
              <ProtectedRoute roles={['ADMIN', 'ACCOUNTANT']}>
                <BalanceSheetPage />
              </ProtectedRoute>
            }
          />
          <Route path="/reports/profit-loss"
            element={
              <ProtectedRoute roles={['ADMIN', 'ACCOUNTANT']}>
                <ProfitLossPage />
              </ProtectedRoute>
            }
          />
          <Route path="/reports/budget"
            element={
              <ProtectedRoute roles={['ADMIN', 'ACCOUNTANT']}>
                <BudgetReportPage />
              </ProtectedRoute>
            }
          />

          {/* Portal — USER (own invoices + pay) */}
          <Route path="/my-invoices" element={<MyInvoicesPage />} />

          {/* Shared — all authenticated users */}
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ThemeProvider>
  )
}
