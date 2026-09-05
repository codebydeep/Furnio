import { create } from 'zustand'
import { api, request } from '@/lib/api'

export type ContactType = 'customer' | 'vendor' | 'both'

export interface Contact {
  id: number
  name: string
  type: ContactType
  email: string
  mobile: string
  city: string
  state: string
  pincode: string
  profileImage?: string
  isArchived: boolean
}

export type ContactPayload = Omit<Contact, 'id' | 'isArchived'>

interface ContactState {
  contacts:   Contact[]
  selected:   Contact | null
  loading:    boolean
  error:      string | null

  fetchAll:   (includeArchived?: boolean) => Promise<void>
  fetchOne:   (id: number) => Promise<void>
  create:     (payload: ContactPayload) => Promise<Contact | null>
  update:     (id: number, payload: Partial<ContactPayload>) => Promise<boolean>
  archive:    (id: number) => Promise<boolean>
  unarchive:  (id: number) => Promise<boolean>
  clearError: () => void
}

export const useContactStore = create<ContactState>((set, get) => ({
  contacts:  [],
  selected:  null,
  loading:   false,
  error:     null,

  fetchAll: async (includeArchived = false) => {
    set({ loading: true, error: null })
    const [data, err] = await request<Contact[]>(() =>
      api.get('/contacts', { params: { archived: includeArchived } })
    )
    if (err) { set({ error: err.message, loading: false }); return }
    set({ contacts: data!, loading: false })
  },

  fetchOne: async (id) => {
    set({ loading: true, error: null })
    const [data, err] = await request<Contact>(() => api.get(`/contacts/${id}`))
    if (err) { set({ error: err.message, loading: false }); return }
    set({ selected: data!, loading: false })
  },

  create: async (payload) => {
    set({ loading: true, error: null })
    const [data, err] = await request<Contact>(() => api.post('/contacts', payload))
    if (err) { set({ error: err.message, loading: false }); return null }
    set(s => ({ contacts: [...s.contacts, data!], loading: false }))
    return data!
  },

  update: async (id, payload) => {
    set({ loading: true, error: null })
    const [data, err] = await request<Contact>(() => api.patch(`/contacts/${id}`, payload))
    if (err) { set({ error: err.message, loading: false }); return false }
    set(s => ({
      contacts: s.contacts.map(c => c.id === id ? data! : c),
      selected: s.selected?.id === id ? data! : s.selected,
      loading: false,
    }))
    return true
  },

  archive: async (id) => {
    const ok = await get().update(id, { } as any)
    if (!ok) return false
    const [, err] = await request(() => api.post(`/contacts/${id}/archive`))
    if (err) { set({ error: err.message }); return false }
    set(s => ({ contacts: s.contacts.map(c => c.id === id ? { ...c, isArchived: true } : c) }))
    return true
  },

  unarchive: async (id) => {
    const [, err] = await request(() => api.post(`/contacts/${id}/unarchive`))
    if (err) { set({ error: err.message }); return false }
    set(s => ({ contacts: s.contacts.map(c => c.id === id ? { ...c, isArchived: false } : c) }))
    return true
  },

  clearError: () => set({ error: null }),
}))
