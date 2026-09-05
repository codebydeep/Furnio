import { Routes, Route, Navigate } from 'react-router-dom'
import ThemeProvider      from '@/lib/ThemeProvider'
import ProtectedRoute     from '@/components/ProtectedRoute'
import DashboardLayout    from '@/components/dashboard/DashboardLayout'

/* Public pages */
import LandingPage        from '@/pages/LandingPage'
import LoginPage          from '@/pages/LoginPage'
import RegisterPage       from '@/pages/RegisterPage'
import UnauthorizedPage   from '@/pages/UnauthorizedPage'

/* Dashboard pages */
import DashboardHome      from '@/pages/dashboard/DashboardHome'
import PlaceholderPage    from '@/pages/dashboard/PlaceholderPage'

export default function App() {
  return (
    <ThemeProvider>
      <Routes>
        {/* ── Public ───────────────────────────────────────────── */}
        <Route path="/"            element={<LandingPage />} />
        <Route path="/login"       element={<LoginPage />} />
        <Route path="/register"    element={<RegisterPage />} />
        <Route path="/unauthorized"element={<UnauthorizedPage />} />

        {/* ── Protected: all dashboard routes share DashboardLayout */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* Main dashboard */}
          <Route path="/dashboard"           element={<DashboardHome />} />

          {/* Role-specific dashboard redirects → same home */}
          <Route path="/dashboard/admin"      element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard/accountant" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard/contact"    element={<Navigate to="/dashboard" replace />} />

          {/* Master Data */}
          <Route path="/master/contacts"  element={<PlaceholderPage />} />
          <Route path="/master/products"  element={<PlaceholderPage />} />
          <Route path="/master/coa"       element={<PlaceholderPage />} />
          <Route path="/master/journals"  element={<PlaceholderPage />} />
          <Route path="/master/budget"    element={<PlaceholderPage />} />

          {/* Transactions */}
          <Route path="/transactions/purchase-order" element={<PlaceholderPage />} />
          <Route path="/transactions/vendor-bill"    element={<PlaceholderPage />} />
          <Route path="/transactions/sales-order"    element={<PlaceholderPage />} />
          <Route path="/transactions/invoice"        element={<PlaceholderPage />} />
          <Route path="/transactions/payment"        element={<PlaceholderPage />} />

          {/* Reports */}
          <Route path="/reports/balance-sheet" element={<PlaceholderPage />} />
          <Route path="/reports/profit-loss"   element={<PlaceholderPage />} />
          <Route path="/reports/budget"        element={<PlaceholderPage />} />

          {/* Contact portal */}
          <Route path="/my-invoices" element={<PlaceholderPage />} />

          {/* Settings */}
          <Route path="/settings"    element={<PlaceholderPage />} />
        </Route>

        {/* ── Catch-all → home ─────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ThemeProvider>
  )
}
