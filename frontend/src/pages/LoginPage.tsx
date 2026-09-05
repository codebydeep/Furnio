import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, BookOpen, ArrowRight, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'

export default function LoginPage() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const from      = (location.state as { from?: { pathname?: string } })?.from?.pathname ?? null

  const { login, user, loading, error, clearError } = useAuthStore()

  const [loginId,  setLoginId]  = useState('')
  const [password, setPassword] = useState('')
  const [showPwd,  setShowPwd]  = useState(false)

  useEffect(() => {
    if (user) redirectByRole(user.role)
  }, [user])

  function redirectByRole(role: string) {
    if (from) { navigate(from, { replace: true }); return }
    navigate('/dashboard', { replace: true })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    clearError()
    const ok = await login(loginId, password)
    if (ok) redirectByRole(useAuthStore.getState().user!.role)
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-logo">
          <div className="auth-logo-mark"><BookOpen size={18} /></div>
          <span className="auth-logo-name">UrbanBooks</span>
        </Link>

        <div className="auth-header">
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-sub">Sign in to your accounting workspace</p>
        </div>

        {error && (
          <div className="auth-error">
            <span>{error}</span>
            <button onClick={clearError} className="auth-error-close">✕</button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label className="auth-label" htmlFor="loginId">Login ID</label>
            <input
              id="loginId"
              type="text"
              className="auth-input"
              placeholder="your_login_id"
              value={loginId}
              onChange={e => setLoginId(e.target.value)}
              required
              autoComplete="username"
            />
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="password">Password</label>
            <div className="auth-input-wrap">
              <input
                id="password"
                type={showPwd ? 'text' : 'password'}
                className="auth-input"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button type="button" className="auth-eye" onClick={() => setShowPwd(v => !v)} tabIndex={-1}>
                {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading
              ? <><Loader2 size={16} className="auth-spinner" /> Signing in…</>
              : <>Sign In <ArrowRight size={15} /></>}
          </button>
        </form>

        <p className="auth-footer-text">
          Don't have an account?{' '}
          <Link to="/register" className="auth-link">Create one</Link>
        </p>
      </div>

      <div className="auth-panel">
        <div className="auth-panel-content">
          <div className="auth-panel-badge">Double-entry accurate</div>
          <h2 className="auth-panel-title">Your complete<br />accounting suite</h2>
          <p className="auth-panel-sub">
            Contacts · Products · Journals · Orders · Reports — all connected.
          </p>
          <div className="auth-panel-stats">
            {[
              { v: '5',    l: 'Master Modules'  },
              { v: '3',    l: 'Report Types'    },
              { v: '100%', l: 'Balanced Ledger' },
            ].map(({ v, l }) => (
              <div key={l} className="auth-panel-stat">
                <span className="auth-panel-stat-val">{v}</span>
                <span className="auth-panel-stat-lbl">{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
