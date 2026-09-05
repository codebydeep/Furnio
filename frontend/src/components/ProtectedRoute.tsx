import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import type { UserRole } from '@/store/useAuthStore'

interface Props {
  children: ReactNode
  /** If provided, only these roles can access */
  roles?: UserRole[]
}

export default function ProtectedRoute({ children, roles }: Props) {
  const { token, user } = useAuthStore()
  const location = useLocation()

  // Not logged in → /login, preserve intended path for redirect-back
  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Logged in but wrong role
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}
