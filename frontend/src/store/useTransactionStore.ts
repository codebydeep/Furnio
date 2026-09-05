import { create } from 'zustand'
import { api, request } from '@/lib/api'

/* ── Shared ──────────────────────────────────────────────────── */
export type TxnStatus = 'draft' | 'confirmed' | 'done' | 'cancelled'
export type PaymentMethod = 'bank' | 'cash'

export interface OrderLine {
  productId:   number
  productName: string
  quantity:    number
  unitPrice:   number
  tax:         number   // percentage, e.g. 18
  subtotal:    number
}

/* ── Purchase Order ─────────────────────────────────────────── */
export interface PurchaseOrder {
  id:         number
  vendorId:   number
  vendorName: string
  date:       string
  lines:      OrderLine[]
  total:      number
  status:     TxnStatus
  billId?:    number
}

/* ── Vendor Bill ─────────────────────────────────────────────── */
export interface VendorBill {
  id:          number
  purchaseOrderId: number
  vendorId:    number
  vendorName:  string
  invoiceDate: string
  dueDate:     string
  lines:       OrderLine[]
  total:       number
  amountDue:   number
  status:      TxnStatus
  paymentId?:  number
}

/* ── Sales Order ─────────────────────────────────────────────── */
export interface SalesOrder {
  id:           number
  customerId:   number
  customerName: string
  date:         string
  lines:        OrderLine[]
  total:        number
  taxTotal:     number
  grandTotal:   number
  status:       TxnStatus
  invoiceId?:   number
}

/* ── Customer Invoice ────────────────────────────────────────── */
export interface CustomerInvoice {
  id:            number
  salesOrderId:  number
  customerId:    number
  customerName:  string
  invoiceDate:   string
  dueDate:       string
  lines:         OrderLine[]
  total:         number
  taxTotal:      number
  grandTotal:    number
  amountDue:     number
  status:        TxnStatus
  paymentId?:    number
}

/* ── Payment ─────────────────────────────────────────────────── */
export interface Payment {
  id:            number
  type:          'inbound' | 'outbound'
  method:        PaymentMethod
  amount:        number
  date:          string
  reference:     string
  invoiceId?:    number
  billId?:       number
  journalEntryId: number
}

/* ── Store ───────────────────────────────────────────────────── */
interface TransactionState {
  purchaseOrders:    PurchaseOrder[]
  vendorBills:       VendorBill[]
  salesOrders:       SalesOrder[]
  customerInvoices:  CustomerInvoice[]
  payments:          Payment[]
  loading:           boolean
  error:             string | null

  /* Purchase */
  fetchPurchaseOrders: () => Promise<void>
  createPurchaseOrder: (payload: Omit<PurchaseOrder,'id'|'status'|'billId'>) => Promise<PurchaseOrder | null>
  convertToBill:       (poId: number) => Promise<VendorBill | null>

  /* Vendor Bill */
  fetchVendorBills:  () => Promise<void>
  payBill:           (billId: number, method: PaymentMethod) => Promise<Payment | null>

  /* Sales */
  fetchSalesOrders:  () => Promise<void>
  createSalesOrder:  (payload: Omit<SalesOrder,'id'|'status'|'invoiceId'|'taxTotal'|'grandTotal'>) => Promise<SalesOrder | null>
  createInvoice:     (soId: number) => Promise<CustomerInvoice | null>

  /* Customer Invoice */
  fetchInvoices:     () => Promise<void>
  payInvoice:        (invoiceId: number, method: PaymentMethod) => Promise<Payment | null>

  /* Payments */
  fetchPayments:     (params?: { from?: string; to?: string }) => Promise<void>

  clearError: () => void
}

