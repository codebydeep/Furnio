import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import type { UserRole } from '@/store/useAuthStore'

interface Props {
  children: ReactNode
  roles?:   UserRole[]
}

export default function ProtectedRoute({ children, roles }: Props) {
  const { token, user } = useAuthStore()
  const location = useLocation()

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (roles && !roles.includes(user.role?.toUpperCase() as UserRole)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}
