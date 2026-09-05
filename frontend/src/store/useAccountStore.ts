import { create } from 'zustand'
import { api, request } from '@/lib/api'

export type AccountType =
  | 'ASSET' | 'LIABILITY' | 'EXPENSE' | 'INCOME'
  | 'CAPITAL' | 'PROFIT_AND_LOSS' | 'REVENUE' | 'OTHER_EXPENSE'

export interface Account {
  id:       number
  name:     string
  type:     AccountType
  archived: boolean
}

export type AccountPayload = { name: string; type: AccountType }

interface AccountState {
  accounts:   Account[]
  loading:    boolean
  error:      string | null

  fetchAll:   () => Promise<void>
  create:     (payload: AccountPayload) => Promise<Account | null>
  update:     (id: number, payload: Partial<AccountPayload>) => Promise<boolean>
  clearError: () => void
}

export const useAccountStore = create<AccountState>((set) => ({
  accounts: [],
  loading:  false,
  error:    null,

  fetchAll: async () => {
    set({ loading: true, error: null })
    const [data, err] = await request<Account[]>(() => api.get('/accounts'))
    if (err) { set({ error: err.message, loading: false }); return }
    set({ accounts: data ?? [], loading: false })
  },

  create: async (payload) => {
    set({ loading: true, error: null })
    const [data, err] = await request<{ account: Account }>(() =>
      api.post('/accounts', payload)
    )
    if (err) { set({ error: err.message, loading: false }); return null }
    const a = data!.account
    set(s => ({ accounts: [...s.accounts, a], loading: false }))
    return a
  },

  update: async (id, payload) => {
    set({ loading: true, error: null })
    const [data, err] = await request<{ account: Account }>(() =>
      api.patch(`/accounts/${id}`, payload)
    )
    if (err) { set({ error: err.message, loading: false }); return false }
    set(s => ({
      accounts: s.accounts.map(a => a.id === id ? data!.account : a),
      loading: false,
    }))
    return true
  },

  clearError: () => set({ error: null }),
}))
