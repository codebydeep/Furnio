import { useState } from 'react'
import {
  User, Lock, Eye, EyeOff,
  Loader2, CheckCircle2, Save,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store'

const ROLE_BADGE: Record<string, string> = {
  ADMIN:      'bg-purple-500/15 text-purple-400 border-purple-500/30',
  ACCOUNTANT: 'bg-blue-500/15   text-blue-400   border-blue-500/30',
  USER:       'bg-green-500/15  text-green-400  border-green-500/30',
}

export default function SettingsPage() {
  const { user } = useAuthStore()

  /* ── Profile section ──────────────────────────── */
  const [name,       setName]       = useState(user?.name ?? '')
  const [email,      setEmail]      = useState(user?.email ?? '')
  const [savingProf, setSavingProf] = useState(false)
  const [profMsg,    setProfMsg]    = useState<{ ok: boolean; text: string } | null>(null)

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault(); setSavingProf(true); setProfMsg(null)
    try {
      await api.patch(`/auth/users/${user!.id}`, { name, email })
      setProfMsg({ ok: true, text: 'Profile updated successfully.' })
    } catch (err: any) {
      setProfMsg({ ok: false, text: err.message ?? 'Update failed.' })
    } finally { setSavingProf(false) }
  }

  /* ── Password section ─────────────────────────── */
  const [currPwd,    setCurrPwd]    = useState('')
  const [newPwd,     setNewPwd]     = useState('')
  const [confPwd,    setConfPwd]    = useState('')
  const [showPwd,    setShowPwd]    = useState(false)
  const [savingPwd,  setSavingPwd]  = useState(false)
  const [pwdMsg,     setPwdMsg]     = useState<{ ok: boolean; text: string } | null>(null)

  async function handlePasswordSave(e: React.FormEvent) {
    e.preventDefault(); setPwdMsg(null)
    if (newPwd !== confPwd) {
      setPwdMsg({ ok: false, text: 'New passwords do not match.' }); return
    }
    if (newPwd.length < 8) {
      setPwdMsg({ ok: false, text: 'Password must be at least 8 characters.' }); return
    }
    setSavingPwd(true)
    try {
      await api.patch(`/auth/users/${user!.id}`, { password: newPwd })
      setPwdMsg({ ok: true, text: 'Password changed successfully.' })
      setCurrPwd(''); setNewPwd(''); setConfPwd('')
    } catch (err: any) {
      setPwdMsg({ ok: false, text: err.message ?? 'Change failed.' })
    } finally { setSavingPwd(false) }
  }

  if (!user) return null

  const initials = user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div className="db-page max-w-2xl">
      <div className="db-page-header">
        <div>
          <h1 className="db-page-title">Settings</h1>
          <p className="db-page-sub">Manage your profile and account preferences.</p>
        </div>
      </div>

      {/* ── Profile card ─────────────────────────────── */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <User size={14} /> Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Avatar + role banner */}
          <div className="flex items-center gap-4 mb-5 p-3 rounded-xl bg-[var(--surface-2)]">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="text-base">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-[var(--text)]">{user.name}</p>
              <p className="text-xs text-[var(--text-muted)]">{user.email}</p>
              <span className={`mt-1 inline-block text-xs font-semibold px-2 py-0.5 rounded-full border ${ROLE_BADGE[user.role] ?? ''}`}>
                {user.role}
              </span>
            </div>
            <div className="ml-auto text-right text-xs text-[var(--text-muted)]">
              <p>Login ID</p>
              <p className="font-mono font-medium text-[var(--text)]">{user.loginId}</p>
            </div>
          </div>

          {profMsg && (
            <div className={`flex items-center gap-2 text-xs mb-3 px-3 py-2 rounded-lg border ${
              profMsg.ok
                ? 'bg-green-500/10 text-green-400 border-green-500/20'
                : 'bg-red-500/10 text-red-400 border-red-500/20'
            }`}>
              {profMsg.ok && <CheckCircle2 size={13} />}
              {profMsg.text}
            </div>
          )}

          <form onSubmit={handleProfileSave} className="grid grid-cols-2 gap-3">
            <div className="auth-field">
              <label className="auth-label">Full Name</label>
              <input className="auth-input" value={name}
                onChange={e => setName(e.target.value)} required />
            </div>
            <div className="auth-field">
              <label className="auth-label">Email Address</label>
              <input type="email" className="auth-input" value={email}
                onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="auth-field">
              <label className="auth-label">Login ID</label>
              <input className="auth-input" value={user.loginId} disabled
                title="Login ID cannot be changed" />
            </div>
            <div className="auth-field">
              <label className="auth-label">Role</label>
              <input className="auth-input" value={user.role} disabled />
            </div>
            <div className="col-span-2 flex justify-end">
              <Button type="submit" size="sm" className="gap-1.5" disabled={savingProf}>
                {savingProf
                  ? <><Loader2 size={13} className="animate-spin mr-1" />Saving…</>
                  : <><Save size={13} /> Save Profile</>}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* ── Change password ──────────────────────────── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Lock size={14} /> Change Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pwdMsg && (
            <div className={`flex items-center gap-2 text-xs mb-3 px-3 py-2 rounded-lg border ${
              pwdMsg.ok
                ? 'bg-green-500/10 text-green-400 border-green-500/20'
                : 'bg-red-500/10 text-red-400 border-red-500/20'
            }`}>
              {pwdMsg.ok && <CheckCircle2 size={13} />}
              {pwdMsg.text}
            </div>
          )}
          <form onSubmit={handlePasswordSave} className="space-y-3">
            <div className="auth-field">
              <label className="auth-label">Current Password</label>
              <div className="auth-input-wrap">
                <input type={showPwd ? 'text' : 'password'} className="auth-input"
                  value={currPwd} onChange={e => setCurrPwd(e.target.value)} required />
                <button type="button" className="auth-eye" onClick={() => setShowPwd(v => !v)}>
                  {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="auth-field">
                <label className="auth-label">New Password</label>
                <input type={showPwd ? 'text' : 'password'} className="auth-input"
                  placeholder="Min. 8 characters"
                  value={newPwd} onChange={e => setNewPwd(e.target.value)} required />
              </div>
              <div className="auth-field">
                <label className="auth-label">Confirm New Password</label>
                <input type={showPwd ? 'text' : 'password'} className="auth-input"
                  value={confPwd} onChange={e => setConfPwd(e.target.value)} required />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" size="sm" className="gap-1.5" disabled={savingPwd}>
                {savingPwd
                  ? <><Loader2 size={13} className="animate-spin mr-1" />Changing…</>
                  : <><Lock size={13} /> Change Password</>}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
