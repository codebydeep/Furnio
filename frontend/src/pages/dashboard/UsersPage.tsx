import { useEffect, useState } from 'react'
import {
  Plus, Trash2, Loader2, X, Eye, EyeOff, ShieldCheck,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/useAuthStore'

interface User {
  id:        number
  name:      string
  loginId:   string
  email:     string
  role:      string
  contactId: number | null
  createdAt: string
}

const ROLE_BADGE: Record<string, string> = {
  ADMIN:      'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30',
  ACCOUNTANT: 'bg-blue-500/15   text-blue-600   dark:text-blue-400   border-blue-500/30',
  USER:       'bg-green-500/15  text-green-600  dark:text-green-400  border-green-500/30',
}

const ROLES = ['ADMIN', 'ACCOUNTANT', 'USER'] as const
type UserRole = typeof ROLES[number]

export default function UsersPage() {
  const { user: me } = useAuthStore()

  const [users,    setUsers]    = useState<User[]>([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')
  const [showForm, setShowForm] = useState(false)
  const [roleEditId, setRoleEditId] = useState<number | null>(null)
  const [newRole,    setNewRole]    = useState<UserRole>('ACCOUNTANT')

  // Create form state
  const [name,     setName]     = useState('')
  const [loginId,  setLoginId]  = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [role,     setRole]     = useState<UserRole>('ACCOUNTANT')
  const [showPwd,  setShowPwd]  = useState(false)
  const [formErr,  setFormErr]  = useState('')
  const [creating, setCreating] = useState(false)

  async function fetchUsers() {
    try {
      const { data } = await api.get<User[]>('/auth/users')
      setUsers(data)
    } catch {
      setError('Failed to load users.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setFormErr(''); setCreating(true)
    try {
      await api.post('/auth/users', { name, loginId, email, password, role })
      setShowForm(false)
      setName(''); setLoginId(''); setEmail(''); setPassword(''); setRole('ACCOUNTANT')
      fetchUsers()
    } catch (err: any) {
      setFormErr(err.message ?? 'Failed to create user.')
    } finally { setCreating(false) }
  }

  async function handleRoleChange(userId: number) {
    try {
      await api.patch(`/auth/users/${userId}/role`, { role: newRole })
      setRoleEditId(null)
      fetchUsers()
    } catch (err: any) {
      alert(err.message ?? 'Failed to update role.')
    }
  }

  async function handleDelete(id: number, userName: string) {
    if (!confirm(`Delete user "${userName}"? This cannot be undone.`)) return
    try {
      await api.delete(`/auth/users/${id}`)
      setUsers(prev => prev.filter(u => u.id !== id))
    } catch (err: any) {
      alert(err.message ?? 'Failed to delete user.')
    }
  }

  const adminCount      = users.filter(u => u.role === 'ADMIN').length
  const accountantCount = users.filter(u => u.role === 'ACCOUNTANT').length
  const userCount       = users.filter(u => u.role === 'USER').length

  return (
    <div className="db-page">
      <div className="db-page-header">
        <div>
          <h1 className="db-page-title">User Management</h1>
          <p className="db-page-sub">Create and manage Accountants and Portal Users (Contacts).</p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setShowForm(v => !v)}>
          {showForm ? <X size={13} /> : <Plus size={13} />}
          {showForm ? 'Cancel' : 'Create User'}
        </Button>
      </div>

      {/* ── KPI strip ────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-[var(--text-muted)]">Admins</p>
            <p className="text-2xl font-bold text-purple-400 mt-0.5">{adminCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-[var(--text-muted)]">Accountants</p>
            <p className="text-2xl font-bold text-blue-400 mt-0.5">{accountantCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-[var(--text-muted)]">Portal Users</p>
            <p className="text-2xl font-bold text-green-400 mt-0.5">{userCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Create Form ──────────────────────────────── */}
      {showForm && (
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-[var(--text)]">New User</CardTitle>
          </CardHeader>
          <CardContent>
            {formErr && (
              <div className="auth-error mb-3">
                <span>{formErr}</span>
                <button onClick={() => setFormErr('')} className="auth-error-close">✕</button>
              </div>
            )}
            <form onSubmit={handleCreate} className="grid grid-cols-2 gap-3">
              <div className="auth-field">
                <label className="auth-label">Full Name <span className="text-red-400">*</span></label>
                <input className="auth-input" placeholder="Ravi Kumar"
                  value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div className="auth-field">
                <label className="auth-label">Login ID <span className="text-red-400">*</span></label>
                <input className="auth-input" placeholder="ravi_acc"
                  value={loginId} onChange={e => setLoginId(e.target.value)} required />
              </div>
              <div className="auth-field">
                <label className="auth-label">Email <span className="text-red-400">*</span></label>
                <input type="email" className="auth-input" placeholder="ravi@company.com"
                  value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="auth-field">
                <label className="auth-label">Password <span className="text-red-400">*</span></label>
                <div className="auth-input-wrap">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    className="auth-input"
                    placeholder="Min. 9 chars + special"
                    value={password} onChange={e => setPassword(e.target.value)} required />
                  <button type="button" className="auth-eye"
                    onClick={() => setShowPwd(v => !v)} tabIndex={-1}>
                    {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              <div className="auth-field col-span-2">
                <label className="auth-label">Role <span className="text-red-400">*</span></label>
                <div className="flex gap-3 mt-1">
                  {(['ACCOUNTANT', 'USER'] as const).map(r => (
                    <button key={r} type="button" onClick={() => setRole(r)}
                      className={`auth-role-card flex-1${role === r ? ' auth-role-card--active' : ''}`}>
                      <span className="auth-role-label">
                        {r === 'ACCOUNTANT' ? 'Accountant' : 'Portal User'}
                      </span>
                      <span className="auth-role-desc text-xs">
                        {r === 'ACCOUNTANT'
                          ? 'Master data, transactions, reports'
                          : 'View own invoices & make payments'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="col-span-2 flex justify-end gap-2 pt-1">
                <Button type="button" variant="outline" size="sm"
                  onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" size="sm" disabled={creating}>
                  {creating
                    ? <><Loader2 size={13} className="animate-spin mr-1" />Creating…</>
                    : 'Create User'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {error && <p className="text-center text-[var(--text-muted)] mb-3">{error}</p>}

      {/* ── Users Table ──────────────────────────────── */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 size={24} className="animate-spin text-[var(--accent)]" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-5">User</TableHead>
                  <TableHead>Login ID</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="pr-5 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map(u => (
                  <TableRow key={u.id}>
                    <TableCell className="pl-5">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="text-[10px]">
                            {u.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium text-[var(--text)]">{u.name}</span>
                        {u.id === me?.id && (
                          <Badge variant="outline" className="text-[9px] px-1 py-0">you</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs text-[var(--text-muted)]">{u.loginId}</span>
                    </TableCell>
                    <TableCell className="text-xs text-[var(--text-muted)]">{u.email}</TableCell>
                    <TableCell>
                      {roleEditId === u.id ? (
                        <div className="flex items-center gap-1">
                          <select
                            className="auth-input py-0.5 text-xs w-28"
                            value={newRole}
                            onChange={e => setNewRole(e.target.value as UserRole)}>
                            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                          <Button size="sm" className="h-6 text-xs px-2"
                            onClick={() => handleRoleChange(u.id)}>Save</Button>
                          <button className="text-[var(--text-muted)] hover:text-[var(--text)] p-1"
                            onClick={() => setRoleEditId(null)}>
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${ROLE_BADGE[u.role] ?? ''}`}>
                          {u.role}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-[var(--text-muted)]">
                      {new Date(u.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric',
                      })}
                    </TableCell>
                    <TableCell className="pr-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {u.id !== me?.id && (
                          <>
                            <button
                              onClick={() => { setRoleEditId(u.id); setNewRole(u.role as UserRole) }}
                              className="p-1.5 rounded hover:bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                              title="Change role">
                              <ShieldCheck size={13} />
                            </button>
                            <button
                              onClick={() => handleDelete(u.id, u.name)}
                              className="p-1.5 rounded hover:bg-[var(--surface-2)] text-red-400 hover:text-red-300 transition-colors"
                              title="Delete user">
                              <Trash2 size={13} />
                            </button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-[var(--text-muted)] py-10">
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
