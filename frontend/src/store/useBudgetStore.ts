import { create } from 'zustand'
import { api, request } from '@/lib/api'

export type AnalyticType = 'income' | 'expense'

export interface AnalyticAccount {
  id:   number
  name: string
  type: AnalyticType
}

export interface Budget {
  id:                number
  name:              string
  periodStart:       string   // ISO date
  periodEnd:         string
  responsiblePerson: string
  lines:             BudgetLine[]
}

export interface BudgetLine {
  analyticAccountId:   number
  analyticAccountName: string
  plannedAmount:       number
  actualAmount:        number   // computed by system
  variance:            number   // planned - actual
}

interface BudgetState {
  analyticAccounts: AnalyticAccount[]
  budgets:          Budget[]
  selected:         Budget | null
  loading:          boolean
  error:            string | null

  fetchAnalyticAccounts: () => Promise<void>
  createAnalyticAccount: (payload: Omit<AnalyticAccount,'id'>) => Promise<AnalyticAccount | null>

  fetchBudgets:  () => Promise<void>
  fetchBudget:   (id: number) => Promise<void>
  createBudget:  (payload: Omit<Budget,'id'>) => Promise<Budget | null>
  updateBudget:  (id: number, payload: Partial<Omit<Budget,'id'>>) => Promise<boolean>

  clearError: () => void
}

export const useBudgetStore = create<BudgetState>((set) => ({
  analyticAccounts: [],
  budgets:          [],
  selected:         null,
  loading:          false,
  error:            null,

  fetchAnalyticAccounts: async () => {
    set({ loading: true, error: null })
    const [data, err] = await request<AnalyticAccount[]>(() => api.get('/analytic-accounts'))
    if (err) { set({ error: err.message, loading: false }); return }
    set({ analyticAccounts: data!, loading: false })
  },

  createAnalyticAccount: async (payload) => {
    set({ loading: true, error: null })
    const [data, err] = await request<AnalyticAccount>(() =>
      api.post('/analytic-accounts', payload)
    )
    if (err) { set({ error: err.message, loading: false }); return null }
    set(s => ({ analyticAccounts: [...s.analyticAccounts, data!], loading: false }))
    return data!
  },

  fetchBudgets: async () => {
    set({ loading: true, error: null })
    const [data, err] = await request<Budget[]>(() => api.get('/budgets'))
    if (err) { set({ error: err.message, loading: false }); return }
    set({ budgets: data!, loading: false })
  },

  fetchBudget: async (id) => {
    set({ loading: true, error: null })
    const [data, err] = await request<Budget>(() => api.get(`/budgets/${id}`))
    if (err) { set({ error: err.message, loading: false }); return }
    set({ selected: data!, loading: false })
  },

  createBudget: async (payload) => {
    set({ loading: true, error: null })
    const [data, err] = await request<Budget>(() => api.post('/budgets', payload))
    if (err) { set({ error: err.message, loading: false }); return null }
    set(s => ({ budgets: [data!, ...s.budgets], loading: false }))
    return data!
  },

  updateBudget: async (id, payload) => {
    set({ loading: true, error: null })
    const [data, err] = await request<Budget>(() => api.patch(`/budgets/${id}`, payload))
    if (err) { set({ error: err.message, loading: false }); return false }
    set(s => ({
      budgets: s.budgets.map(b => b.id === id ? data! : b),
      selected: s.selected?.id === id ? data! : s.selected,
      loading: false,
    }))
    return true
  },

  clearError: () => set({ error: null }),
}))
