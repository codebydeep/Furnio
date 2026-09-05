/**
 * Role definitions and permission matrix
 *
 * ADMIN      — full access to everything
 * ACCOUNTANT — master data (contacts, products, accounts), transactions
 *              (journal entries, invoices, bills, payments), reports
 * CONTACT    — (portal user) can only view and pay their own invoices/bills
 */

export const ROLES = {
  ADMIN:      'ADMIN',
  ACCOUNTANT: 'ACCOUNTANT',
  CONTACT:    'CONTACT',
}

/**
 * Shorthand role groups used in route definitions.
 * Import these instead of hard-coding role strings in every route file.
 *
 * Usage:
 *   router.get('/contacts', authenticate, authorize(...CAN_MANAGE_MASTER), handler)
 */

// Full system access
export const ALL_ROLES = [ROLES.ADMIN, ROLES.ACCOUNTANT, ROLES.CONTACT]

// User management — only ADMIN
export const CAN_MANAGE_USERS = [ROLES.ADMIN]

// Master data: contacts, products, chart of accounts, journals
export const CAN_MANAGE_MASTER = [ROLES.ADMIN, ROLES.ACCOUNTANT]

// Transactions: journal entries, purchase orders, sales orders
export const CAN_MANAGE_TRANSACTIONS = [ROLES.ADMIN, ROLES.ACCOUNTANT]

// Invoices & bills (create, confirm, manage)
export const CAN_MANAGE_INVOICES = [ROLES.ADMIN, ROLES.ACCOUNTANT]

// Payments (record and view)
export const CAN_MANAGE_PAYMENTS = [ROLES.ADMIN, ROLES.ACCOUNTANT]

// Reports and accounting dashboard
export const CAN_VIEW_REPORTS = [ROLES.ADMIN, ROLES.ACCOUNTANT]

// Portal: CONTACT can only see/pay their own invoices — handled separately
// via ownership check in controller (req.user.contactId === invoice.so.customerId)
export const PORTAL_ONLY = [ROLES.CONTACT]
