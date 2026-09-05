import { Link, useNavigate } from 'react-router-dom'
import { ShieldOff } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'

export default function UnauthorizedPage() {
  const navigate = useNavigate()
  const { user }  = useAuthStore()

  function goBack() {
    if (user?.role === 'ADMIN')           navigate('/dashboard')
    else if (user?.role === 'ACCOUNTANT') navigate('/dashboard')
    else navigate('/dashboard')
  }

  return (
    <div className="error-page">
      <div className="error-icon"><ShieldOff size={40} /></div>
      <h1 className="error-title">Access Denied</h1>
      <p className="error-sub">You don't have permission to view this page.</p>
      <div className="error-actions">
        <button onClick={goBack} className="auth-submit" style={{ maxWidth: 200 }}>
          Go to Dashboard
        </button>
        <Link to="/" className="auth-link">Back to Home</Link>
      </div>
    </div>
  )
}
