import { create } from 'zustand'
import { api, request } from '@/lib/api'

export type JournalType = 'SALES' | 'PURCHASE' | 'BANK' | 'CASH'
export type JournalEntryStatus = 'DRAFT' | 'POSTED' | 'CANCELLED'

export interface Journal {
  id:               number
  name:             string
  type:             JournalType
  defaultAccountId: number | null
  defaultAccount:   { id: number; name: string; type: string } | null
}

export interface JournalItem {
  id:               number
  accountId:        number
  account:          { id: number; name: string; type: string }
  partnerId:        number | null
  debit:            number
  credit:           number
  analyticAccountId: number | null
}

export interface JournalEntry {
  id:             number
  number:         string
  journalId:      number
  journal:        { id: number; name: string; type: string }
  partnerId:      number | null
  partner:        { id: number; name: string } | null
  accountingDate: string
  status:         JournalEntryStatus
  items:          JournalItem[]
  createdBy:      number
  createdAt:      string
}

interface JournalState {
  journals:  Journal[]
  entries:   JournalEntry[]
  selected:  JournalEntry | null
  loading:   boolean
  error:     string | null

  fetchJournals:  () => Promise<void>
  createJournal:  (payload: Omit<Journal,'id'|'defaultAccount'>) => Promise<Journal | null>

  fetchEntries:   (params?: { journalId?: number; from?: string; to?: string; status?: string }) => Promise<void>
  fetchEntry:     (id: number) => Promise<void>
  createEntry:    (payload: {
    journalId:      number
    partnerId?:     number
    accountingDate?: string
    items: { accountId: number; partnerId?: number; debit?: number; credit?: number; analyticAccountId?: number }[]
  }) => Promise<JournalEntry | null>
  postEntry:      (id: number) => Promise<boolean>
  cancelEntry:    (id: number) => Promise<boolean>

  clearError: () => void
}

export const useJournalStore = create<JournalState>((set) => ({
  journals: [],
  entries:  [],
  selected: null,
  loading:  false,
  error:    null,

  fetchJournals: async () => {
    set({ loading: true, error: null })
    const [data, err] = await request<Journal[]>(() => api.get('/journals'))
    if (err) { set({ error: err.message, loading: false }); return }
    set({ journals: data ?? [], loading: false })
  },

  createJournal: async (payload) => {
    set({ loading: true, error: null })
    const [data, err] = await request<{ journal: Journal }>(() =>
      api.post('/journals', payload)
    )
    if (err) { set({ error: err.message, loading: false }); return null }
    const j = data!.journal
    set(s => ({ journals: [...s.journals, j], loading: false }))
    return j
  },

  fetchEntries: async (params) => {
    set({ loading: true, error: null })
    const [data, err] = await request<JournalEntry[]>(() =>
      api.get('/journal-entries', { params })
    )
    if (err) { set({ error: err.message, loading: false }); return }
    set({ entries: data ?? [], loading: false })
  },

  fetchEntry: async (id) => {
    set({ loading: true, error: null })
    const [data, err] = await request<JournalEntry>(() =>
      api.get(`/journal-entries/${id}`)
    )
    if (err) { set({ error: err.message, loading: false }); return }
    set({ selected: data!, loading: false })
  },

  createEntry: async (payload) => {
    set({ loading: true, error: null })
    const [data, err] = await request<{ entry: JournalEntry }>(() =>
      api.post('/journal-entries', payload)
    )
    if (err) { set({ error: err.message, loading: false }); return null }
    const entry = data!.entry
    set(s => ({ entries: [entry, ...s.entries], loading: false }))
    return entry
  },

  postEntry: async (id) => {
    set({ loading: true, error: null })
    const [data, err] = await request<{ entry: JournalEntry }>(() =>
      api.patch(`/journal-entries/${id}/post`)
    )
    if (err) { set({ error: err.message, loading: false }); return false }
    const entry = data!.entry
    set(s => ({
      entries:  s.entries.map(e => e.id === id ? entry : e),
      selected: s.selected?.id === id ? entry : s.selected,
      loading:  false,
    }))
    return true
  },

  cancelEntry: async (id) => {
    set({ loading: true, error: null })
    const [data, err] = await request<{ entry: JournalEntry }>(() =>
      api.patch(`/journal-entries/${id}/cancel`)
    )
    if (err) { set({ error: err.message, loading: false }); return false }
    const entry = data!.entry
    set(s => ({
      entries:  s.entries.map(e => e.id === id ? entry : e),
      selected: s.selected?.id === id ? entry : s.selected,
      loading:  false,
    }))
    return true
  },

  clearError: () => set({ error: null }),
}))
