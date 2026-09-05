import { Routes, Route, Navigate } from 'react-router-dom'
import ThemeProvider    from '@/lib/ThemeProvider'
import ProtectedRoute   from '@/components/ProtectedRoute'
import DashboardLayout  from '@/components/dashboard/DashboardLayout'

import LandingPage      from '@/pages/LandingPage'
import LoginPage        from '@/pages/LoginPage'
import RegisterPage     from '@/pages/RegisterPage'
import UnauthorizedPage from '@/pages/UnauthorizedPage'

import DashboardHome    from '@/pages/dashboard/DashboardHome'
import PlaceholderPage  from '@/pages/dashboard/PlaceholderPage'
import UsersPage        from '@/pages/dashboard/UsersPage'

export default function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/"             element={<LandingPage />} />
        <Route path="/login"        element={<LoginPage />} />
        <Route path="/register"     element={<RegisterPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardHome />} />

          <Route
            path="/admin/users"
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <UsersPage />
              </ProtectedRoute>
            }
          />

          <Route path="/master/contacts"  element={<PlaceholderPage />} />
          <Route path="/master/products"  element={<PlaceholderPage />} />
          <Route path="/master/coa"       element={<PlaceholderPage />} />
          <Route path="/master/journals"  element={<PlaceholderPage />} />
          <Route path="/master/budget"    element={<PlaceholderPage />} />

          <Route path="/transactions/purchase-order" element={<PlaceholderPage />} />
          <Route path="/transactions/vendor-bill"    element={<PlaceholderPage />} />
          <Route path="/transactions/sales-order"    element={<PlaceholderPage />} />
          <Route path="/transactions/invoice"        element={<PlaceholderPage />} />
          <Route path="/transactions/payment"        element={<PlaceholderPage />} />

          <Route path="/reports/balance-sheet" element={<PlaceholderPage />} />
          <Route path="/reports/profit-loss"   element={<PlaceholderPage />} />
          <Route path="/reports/budget"        element={<PlaceholderPage />} />

          <Route path="/my-invoices" element={<PlaceholderPage />} />
          <Route path="/settings"    element={<PlaceholderPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ThemeProvider>
  )
}
