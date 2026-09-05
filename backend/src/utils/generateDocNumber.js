/**
 * Generate auto-incrementing document numbers per year.
 * Format examples:
 *   PO/2026/0001
 *   SO/2026/0001
 *   JE/2026/0001
 *
 * Uses a DB count query so numbers are always monotonic within a year.
 */
import db from '../libs/db.js'

/**
 * @param {'PurchaseOrder'|'SalesOrder'|'JournalEntry'} model
 * @param {'PO'|'SO'|'JE'|'INV'} prefix
 */
export async function generateDocNumber(model, prefix) {
  const year  = new Date().getFullYear()
  const field = { PurchaseOrder: 'poNumber', SalesOrder: 'soNumber', JournalEntry: 'number' }[model]
  if (!field) throw new Error(`Unknown model: ${model}`)

  // Count docs created in the current calendar year
  const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`)
  const endOfYear   = new Date(`${year + 1}-01-01T00:00:00.000Z`)
  const count = await db[model[0].toLowerCase() + model.slice(1)].count({
    where: { createdAt: { gte: startOfYear, lt: endOfYear } },
  })

  const seq = String(count + 1).padStart(4, '0')
  return `${prefix}/${year}/${seq}`
}
