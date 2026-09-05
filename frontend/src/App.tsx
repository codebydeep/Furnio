import { Routes, Route, Navigate } from 'react-router-dom'
import ThemeProvider from '@/lib/ThemeProvider'
import ProtectedRoute from '@/components/ProtectedRoute'

/* Public pages */
import LandingPage      from '@/pages/LandingPage'
import LoginPage        from '@/pages/LoginPage'
import RegisterPage     from '@/pages/RegisterPage'
import UnauthorizedPage from '@/pages/UnauthorizedPage'

/* Dashboard (stub — full pages come later) */
import DashboardStub from '@/pages/DashboardStub'

export default function App() {
  return (
    <ThemeProvider>
      <Routes>
        {/* ── Public ──────────────────────────────────────────── */}
        <Route path="/"          element={<LandingPage />} />
        <Route path="/login"     element={<LoginPage />} />
        <Route path="/register"  element={<RegisterPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* ── Admin dashboard ─────────────────────────────────── */}
        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute roles={['admin']}>
              <DashboardStub />
            </ProtectedRoute>
          }
        />

        {/* ── Accountant dashboard ────────────────────────────── */}
        <Route
          path="/dashboard/accountant"
          element={
            <ProtectedRoute roles={['admin', 'accountant']}>
              <DashboardStub />
            </ProtectedRoute>
          }
        />

        {/* ── Contact portal ──────────────────────────────────── */}
        <Route
          path="/dashboard/contact"
          element={
            <ProtectedRoute roles={['admin', 'accountant', 'contact']}>
              <DashboardStub />
            </ProtectedRoute>
          }
        />

        {/* ── Master Data ─────────────────────────────────────── */}
        <Route
          path="/master/*"
          element={
            <ProtectedRoute roles={['admin', 'accountant']}>
              <DashboardStub />
            </ProtectedRoute>
          }
        />

        {/* ── Transactions ────────────────────────────────────── */}
        <Route
          path="/transactions/*"
          element={
            <ProtectedRoute roles={['admin', 'accountant']}>
              <DashboardStub />
            </ProtectedRoute>
          }
        />

        {/* ── Reports ─────────────────────────────────────────── */}
        <Route
          path="/reports/*"
          element={
            <ProtectedRoute roles={['admin', 'accountant']}>
              <DashboardStub />
            </ProtectedRoute>
          }
        />

        {/* ── Contact can only see own invoices/bills ──────────── */}
        <Route
          path="/my-invoices"
          element={
            <ProtectedRoute>
              <DashboardStub />
            </ProtectedRoute>
          }
        />

        {/* ── Catch-all → home ────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ThemeProvider>
  )
}
