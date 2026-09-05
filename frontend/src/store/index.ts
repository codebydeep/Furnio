/**
 * Store barrel — import any store from '@/store'
 */
export { useAuthStore, selectUser, selectRole, selectIsAdmin, selectLoggedIn } from './useAuthStore'
export type { AuthUser, UserRole } from './useAuthStore'

export { useContactStore }     from './useContactStore'
export type { Contact, ContactType, ContactPayload } from './useContactStore'

export { useProductStore }     from './useProductStore'
export type { Product, ProductType, ProductPayload } from './useProductStore'

export { useAccountStore }     from './useAccountStore'
export type { Account, AccountType, AccountPayload } from './useAccountStore'

export { useJournalStore }     from './useJournalStore'
export type { Journal, JournalEntry, JournalItem, JournalType, JournalEntryStatus } from './useJournalStore'

export { useTransactionStore } from './useTransactionStore'
export type {
  PurchaseOrder, VendorBill,
  SalesOrder, CustomerInvoice,
  Payment, OrderLine,
  DocStatus, TxnStatus, PaymentStatus, PaymentDirection, PaymentMethod,
} from './useTransactionStore'

export { useBudgetStore }      from './useBudgetStore'
export type { Budget, BudgetLine, BudgetPayload, AnalyticAccount, AnalyticType, BudgetStatus } from './useBudgetStore'

export { useReportStore }      from './useReportStore'
export type {
  BalanceSheet, BalanceSheetRow,
  ProfitLoss, PLRow,
  BudgetReport, BudgetReportLine,
} from './useReportStore'
