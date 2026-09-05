import { create } from 'zustand'
import { api, request } from '@/lib/api'

export type ProductType = 'GOODS' | 'SERVICE' | 'COMBO'

export interface Product {
  id:         number
  name:       string
  type:       ProductType
  salesPrice: number
  cost:       number
  category:   string | null
  archived:   boolean
  /** Alias so existing pages that use isArchived still work */
  isArchived: boolean
}

export type ProductPayload = {
  name:       string
  type:       ProductType
  salesPrice: number
  cost:       number
  category?:  string
}

interface ProductState {
  products:   Product[]
  selected:   Product | null
  loading:    boolean
  error:      string | null

  fetchAll:   (includeArchived?: boolean) => Promise<void>
  fetchOne:   (id: number) => Promise<void>
  create:     (payload: ProductPayload) => Promise<Product | null>
  update:     (id: number, payload: Partial<ProductPayload>) => Promise<boolean>
  archive:    (id: number) => Promise<boolean>
  clearError: () => void
}

function norm(p: any): Product {
  return { ...p, isArchived: p.archived ?? false }
}

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  selected: null,
  loading:  false,
  error:    null,

  fetchAll: async (includeArchived = false) => {
    set({ loading: true, error: null })
    const [data, err] = await request<Product[]>(() =>
      api.get('/products', { params: { archived: includeArchived } })
    )
    if (err) { set({ error: err.message, loading: false }); return }
    set({ products: (data ?? []).map(norm), loading: false })
  },

  fetchOne: async (id) => {
    set({ loading: true, error: null })
    const [data, err] = await request<Product>(() => api.get(`/products/${id}`))
    if (err) { set({ error: err.message, loading: false }); return }
    set({ selected: norm(data!), loading: false })
  },

  create: async (payload) => {
    set({ loading: true, error: null })
    const [data, err] = await request<{ product: Product }>(() =>
      api.post('/products', payload)
    )
    if (err) { set({ error: err.message, loading: false }); return null }
    const p = norm(data!.product)
    set(s => ({ products: [p, ...s.products], loading: false }))
    return p
  },

  update: async (id, payload) => {
    set({ loading: true, error: null })
    const [data, err] = await request<{ product: Product }>(() =>
      api.patch(`/products/${id}`, payload)
    )
    if (err) { set({ error: err.message, loading: false }); return false }
    const p = norm(data!.product)
    set(s => ({
      products: s.products.map(pr => pr.id === id ? p : pr),
      selected: s.selected?.id === id ? p : s.selected,
      loading: false,
    }))
    return true
  },

  archive: async (id) => {
    const [data, err] = await request<{ product: Product }>(() =>
      api.patch(`/products/${id}/archive`)
    )
    if (err) { set({ error: err.message }); return false }
    const p = norm(data!.product)
    set(s => ({ products: s.products.map(pr => pr.id === id ? p : pr) }))
    return true
  },

  clearError: () => set({ error: null }),
}))
