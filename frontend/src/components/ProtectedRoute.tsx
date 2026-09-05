import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import type { UserRole } from '@/store/useAuthStore'

/* ─────────────────────────────────────────────────────────────
   DEMO MODE — set to true to bypass all auth checks.
   Revert: flip back to false (or delete this line).
───────────────────────────────────────────────────────────── */
const DEMO_MODE = true

interface Props {
  children: ReactNode
  roles?: UserRole[]
}

export default function ProtectedRoute({ children }: Props) {
  const { token, user } = useAuthStore()
  const location = useLocation()

  // Skip auth when demo mode is on
  if (DEMO_MODE) return <>{children}</>

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
