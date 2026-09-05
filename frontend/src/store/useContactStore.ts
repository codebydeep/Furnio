import { create } from 'zustand'
import { api, request } from '@/lib/api'

export type ContactType = 'CUSTOMER' | 'VENDOR' | 'BOTH'

export interface Contact {
  id:           number
  name:         string
  type:         ContactType
  email:        string
  mobile:       string
  city:         string
  state:        string
  pincode:      string
  profileImage: string | null
  archived:     boolean
  /** Alias so existing pages that use isArchived still work */
  isArchived:   boolean
  createdAt:    string
}

export type ContactPayload = {
  name:    string
  type:    ContactType
  email:   string
  mobile:  string
  city:    string
  state:   string
  pincode: string
}

interface ContactState {
  contacts:  Contact[]
  loading:   boolean
  error:     string | null

  fetchAll:   (includeArchived?: boolean) => Promise<void>
  create:     (payload: ContactPayload) => Promise<Contact | null>
  update:     (id: number, payload: Partial<ContactPayload>) => Promise<boolean>
  archive:    (id: number) => Promise<boolean>
  unarchive:  (id: number) => Promise<boolean>
  clearError: () => void
}

/** Normalise API response to include isArchived alias */
function norm(c: any): Contact {
  return { ...c, isArchived: c.archived ?? false }
}

export const useContactStore = create<ContactState>((set) => ({
  contacts: [],
  loading:  false,
  error:    null,

  fetchAll: async (includeArchived = false) => {
    set({ loading: true, error: null })
    const [data, err] = await request<Contact[]>(() =>
      api.get('/contacts', { params: { archived: includeArchived } })
    )
    if (err) { set({ error: err.message, loading: false }); return }
    set({ contacts: (data ?? []).map(norm), loading: false })
  },

  create: async (payload) => {
    set({ loading: true, error: null })
    const [data, err] = await request<{ contact: Contact }>(() =>
      api.post('/contacts', payload)
    )
    if (err) { set({ error: err.message, loading: false }); return null }
    const c = norm(data!.contact)
    set(s => ({ contacts: [c, ...s.contacts], loading: false }))
    return c
  },

  update: async (id, payload) => {
    set({ loading: true, error: null })
    const [data, err] = await request<{ contact: Contact }>(() =>
      api.patch(`/contacts/${id}`, payload)
    )
    if (err) { set({ error: err.message, loading: false }); return false }
    const c = norm(data!.contact)
    set(s => ({
      contacts: s.contacts.map(ct => ct.id === id ? c : ct),
      loading: false,
    }))
    return true
  },

  archive: async (id) => {
    const [data, err] = await request<{ contact: Contact }>(() =>
      api.patch(`/contacts/${id}/archive`)
    )
    if (err) { set({ error: err.message }); return false }
    const c = norm(data!.contact)
    set(s => ({ contacts: s.contacts.map(ct => ct.id === id ? c : ct) }))
    return true
  },

  unarchive: async (id) => {
    // archive endpoint is a toggle
    const [data, err] = await request<{ contact: Contact }>(() =>
      api.patch(`/contacts/${id}/archive`)
    )
    if (err) { set({ error: err.message }); return false }
    const c = norm(data!.contact)
    set(s => ({ contacts: s.contacts.map(ct => ct.id === id ? c : ct) }))
    return true
  },

  clearError: () => set({ error: null }),
}))
