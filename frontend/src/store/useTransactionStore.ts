import { create } from 'zustand'
import { api, request } from '@/lib/api'

/* ── Shared ──────────────────────────────────────────────────── */
export type DocStatus     = 'DRAFT' | 'CONFIRMED' | 'DONE' | 'CANCELLED'
export type PaymentStatus = 'UNPAID' | 'PARTIAL' | 'PAID'
export type PaymentDirection = 'RECEIVED' | 'SEND'
// Legacy aliases used in some pages
export type TxnStatus    = DocStatus
export type PaymentMethod = 'BANK' | 'CASH'

export interface OrderLine {
  productId:   number
  productName: string
  quantity:    number
  unitPrice:   number
  tax:         number   // taxRate percentage
  subtotal:    number
}

/* ── Purchase Order ─────────────────────────────────────────── */
export interface PurchaseOrder {
  id:         number
  poNumber:   string
  vendorId:   number
  vendor:     { id: number; name: string }
  poDate:     string
  status:     DocStatus
  items:      any[]
  bill?:      VendorBill | null
  // computed helpers for display
  vendorName: string
  date:       string
  lines:      OrderLine[]
  total:      number
  billId?:    number
}

/* ── Vendor Bill ─────────────────────────────────────────────── */
export interface VendorBill {
  id:            number
  poId:          number
  po:            any
  billDate:      string
  dueDate:       string
  amount:        number
  paymentStatus: PaymentStatus
  payments:      Payment[]
  // computed helpers
  vendorName:    string
  invoiceDate:   string
  lines:         OrderLine[]
  total:         number
  amountDue:     number
  status:        string
  paymentId?:    number
}

/* ── Sales Order ─────────────────────────────────────────────── */
export interface SalesOrder {
  id:           number
  soNumber:     string
  customerId:   number
  customer:     { id: number; name: string }
  soDate:       string
  status:       DocStatus
  items:        any[]
  invoice?:     CustomerInvoice | null
  // computed helpers
  customerName: string
  date:         string
  lines:        OrderLine[]
  total:        number
  taxTotal:     number
  grandTotal:   number
  invoiceId?:   number
}

/* ── Customer Invoice ────────────────────────────────────────── */
export interface CustomerInvoice {
  id:             number
  soId:           number
  so:             any
  invoiceDate:    string
  dueDate:        string
  amount:         number
  paymentStatus:  PaymentStatus
  payments:       Payment[]
  // computed helpers
  customerId:     number
  customerName:   string
  lines:          OrderLine[]
  total:          number
  taxTotal:       number
  grandTotal:     number
  amountDue:      number
  status:         string
  paymentId?:     number
}

/* ── Payment ─────────────────────────────────────────────────── */
export interface Payment {
  id:                number
  direction:         PaymentDirection
  journalId:         number
  journal:           { id: number; name: string; type: string } | null
  amount:            number
  date:              string
  vendorBillId:      number | null
  customerInvoiceId: number | null
  journalEntryId:    number | null
  // display helpers used by PaymentPage
  type:              'inbound' | 'outbound'
  method:            'bank' | 'cash'
  invoiceId?:        number | null
  billId?:           number | null
  reference?:        string
}

/* ── Helpers ─────────────────────────────────────────────────── */
function normPO(raw: any): PurchaseOrder {
  const lines: OrderLine[] = (raw.items ?? []).map((i: any) => ({
    productId:   i.productId,
    productName: i.product?.name ?? '',
    quantity:    Number(i.quantity),
    unitPrice:   Number(i.unitPrice),
    tax:         0,
    subtotal:    Number(i.quantity) * Number(i.unitPrice),
  }))
  return {
    ...raw,
    vendorName: raw.vendor?.name ?? '',
    date:       raw.poDate?.slice(0, 10) ?? '',
    lines,
    total:      lines.reduce((s, l) => s + l.subtotal, 0),
    billId:     raw.bill?.id ?? undefined,
  }
}

function normBill(raw: any): VendorBill {
  const vendor  = raw.po?.vendor
  const items   = raw.po?.items ?? []
  const lines: OrderLine[] = items.map((i: any) => ({
    productId:   i.productId,
    productName: i.product?.name ?? '',
    quantity:    Number(i.quantity),
    unitPrice:   Number(i.unitPrice),
    tax:         0,
    subtotal:    Number(i.quantity) * Number(i.unitPrice),
  }))
  const total      = Number(raw.amount)
  const totalPaid  = (raw.payments ?? []).reduce((s: number, p: any) => s + Number(p.amount), 0)
  return {
    ...raw,
    vendorName:  vendor?.name ?? '',
    invoiceDate: raw.billDate?.slice(0, 10) ?? '',
    dueDate:     raw.dueDate?.slice(0, 10) ?? '',
    lines,
    total,
    amountDue:   raw.paymentStatus === 'PAID' ? 0 : total - totalPaid,
    paymentStatus: raw.paymentStatus,
    status:        String(raw.paymentStatus ?? 'UNPAID').toLowerCase(),
    paymentId:   raw.payments?.[0]?.id,
  }
}

