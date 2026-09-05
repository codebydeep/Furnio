import { create } from 'zustand'
import { api, request } from '@/lib/api'

export type AnalyticType  = 'INCOME' | 'EXPENSE'
export type BudgetStatus  = 'DRAFT' | 'CONFIRMED' | 'REVISED' | 'DONE'

export interface AnalyticAccount {
  id:   number
  name: string
  type: AnalyticType
}

export interface BudgetLine {
  id:              number
  startDate:       string
  endDate:         string
  committedAmount: number
  allocatedAmount: number
}

export interface Budget {
  id:                number
  name:              string
  budgetType:        string
  periodStart:       string
  periodEnd:         string
  responsiblePerson: string
  status:            BudgetStatus
  analyticAccountId: number
  analyticAccount:   AnalyticAccount
  lines:             BudgetLine[]
}

export type BudgetPayload = {
  name:              string
  budgetType?:       string
  periodStart:       string
  periodEnd:         string
  responsiblePerson: string
  analyticAccountId: number
  accountId?:        number
  lines?: {
    startDate:       string
    endDate:         string
    committedAmount: number
    allocatedAmount: number
  }[]
}

interface BudgetState {
  analyticAccounts: AnalyticAccount[]
  budgets:          Budget[]
  selected:         Budget | null
  loading:          boolean
  error:            string | null

  fetchAnalyticAccounts:  () => Promise<void>
  createAnalyticAccount:  (payload: { name: string; type: AnalyticType }) => Promise<AnalyticAccount | null>
  updateAnalyticAccount:  (id: number, payload: Partial<{ name: string; type: AnalyticType }>) => Promise<boolean>

  fetchBudgets:    () => Promise<void>
  fetchBudget:     (id: number) => Promise<void>
  createBudget:    (payload: BudgetPayload) => Promise<Budget | null>
  updateBudget:    (id: number, payload: Partial<BudgetPayload>) => Promise<boolean>
  confirmBudget:   (id: number) => Promise<boolean>
  reviseBudget:    (id: number) => Promise<boolean>
  markBudgetDone:  (id: number) => Promise<boolean>

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
    set({ analyticAccounts: data ?? [], loading: false })
  },

  createAnalyticAccount: async (payload) => {
    set({ loading: true, error: null })
    const [data, err] = await request<{ account: AnalyticAccount }>(() =>
      api.post('/analytic-accounts', payload)
    )
    if (err) { set({ error: err.message, loading: false }); return null }
    const aa = data!.account
    set(s => ({ analyticAccounts: [...s.analyticAccounts, aa], loading: false }))
    return aa
  },

  updateAnalyticAccount: async (id, payload) => {
    const [data, err] = await request<{ account: AnalyticAccount }>(() =>
      api.patch(`/analytic-accounts/${id}`, payload)
    )
    if (err) { set({ error: err.message }); return false }
    set(s => ({
      analyticAccounts: s.analyticAccounts.map(a => a.id === id ? data!.account : a),
    }))
    return true
  },

  fetchBudgets: async () => {
    set({ loading: true, error: null })
    const [data, err] = await request<Budget[]>(() => api.get('/budgets'))
    if (err) { set({ error: err.message, loading: false }); return }
    set({ budgets: data ?? [], loading: false })
  },

  fetchBudget: async (id) => {
    set({ loading: true, error: null })
    const [data, err] = await request<Budget>(() => api.get(`/budgets/${id}`))
    if (err) { set({ error: err.message, loading: false }); return }
    set({ selected: data!, loading: false })
  },

  createBudget: async (payload) => {
    set({ loading: true, error: null })
    const [data, err] = await request<{ budget: Budget }>(() =>
      api.post('/budgets', payload)
    )
    if (err) { set({ error: err.message, loading: false }); return null }
    const b = data!.budget
    set(s => ({ budgets: [b, ...s.budgets], loading: false }))
    return b
  },

  updateBudget: async (id, payload) => {
    set({ loading: true, error: null })
    const [data, err] = await request<{ budget: Budget }>(() =>
      api.patch(`/budgets/${id}`, payload)
    )
    if (err) { set({ error: err.message, loading: false }); return false }
    const b = data!.budget
    set(s => ({
      budgets:  s.budgets.map(bgt => bgt.id === id ? b : bgt),
      selected: s.selected?.id === id ? b : s.selected,
      loading:  false,
    }))
    return true
  },

  confirmBudget: async (id) => {
    const [data, err] = await request<{ budget: Budget }>(() =>
      api.patch(`/budgets/${id}/confirm`)
    )
    if (err) { set({ error: err.message }); return false }
    set(s => ({ budgets: s.budgets.map(b => b.id === id ? data!.budget : b) }))
    return true
  },

  reviseBudget: async (id) => {
    const [data, err] = await request<{ budget: Budget }>(() =>
      api.patch(`/budgets/${id}/revise`)
    )
    if (err) { set({ error: err.message }); return false }
    set(s => ({ budgets: s.budgets.map(b => b.id === id ? data!.budget : b) }))
    return true
  },

  markBudgetDone: async (id) => {
    const [data, err] = await request<{ budget: Budget }>(() =>
      api.patch(`/budgets/${id}/done`)
    )
    if (err) { set({ error: err.message }); return false }
    set(s => ({ budgets: s.budgets.map(b => b.id === id ? data!.budget : b) }))
    return true
  },

  clearError: () => set({ error: null }),
}))
