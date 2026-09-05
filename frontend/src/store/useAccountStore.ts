import { create } from 'zustand'
import { api, request } from '@/lib/api'

export type AccountType = 'asset' | 'liability' | 'income' | 'expense' | 'capital'

export interface Account {
  id: number
  name: string
  type: AccountType
  code?: string
  isArchived: boolean
}

export type AccountPayload = Omit<Account, 'id' | 'isArchived'>

interface AccountState {
  accounts:  Account[]
  selected:  Account | null
  loading:   boolean
  error:     string | null

  fetchAll:  () => Promise<void>
  fetchOne:  (id: number) => Promise<void>
  create:    (payload: AccountPayload) => Promise<Account | null>
  update:    (id: number, payload: Partial<AccountPayload>) => Promise<boolean>
  archive:   (id: number) => Promise<boolean>

  /* helpers — pre-filtered by type for dropdowns */
  byType:    (type: AccountType) => Account[]
  clearError: () => void
}

export const useAccountStore = create<AccountState>((set, get) => ({
  accounts: [],
  selected: null,
  loading:  false,
  error:    null,

  fetchAll: async () => {
    set({ loading: true, error: null })
    const [data, err] = await request<Account[]>(() => api.get('/accounts'))
    if (err) { set({ error: err.message, loading: false }); return }
    set({ accounts: data!, loading: false })
  },

  fetchOne: async (id) => {
    set({ loading: true, error: null })
    const [data, err] = await request<Account>(() => api.get(`/accounts/${id}`))
    if (err) { set({ error: err.message, loading: false }); return }
    set({ selected: data!, loading: false })
  },

  create: async (payload) => {
    set({ loading: true, error: null })
    const [data, err] = await request<Account>(() => api.post('/accounts', payload))
    if (err) { set({ error: err.message, loading: false }); return null }
    set(s => ({ accounts: [...s.accounts, data!], loading: false }))
    return data!
  },

  update: async (id, payload) => {
    set({ loading: true, error: null })
    const [data, err] = await request<Account>(() => api.patch(`/accounts/${id}`, payload))
    if (err) { set({ error: err.message, loading: false }); return false }
    set(s => ({
      accounts: s.accounts.map(a => a.id === id ? data! : a),
      selected: s.selected?.id === id ? data! : s.selected,
      loading: false,
    }))
    return true
  },

  archive: async (id) => {
    const [, err] = await request(() => api.post(`/accounts/${id}/archive`))
    if (err) { set({ error: err.message }); return false }
    set(s => ({ accounts: s.accounts.map(a => a.id === id ? { ...a, isArchived: true } : a) }))
    return true
  },

  byType: (type) => get().accounts.filter(a => a.type === type && !a.isArchived),

  clearError: () => set({ error: null }),
}))