function normSO(raw: any): SalesOrder {
  const lines: OrderLine[] = (raw.items ?? []).map((i: any) => ({
    productId:   i.productId,
    productName: i.product?.name ?? '',
    quantity:    Number(i.quantity),
    unitPrice:   Number(i.unitPrice),
    tax:         Number(i.taxRate ?? 0),
    subtotal:    Number(i.quantity) * Number(i.unitPrice),
  }))
  const subTotal   = lines.reduce((s, l) => s + l.subtotal, 0)
  const taxTotal   = lines.reduce((s, l) => s + l.subtotal * l.tax / 100, 0)
  return {
    ...raw,
    customerName: raw.customer?.name ?? '',
    date:         raw.soDate?.slice(0, 10) ?? '',
    lines,
    total:        subTotal,
    taxTotal,
    grandTotal:   subTotal + taxTotal,
    invoiceId:    raw.invoice?.id ?? undefined,
  }
}

function normInvoice(raw: any): CustomerInvoice {
  const customer = raw.so?.customer
  const items    = raw.so?.items ?? []
  const lines: OrderLine[] = items.map((i: any) => ({
    productId:   i.productId,
    productName: i.product?.name ?? '',
    quantity:    Number(i.quantity),
    unitPrice:   Number(i.unitPrice),
    tax:         Number(i.taxRate ?? 0),
    subtotal:    Number(i.quantity) * Number(i.unitPrice),
  }))
  const subTotal  = lines.reduce((s, l) => s + l.subtotal, 0)
  const taxTotal  = lines.reduce((s, l) => s + l.subtotal * l.tax / 100, 0)
  const total     = Number(raw.amount)
  const totalPaid = (raw.payments ?? []).reduce((s: number, p: any) => s + Number(p.amount), 0)
  return {
    ...raw,
    customerId:   customer?.id ?? 0,
    customerName: customer?.name ?? '',
    lines,
    total:        subTotal,
    taxTotal,
    grandTotal:   total,
    amountDue:    raw.paymentStatus === 'PAID' ? 0 : total - totalPaid,
    paymentStatus: raw.paymentStatus,
    status:        String(raw.paymentStatus ?? 'UNPAID').toLowerCase(),
    paymentId:    raw.payments?.[0]?.id,
    invoiceDate:  raw.invoiceDate?.slice(0, 10) ?? '',
    dueDate:      raw.dueDate?.slice(0, 10) ?? '',
  }
}

function normPayment(raw: any): Payment {
  const method = raw.journal?.type === 'CASH' ? 'cash' : 'bank'
  return {
    ...raw,
    amount:     Number(raw.amount),
    date:       raw.date?.slice(0, 10) ?? '',
    type:       raw.direction === 'RECEIVED' ? 'inbound' : 'outbound',
    method,
    invoiceId:  raw.customerInvoiceId,
    billId:     raw.vendorBillId,
    reference:  raw.customerInvoice?.so?.soNumber
      ?? raw.vendorBill?.po?.poNumber
      ?? '',
  }
}

/* ── Store ───────────────────────────────────────────────────── */
interface TransactionState {
  purchaseOrders:   PurchaseOrder[]
  vendorBills:      VendorBill[]
  salesOrders:      SalesOrder[]
  customerInvoices: CustomerInvoice[]
  payments:         Payment[]
  loading:          boolean
  error:            string | null

  fetchPurchaseOrders:  () => Promise<void>
  createPurchaseOrder:  (payload: { vendorId: number; poDate?: string; items: { productId: number; quantity: number; unitPrice: number; analyticAccountId?: number }[] }) => Promise<PurchaseOrder | null>
  confirmPurchaseOrder: (id: number) => Promise<boolean>
  createBillFromPO:     (poId: number) => Promise<VendorBill | null>

  fetchVendorBills: () => Promise<void>
  payBill:          (billId: number, payload: { journalId?: number; journalType?: 'BANK' | 'CASH'; amount: number; date?: string }) => Promise<boolean>

  fetchSalesOrders:  () => Promise<void>
  createSalesOrder:  (payload: { customerId: number; soDate?: string; items: { productId: number; quantity: number; unitPrice: number; taxRate?: number; analyticAccountId?: number }[] }) => Promise<SalesOrder | null>
  confirmSalesOrder: (id: number) => Promise<boolean>
  createInvoice:     (soId: number) => Promise<CustomerInvoice | null>

  fetchInvoices:  () => Promise<void>
  payInvoice:     (invoiceId: number, payload: { journalId?: number; journalType?: 'BANK' | 'CASH'; amount: number; date?: string }) => Promise<boolean>

