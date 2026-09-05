/**
 * Seed file — run with: npx prisma db seed
 *
 * Creates:
 *  • Default Chart of Accounts (8 rows)
 *  • 4 Journals (Sales, Purchase, Bank, Cash) linked to accounts above
 *  • 2 Analytic Accounts (Sales Revenue, Operations Expense)
 *  • 1 Admin user (admin / Admin@123!)  ← change in prod
 */

import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma/client.ts'
import bcrypt from 'bcryptjs'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const db      = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database…')

  /* ── Chart of Accounts ──────────────────────────────────── */
  const coaData = [
    { name: 'Cash A/c',                type: 'ASSET'     },
    { name: 'Bank A/c',                type: 'ASSET'     },
    { name: 'Accounts Receivable',     type: 'ASSET'     },
    { name: 'Accounts Payable',        type: 'LIABILITY' },
    { name: 'Sales Income A/c',        type: 'INCOME'    },
    { name: 'Purchase Expense A/c',    type: 'EXPENSE'   },
    { name: 'Tax Payable',             type: 'LIABILITY' },
    { name: 'Owner Equity',            type: 'CAPITAL'   },
  ]

  const accounts = {}
  for (const row of coaData) {
    const existing = await db.account.findFirst({ where: { name: row.name } })
    if (existing) {
      accounts[row.name] = existing
      console.log(`  ⏭  Account exists: ${row.name}`)
    } else {
      accounts[row.name] = await db.account.create({ data: row })
      console.log(`  ✅ Created account: ${row.name}`)
    }
  }

  /* ── Journals ────────────────────────────────────────────── */
  const journalData = [
    { name: 'Sales',    type: 'SALES',    defaultAccount: 'Sales Income A/c'     },
    { name: 'Purchase', type: 'PURCHASE', defaultAccount: 'Purchase Expense A/c' },
    { name: 'Bank',     type: 'BANK',     defaultAccount: 'Bank A/c'             },
    { name: 'Cash',     type: 'CASH',     defaultAccount: 'Cash A/c'             },
  ]

  for (const row of journalData) {
    const existing = await db.journal.findFirst({ where: { name: row.name } })
    if (existing) {
      console.log(`  ⏭  Journal exists: ${row.name}`)
    } else {
      await db.journal.create({
        data: {
          name:            row.name,
          type:            row.type,
          defaultAccountId: accounts[row.defaultAccount]?.id ?? null,
        },
      })
      console.log(`  ✅ Created journal: ${row.name}`)
    }
  }

  /* ── Analytic Accounts ───────────────────────────────────── */
  const analyticData = [
    { name: 'Sales Revenue',       type: 'INCOME'  },
    { name: 'Operations Expense',  type: 'EXPENSE' },
  ]

  for (const row of analyticData) {
    const existing = await db.analyticAccount.findFirst({ where: { name: row.name } })
    if (existing) {
      console.log(`  ⏭  Analytic account exists: ${row.name}`)
    } else {
      await db.analyticAccount.create({ data: row })
      console.log(`  ✅ Created analytic account: ${row.name}`)
    }
  }

  /* ── Default Admin user ──────────────────────────────────── */
  const existingAdmin = await db.user.findFirst({ where: { role: 'ADMIN' } })
  if (existingAdmin) {
    console.log(`  ⏭  Admin user exists: ${existingAdmin.loginId}`)
  } else {
    const hashed = await bcrypt.hash('Admin@123!', 10)
    await db.user.create({
      data: {
        name:     'Administrator',
        loginId:  'admin',
        email:    'admin@dealflow.local',
        password: hashed,
        role:     'ADMIN',
      },
    })
    console.log('  ✅ Created admin user (admin / Admin@123!)')
  }

  console.log('✅ Seeding complete.')
}

main()
  .catch(err => { console.error('❌ Seed error:', err); process.exit(1) })
  .finally(() => db.$disconnect())
