import { create } from 'zustand'
import { api, request } from '@/lib/api'

export type JournalType = 'sales' | 'purchase' | 'bank' | 'cash'

export interface Journal {
  id: number
  name: string
  type: JournalType
  defaultDebitAccountId:  number
  defaultCreditAccountId: number
}

export interface JournalItem {
  accountId: number
  accountName: string
  debit:  number
  credit: number
  label?: string
}

export interface JournalEntry {
  id: number
  journalId:   number
  journalName: string
  date:        string
  reference:   string
  items:       JournalItem[]
  totalDebit:  number
  totalCredit: number
  status:      'draft' | 'posted'
}

interface JournalState {
  journals:  Journal[]
  entries:   JournalEntry[]
  selected:  JournalEntry | null
  loading:   boolean
  error:     string | null

  /* Journals */
  fetchJournals: () => Promise<void>
  createJournal: (payload: Omit<Journal,'id'>) => Promise<Journal | null>

  /* Journal Entries */
  fetchEntries:  (params?: { journalId?: number; from?: string; to?: string }) => Promise<void>
  fetchEntry:    (id: number) => Promise<void>
  createEntry:   (payload: Omit<JournalEntry,'id'|'totalDebit'|'totalCredit'>) => Promise<JournalEntry | null>
  postEntry:     (id: number) => Promise<boolean>

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
    set({ journals: data!, loading: false })
  },

  createJournal: async (payload) => {
    set({ loading: true, error: null })
    const [data, err] = await request<Journal>(() => api.post('/journals', payload))
    if (err) { set({ error: err.message, loading: false }); return null }
    set(s => ({ journals: [...s.journals, data!], loading: false }))
    return data!
  },

  fetchEntries: async (params) => {
    set({ loading: true, error: null })
    const [data, err] = await request<JournalEntry[]>(() =>
      api.get('/journal-entries', { params })
    )
    if (err) { set({ error: err.message, loading: false }); return }
    set({ entries: data!, loading: false })
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
    const [data, err] = await request<JournalEntry>(() =>
      api.post('/journal-entries', payload)
    )
    if (err) { set({ error: err.message, loading: false }); return null }
    set(s => ({ entries: [data!, ...s.entries], loading: false }))
    return data!
  },

  postEntry: async (id) => {
    set({ loading: true, error: null })
    const [data, err] = await request<JournalEntry>(() =>
      api.post(`/journal-entries/${id}/post`)
    )
    if (err) { set({ error: err.message, loading: false }); return false }
    set(s => ({
      entries: s.entries.map(e => e.id === id ? data! : e),
      selected: s.selected?.id === id ? data! : s.selected,
      loading: false,
    }))
    return true
  },

  clearError: () => set({ error: null }),
}))
