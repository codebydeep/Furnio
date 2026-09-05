import { useEffect, useState } from 'react'
import {
  Users, Plus, X, Loader2, Search, Archive, RefreshCw,
  Phone, Mail, MapPin, Pencil,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { useContactStore, type Contact, type ContactPayload, type ContactType } from '@/store'

const TYPE_BADGE: Record<ContactType, string> = {
  CUSTOMER: 'bg-blue-500/15  text-blue-400  border-blue-500/30',
  VENDOR:   'bg-orange-500/15 text-orange-400 border-orange-500/30',
  BOTH:     'bg-purple-500/15 text-purple-400 border-purple-500/30',
}

const EMPTY: ContactPayload = {
  name: '', type: 'CUSTOMER', email: '', mobile: '',
  city: '', state: '', pincode: '',
}

export default function ContactsPage() {
  const {
    contacts, loading, error,
    fetchAll, create, update, archive, unarchive, clearError,
  } = useContactStore()

  const [search,       setSearch]       = useState('')
  const [showArchived, setShowArchived] = useState(false)
  const [showForm,     setShowForm]     = useState(false)
  const [editing,      setEditing]      = useState<Contact | null>(null)
  const [form,         setForm]         = useState<ContactPayload>(EMPTY)
  const [saving,       setSaving]       = useState(false)
  const [formErr,      setFormErr]      = useState('')

  useEffect(() => { fetchAll(showArchived) }, [showArchived]) // eslint-disable-line

  function openCreate() {
    setEditing(null)
    setForm(EMPTY)
    setFormErr('')
    setShowForm(true)
  }

  function openEdit(c: Contact) {
    setEditing(c)
    setForm({
      name: c.name, type: c.type, email: c.email, mobile: c.mobile,
      city: c.city, state: c.state, pincode: c.pincode,
    })
    setFormErr('')
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormErr('')
    setSaving(true)
    try {
      if (editing) {
        await update(editing.id, form)
      } else {
        await create(form)
      }
      setShowForm(false)
    } catch (err: any) {
      setFormErr(err.message ?? 'Operation failed.')
    } finally {
      setSaving(false)
    }
  }

  async function toggleArchive(c: Contact) {
    if (c.isArchived) await unarchive(c.id)
    else await archive(c.id)
  }

  const filtered = contacts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.mobile.includes(search)
  )

  const field = (label: string, key: keyof ContactPayload, type = 'text', required = false) => (
    <div className="auth-field">
      <label className="auth-label">{label}{required && <span className="text-red-400 ml-0.5">*</span>}</label>
      <input
        className="auth-input"
        type={type}
        value={form[key] as string}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        required={required}
      />
    </div>
  )

  return (
    <div className="db-page">
      <div className="db-page-header">
        <div>
          <h1 className="db-page-title">Contacts</h1>
          <p className="db-page-sub">Manage customers, vendors and combined contacts.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline" size="sm"
            className="gap-1.5"
            onClick={() => setShowArchived(v => !v)}
          >
            {showArchived ? <RefreshCw size={13} /> : <Archive size={13} />}
            {showArchived ? 'Hide Archived' : 'Show Archived'}
          </Button>
          <Button size="sm" className="gap-1.5" onClick={openCreate}>
            {showForm ? <X size={13} /> : <Plus size={13} />}
            New Contact
          </Button>
        </div>
      </div>

      {/* ── Inline Form ─────────────────────────────── */}
      {showForm && (
        <Card className="mb-4">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-[var(--text)]">
                {editing ? `Edit — ${editing.name}` : 'New Contact'}
              </span>
              <button onClick={() => setShowForm(false)} className="text-[var(--text-muted)] hover:text-[var(--text)]">
                <X size={15} />
              </button>
            </div>
            {formErr && (
              <div className="auth-error mb-3">
                <span>{formErr}</span>
                <button onClick={() => setFormErr('')} className="auth-error-close">✕</button>
              </div>
            )}
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {field('Name',    'name',    'text', true)}
              {field('Email',   'email',   'email')}
              {field('Mobile',  'mobile',  'tel')}
              {field('City',    'city')}
              {field('State',   'state')}
              {field('Pincode', 'pincode')}
              <div className="auth-field">
                <label className="auth-label">Type <span className="text-red-400">*</span></label>
                <select
                  className="auth-input"
                  value={form.type}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value as ContactType }))}
                >
                  <option value="CUSTOMER">Customer</option>
                  <option value="VENDOR">Vendor</option>
                  <option value="BOTH">Both</option>
                </select>
              </div>
              <div className="col-span-2 sm:col-span-3 flex justify-end gap-2 pt-1">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" size="sm" disabled={saving}>
                  {saving ? <><Loader2 size={13} className="animate-spin mr-1" />Saving…</> : (editing ? 'Update' : 'Create')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* ── Search bar ──────────────────────────────── */}
      <div className="relative mb-3">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
        <input
          className="auth-input pl-8 w-full max-w-xs"
          placeholder="Search by name, email or mobile…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* ── Error ───────────────────────────────────── */}
      {error && (
        <div className="auth-error mb-3">
          <span>{error}</span>
          <button onClick={clearError} className="auth-error-close">✕</button>
        </div>
      )}

      {/* ── Table ───────────────────────────────────── */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 size={24} className="animate-spin text-[var(--accent)]" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 p-12 text-[var(--text-muted)]">
              <Users size={32} className="opacity-30" />
              <p className="text-sm">No contacts found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-5">Contact</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="pr-5 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(c => (
                  <TableRow key={c.id} className={c.isArchived ? 'opacity-50' : ''}>
                    <TableCell className="pl-5">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="text-[10px]">
                            {c.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium text-[var(--text)]">{c.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${TYPE_BADGE[c.type]}`}>
                        {c.type}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                        <Mail size={11} />{c.email || '—'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                        <Phone size={11} />{c.mobile || '—'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                        <MapPin size={11} />
                        {[c.city, c.state].filter(Boolean).join(', ') || '—'}
                      </span>
                    </TableCell>
                    <TableCell className="pr-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(c)}
                          className="p-1.5 rounded hover:bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                          title="Edit"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => toggleArchive(c)}
                          className="p-1.5 rounded hover:bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                          title={c.isArchived ? 'Unarchive' : 'Archive'}
                        >
                          {c.isArchived ? <RefreshCw size={13} /> : <Archive size={13} />}
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