export const useTransactionStore = create<TransactionState>((set) => ({
  purchaseOrders:   [],
  vendorBills:      [],
  salesOrders:      [],
  customerInvoices: [],
  payments:         [],
  loading:          false,
  error:            null,

  /* ── Purchase Orders ──────────────────────────────────────── */
  fetchPurchaseOrders: async () => {
    set({ loading: true, error: null })
    const [data, err] = await request<PurchaseOrder[]>(() => api.get('/purchase-orders'))
    if (err) { set({ error: err.message, loading: false }); return }
    set({ purchaseOrders: data!, loading: false })
  },

  createPurchaseOrder: async (payload) => {
    set({ loading: true, error: null })
    const [data, err] = await request<PurchaseOrder>(() => api.post('/purchase-orders', payload))
    if (err) { set({ error: err.message, loading: false }); return null }
    set(s => ({ purchaseOrders: [data!, ...s.purchaseOrders], loading: false }))
    return data!
  },

  convertToBill: async (poId) => {
    set({ loading: true, error: null })
    const [data, err] = await request<VendorBill>(() =>
      api.post(`/purchase-orders/${poId}/convert-to-bill`)
    )
    if (err) { set({ error: err.message, loading: false }); return null }
    set(s => ({
      vendorBills: [data!, ...s.vendorBills],
      purchaseOrders: s.purchaseOrders.map(po =>
        po.id === poId ? { ...po, billId: data!.id, status: 'done' as TxnStatus } : po
      ),
      loading: false,
    }))
    return data!
  },

  /* ── Vendor Bills ─────────────────────────────────────────── */
  fetchVendorBills: async () => {
    set({ loading: true, error: null })
    const [data, err] = await request<VendorBill[]>(() => api.get('/vendor-bills'))
    if (err) { set({ error: err.message, loading: false }); return }
    set({ vendorBills: data!, loading: false })
  },

  payBill: async (billId, method) => {
    set({ loading: true, error: null })
    const [data, err] = await request<Payment>(() =>
      api.post(`/vendor-bills/${billId}/pay`, { method })
    )
    if (err) { set({ error: err.message, loading: false }); return null }
    set(s => ({
      payments: [data!, ...s.payments],
      vendorBills: s.vendorBills.map(b =>
        b.id === billId ? { ...b, paymentId: data!.id, status: 'done' as TxnStatus, amountDue: 0 } : b
      ),
      loading: false,
    }))
    return data!
  },

  /* ── Sales Orders ─────────────────────────────────────────── */
  fetchSalesOrders: async () => {
    set({ loading: true, error: null })
    const [data, err] = await request<SalesOrder[]>(() => api.get('/sales-orders'))
    if (err) { set({ error: err.message, loading: false }); return }
    set({ salesOrders: data!, loading: false })
  },

  createSalesOrder: async (payload) => {
    set({ loading: true, error: null })
    const [data, err] = await request<SalesOrder>(() => api.post('/sales-orders', payload))
    if (err) { set({ error: err.message, loading: false }); return null }
    set(s => ({ salesOrders: [data!, ...s.salesOrders], loading: false }))
    return data!
  },

  createInvoice: async (soId) => {
    set({ loading: true, error: null })
    const [data, err] = await request<CustomerInvoice>(() =>
      api.post(`/sales-orders/${soId}/create-invoice`)
    )
    if (err) { set({ error: err.message, loading: false }); return null }
    set(s => ({
      customerInvoices: [data!, ...s.customerInvoices],
      salesOrders: s.salesOrders.map(so =>
        so.id === soId ? { ...so, invoiceId: data!.id, status: 'done' as TxnStatus } : so
      ),
      loading: false,
    }))
    return data!
  },

  /* ── Customer Invoices ────────────────────────────────────── */
  fetchInvoices: async () => {
    set({ loading: true, error: null })
    const [data, err] = await request<CustomerInvoice[]>(() => api.get('/invoices'))
    if (err) { set({ error: err.message, loading: false }); return }
    set({ customerInvoices: data!, loading: false })
  },

  payInvoice: async (invoiceId, method) => {
    set({ loading: true, error: null })
    const [data, err] = await request<Payment>(() =>
      api.post(`/invoices/${invoiceId}/pay`, { method })
    )
    if (err) { set({ error: err.message, loading: false }); return null }
    set(s => ({
      payments: [data!, ...s.payments],
      customerInvoices: s.customerInvoices.map(inv =>
        inv.id === invoiceId ? { ...inv, paymentId: data!.id, status: 'done' as TxnStatus, amountDue: 0 } : inv
      ),
      loading: false,
    }))
    return data!
  },

  /* ── Payments ─────────────────────────────────────────────── */
  fetchPayments: async (params) => {
    set({ loading: true, error: null })
    const [data, err] = await request<Payment[]>(() =>
      api.get('/payments', { params })
    )
    if (err) { set({ error: err.message, loading: false }); return }
    set({ payments: data!, loading: false })
  },

  clearError: () => set({ error: null }),
}))
