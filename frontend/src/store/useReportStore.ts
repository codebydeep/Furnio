import { create } from 'zustand'
import { api, request } from '@/lib/api'

/* ── Balance Sheet ─────────────────────────────────────────── */
export interface BalanceSheetRow {
  accountId:   number
  accountName: string
  accountType: string
  balance:     number
}

export interface BalanceSheet {
  asOf:             string
  assets:           BalanceSheetRow[]
  liabilities:      BalanceSheetRow[]
  capital:          BalanceSheetRow[]
  totalAssets:      number
  totalLiabilities: number
  totalCapital:     number
  balanced:         boolean
}

/* ── Profit & Loss ─────────────────────────────────────────── */
export interface PLRow {
  accountId:   number
  accountName: string
  amount:      number
}

export interface ProfitLoss {
  from:          string
  to:            string
  income:        PLRow[]
  expenses:      PLRow[]
  totalIncome:   number
  totalExpenses: number
  netProfit:     number
}

/* ── Budget Report ─────────────────────────────────────────── */
export interface BudgetReportLine {
  id:                number
  name:              string
  status:            string
  analyticAccount:   string
  analyticType:      string
  periodStart:       string
  periodEnd:         string
  responsiblePerson: string
  totalCommitted:    number
  totalAllocated:    number
  actual:            number
  achievedPercent:   number
}

export interface BudgetReport {
  budgets:        BudgetReportLine[]
  totalCommitted: number
  totalAllocated: number
  totalActual:    number
}

/* ── Store ─────────────────────────────────────────────────── */
interface ReportState {
  balanceSheet: BalanceSheet | null
  profitLoss:   ProfitLoss   | null
  budgetReport: BudgetReport | null
  loading:      boolean
  error:        string | null

  fetchBalanceSheet: (params?: { asOf?: string }) => Promise<void>
  fetchProfitLoss:   (params:  { from: string; to: string }) => Promise<void>
  fetchBudgetReport: () => Promise<void>
  clearError: () => void
}

export const useReportStore = create<ReportState>((set) => ({
  balanceSheet: null,
  profitLoss:   null,
  budgetReport: null,
  loading:      false,
  error:        null,

  fetchBalanceSheet: async (params) => {
    set({ loading: true, error: null })
    const [data, err] = await request<BalanceSheet>(() =>
      api.get('/reports/balance-sheet', { params })
    )
    if (err) { set({ error: err.message, loading: false }); return }
    set({ balanceSheet: data!, loading: false })
  },

  fetchProfitLoss: async (params) => {
    set({ loading: true, error: null })
    const [data, err] = await request<ProfitLoss>(() =>
      api.get('/reports/profit-loss', { params })
    )
    if (err) { set({ error: err.message, loading: false }); return }
    set({ profitLoss: data!, loading: false })
  },

  fetchBudgetReport: async () => {
    set({ loading: true, error: null })
    const [data, err] = await request<BudgetReport>(() =>
      api.get('/reports/budget')
    )
    if (err) { set({ error: err.message, loading: false }); return }
    set({ budgetReport: data!, loading: false })
  },

  clearError: () => set({ error: null }),
}))
