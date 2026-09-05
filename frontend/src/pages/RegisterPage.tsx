import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, BookOpen, ArrowRight, Loader2 } from 'lucide-react'
import { useAuthStore, type UserRole } from '@/store/useAuthStore'

const ROLES: { value: UserRole; label: string; desc: string }[] = [
  { value: 'admin',      label: 'Admin',           desc: 'Full access — create, modify, archive, report' },
  { value: 'accountant', label: 'Invoicing User',  desc: 'Create master data, record transactions, view reports' },
  { value: 'contact',    label: 'Contact',         desc: 'View own invoices/bills and make payments' },
]

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, user, loading, error, clearError } = useAuthStore()

  const [name,    setName]    = useState('')
  const [email,   setEmail]   = useState('')
  const [pwd,     setPwd]     = useState('')
  const [confirm, setConfirm] = useState('')
  const [role,    setRole]    = useState<UserRole>('accountant')
  const [showPwd, setShowPwd] = useState(false)
  const [localErr,setLocalErr]= useState('')

  useEffect(() => {
    if (user) {
      if (user.role === 'admin')      navigate('/dashboard/admin',      { replace: true })
      else if (user.role === 'accountant') navigate('/dashboard/accountant', { replace: true })
      else                            navigate('/dashboard/contact',    { replace: true })
    }
  }, [user, navigate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLocalErr('')
    clearError()
    if (pwd !== confirm) { setLocalErr('Passwords do not match'); return }
    if (pwd.length < 8)  { setLocalErr('Password must be at least 8 characters'); return }
    await register(name, email, pwd, role)
  }

  const displayError = localErr || error

  return (
    <div className="auth-page auth-page--register">
      <div className="auth-card auth-card--wide">
        {/* Logo */}
        <Link to="/" className="auth-logo">
          <div className="auth-logo-mark"><BookOpen size={18} /></div>
          <span className="auth-logo-name">UrbanBooks</span>
        </Link>

        <div className="auth-header">
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-sub">Set up your Urban Furniture accounting workspace</p>
        </div>

        {displayError && (
          <div className="auth-error">
            <span>{displayError}</span>
            <button onClick={() => { clearError(); setLocalErr('') }} className="auth-error-close">✕</button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Two-col grid on wide card */}
          <div className="auth-two-col">
            <div className="auth-field">
              <label className="auth-label" htmlFor="name">Full Name</label>
              <input id="name" type="text" className="auth-input"
                placeholder="Nimesh Pathak"
                value={name} onChange={e => setName(e.target.value)}
                required autoComplete="name" />
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="reg-email">Email</label>
              <input id="reg-email" type="email" className="auth-input"
                placeholder="you@urbanfurniture.com"
                value={email} onChange={e => setEmail(e.target.value)}
                required autoComplete="email" />
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="reg-pwd">Password</label>
              <div className="auth-input-wrap">
                <input id="reg-pwd" type={showPwd ? 'text' : 'password'}
                  className="auth-input" placeholder="Min. 8 characters"
                  value={pwd} onChange={e => setPwd(e.target.value)}
                  required autoComplete="new-password" />
                <button type="button" className="auth-eye"
                  onClick={() => setShowPwd(v => !v)} tabIndex={-1}>
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="confirm">Confirm Password</label>
              <input id="confirm" type="password" className="auth-input"
                placeholder="Repeat password"
                value={confirm} onChange={e => setConfirm(e.target.value)}
                required autoComplete="new-password" />
            </div>
          </div>

          {/* Role selector */}
          <div className="auth-field">
            <label className="auth-label">Your Role</label>
            <div className="auth-role-grid">
              {ROLES.map(r => (
                <button
                  key={r.value}
                  type="button"
                  className={`auth-role-card${role === r.value ? ' auth-role-card--active' : ''}`}
                  onClick={() => setRole(r.value)}
                >
                  <span className="auth-role-label">{r.label}</span>
                  <span className="auth-role-desc">{r.desc}</span>
                </button>
              ))}
            </div>
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