  fetchPayments:  (params?: { from?: string; to?: string }) => Promise<void>

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
    const [data, err] = await request<any[]>(() => api.get('/purchase-orders'))
    if (err) { set({ error: err.message, loading: false }); return }
    set({ purchaseOrders: (data ?? []).map(normPO), loading: false })
  },

  createPurchaseOrder: async (payload) => {
    set({ loading: true, error: null })
    const [data, err] = await request<{ order: any }>(() =>
      api.post('/purchase-orders', payload)
    )
    if (err) { set({ error: err.message, loading: false }); return null }
    const po = normPO(data!.order)
    set(s => ({ purchaseOrders: [po, ...s.purchaseOrders], loading: false }))
    return po
  },

  confirmPurchaseOrder: async (id) => {
    const [data, err] = await request<{ order: any }>(() =>
      api.patch(`/purchase-orders/${id}/confirm`)
    )
    if (err) { set({ error: err.message }); return false }
    const po = normPO(data!.order)
    set(s => ({ purchaseOrders: s.purchaseOrders.map(p => p.id === id ? po : p) }))
    return true
  },

  createBillFromPO: async (poId) => {
    set({ loading: true, error: null })
    const [data, err] = await request<{ bill: any }>(() =>
      api.post(`/purchase-orders/${poId}/create-bill`)
    )
    if (err) { set({ error: err.message, loading: false }); return null }
    const bill = normBill(data!.bill)
    set(s => ({
      vendorBills:    [bill, ...s.vendorBills],
      purchaseOrders: s.purchaseOrders.map(po =>
        po.id === poId ? { ...po, billId: bill.id, status: 'DONE' as DocStatus } : po
      ),
      loading: false,
    }))
    return bill
  },

  /* ── Vendor Bills ─────────────────────────────────────────── */
  fetchVendorBills: async () => {
    set({ loading: true, error: null })
    const [data, err] = await request<any[]>(() => api.get('/vendor-bills'))
    if (err) { set({ error: err.message, loading: false }); return }
    set({ vendorBills: (data ?? []).map(normBill), loading: false })
  },

  payBill: async (billId, payload) => {
    set({ loading: true, error: null })
    const [, err] = await request(() =>
      api.post(`/vendor-bills/${billId}/payments`, payload)
    )
    if (err) { set({ error: err.message, loading: false }); return false }
    // Re-fetch to get updated status
    const [data2] = await request<any[]>(() => api.get('/vendor-bills'))
    if (data2) set({ vendorBills: data2.map(normBill) })
    set({ loading: false })
    return true
  },

  /* ── Sales Orders ─────────────────────────────────────────── */
  fetchSalesOrders: async () => {
    set({ loading: true, error: null })
    const [data, err] = await request<any[]>(() => api.get('/sales-orders'))
    if (err) { set({ error: err.message, loading: false }); return }
    set({ salesOrders: (data ?? []).map(normSO), loading: false })
  },

  createSalesOrder: async (payload) => {
    set({ loading: true, error: null })
    const [data, err] = await request<{ order: any }>(() =>
      api.post('/sales-orders', payload)
    )
    if (err) { set({ error: err.message, loading: false }); return null }
    const so = normSO(data!.order)
    set(s => ({ salesOrders: [so, ...s.salesOrders], loading: false }))
    return so
  },

  confirmSalesOrder: async (id) => {
    const [data, err] = await request<{ order: any }>(() =>
      api.patch(`/sales-orders/${id}/confirm`)
    )
    if (err) { set({ error: err.message }); return false }
    const so = normSO(data!.order)
    set(s => ({ salesOrders: s.salesOrders.map(o => o.id === id ? so : o) }))
    return true
  },

  createInvoice: async (soId) => {
    set({ loading: true, error: null })
    const [data, err] = await request<{ invoice: any }>(() =>
      api.post(`/sales-orders/${soId}/create-invoice`)
    )
    if (err) { set({ error: err.message, loading: false }); return null }
    const inv = normInvoice(data!.invoice)
    set(s => ({
      customerInvoices: [inv, ...s.customerInvoices],
      salesOrders:      s.salesOrders.map(so =>
        so.id === soId ? { ...so, invoiceId: inv.id, status: 'DONE' as DocStatus } : so
      ),
      loading: false,
    }))
    return inv
  },

  /* ── Customer Invoices ────────────────────────────────────── */
  fetchInvoices: async () => {
    set({ loading: true, error: null })
    const [data, err] = await request<any[]>(() => api.get('/customer-invoices'))
    if (err) { set({ error: err.message, loading: false }); return }
    set({ customerInvoices: (data ?? []).map(normInvoice), loading: false })
  },

  payInvoice: async (invoiceId, payload) => {
    set({ loading: true, error: null })
    const [, err] = await request(() =>
      api.post(`/customer-invoices/${invoiceId}/payments`, payload)
    )
    if (err) { set({ error: err.message, loading: false }); return false }
    const [data2] = await request<any[]>(() => api.get('/customer-invoices'))
    if (data2) set({ customerInvoices: data2.map(normInvoice) })
    set({ loading: false })
    return true
  },

  /* ── Payments ─────────────────────────────────────────────── */
  fetchPayments: async (params) => {
    set({ loading: true, error: null })
    const [data, err] = await request<any[]>(() =>
      api.get('/payments', { params })
    )
    if (err) { set({ error: err.message, loading: false }); return }
    set({ payments: (data ?? []).map(normPayment), loading: false })
  },

  clearError: () => set({ error: null }),
}))
