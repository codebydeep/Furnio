import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, BookOpen, ArrowRight, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, user, loading, error, clearError } = useAuthStore()

  const [name,    setName]    = useState('')
  const [loginId, setLoginId] = useState('')
  const [email,   setEmail]   = useState('')
  const [pwd,     setPwd]     = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [localErr,setLocalErr]= useState('')

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true })
  }, [user, navigate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLocalErr('')
    clearError()
    if (pwd !== confirm) { setLocalErr('Passwords do not match.'); return }
    await register(name, loginId, email, pwd)
  }

  const displayError = localErr || error

  return (
    <div className="auth-page auth-page--register">
      <div className="auth-card auth-card--wide">
        <Link to="/" className="auth-logo">
          <div className="auth-logo-mark"><BookOpen size={18} /></div>
          <span className="auth-logo-name">FurNio</span>
        </Link>

        <div className="auth-header">
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-sub">Set up your FurNio accounting workspace</p>
        </div>

        {displayError && (
          <div className="auth-error">
            <span>{displayError}</span>
            <button onClick={() => { clearError(); setLocalErr('') }} className="auth-error-close">✕</button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-two-col">
            <div className="auth-field">
              <label className="auth-label" htmlFor="name">Full Name</label>
              <input id="name" type="text" className="auth-input"
                placeholder="Nimesh Pathak"
                value={name} onChange={e => setName(e.target.value)}
                required autoComplete="name" />
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="loginId">Login ID</label>
              <input id="loginId" type="text" className="auth-input"
                placeholder="nimesh_owner"
                value={loginId} onChange={e => setLoginId(e.target.value)}
                required autoComplete="username" />
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="reg-email">Email</label>
              <input id="reg-email" type="email" className="auth-input"
                placeholder="you@urbanfurniture.com"
                value={email} onChange={e => setEmail(e.target.value)}
                required autoComplete="email" />
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="confirm">Confirm Password</label>
              <input id="confirm" type="password" className="auth-input"
                placeholder="Repeat password"
                value={confirm} onChange={e => setConfirm(e.target.value)}
                required autoComplete="new-password" />
            </div>

            <div className="auth-field" style={{ gridColumn: '1 / -1' }}>
              <label className="auth-label" htmlFor="reg-pwd">Password</label>
              <div className="auth-input-wrap">
                <input id="reg-pwd" type={showPwd ? 'text' : 'password'}
                  className="auth-input" placeholder="Min. 9 chars, upper + lower + special"
                  value={pwd} onChange={e => setPwd(e.target.value)}
                  required autoComplete="new-password" />
                <button type="button" className="auth-eye"
                  onClick={() => setShowPwd(v => !v)} tabIndex={-1}>
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          </div>

          <div className="auth-info-box">
            <span className="auth-info-label">You are registering as</span>
            <strong className="auth-info-value">Business Owner (Admin)</strong>
            <p className="auth-info-desc">
              Full access — create master data, manage users, record transactions, view reports.
            </p>
          </div>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading
              ? <><Loader2 size={16} className="auth-spinner" /> Creating account…</>
              : <>Create Account <ArrowRight size={15} /></>}
          </button>
        </form>

        <p className="auth-footer-text">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
