import { create } from 'zustand'
import { api, request } from '@/lib/api'

export type ProductType = 'goods' | 'service' | 'combo'

export interface Product {
  id: number
  name: string
  type: ProductType
  salesPrice: number
  cost: number
  category: string
  isArchived: boolean
}

export type ProductPayload = Omit<Product, 'id' | 'isArchived'>

interface ProductState {
  products:   Product[]
  selected:   Product | null
  loading:    boolean
  error:      string | null

  fetchAll:  (includeArchived?: boolean) => Promise<void>
  fetchOne:  (id: number) => Promise<void>
  create:    (payload: ProductPayload) => Promise<Product | null>
  update:    (id: number, payload: Partial<ProductPayload>) => Promise<boolean>
  archive:   (id: number) => Promise<boolean>
  clearError: () => void
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
    set({ products: data!, loading: false })
  },

  fetchOne: async (id) => {
    set({ loading: true, error: null })
    const [data, err] = await request<Product>(() => api.get(`/products/${id}`))
    if (err) { set({ error: err.message, loading: false }); return }
    set({ selected: data!, loading: false })
  },

  create: async (payload) => {
    set({ loading: true, error: null })
    const [data, err] = await request<Product>(() => api.post('/products', payload))
    if (err) { set({ error: err.message, loading: false }); return null }
    set(s => ({ products: [...s.products, data!], loading: false }))
    return data!
  },

  update: async (id, payload) => {
    set({ loading: true, error: null })
    const [data, err] = await request<Product>(() => api.patch(`/products/${id}`, payload))
    if (err) { set({ error: err.message, loading: false }); return false }
    set(s => ({
      products: s.products.map(p => p.id === id ? data! : p),
      selected: s.selected?.id === id ? data! : s.selected,
      loading: false,
    }))
    return true
  },

  archive: async (id) => {
    const [, err] = await request(() => api.post(`/products/${id}/archive`))
    if (err) { set({ error: err.message }); return false }
    set(s => ({ products: s.products.map(p => p.id === id ? { ...p, isArchived: true } : p) }))
    return true
  },

  clearError: () => set({ error: null }),
}))
