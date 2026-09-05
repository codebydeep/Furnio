import {
  Users,
  Package,
  BookOpen,
  Layers,
  ShoppingCart,
  Wallet,
  BarChart3,
  FileText,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const features = [
  {
    icon: Users,
    title: 'Contact Master',
    desc: 'Manage customers & vendors with name, type, email, mobile, address, and profile image.',
    badge: 'Master Data',
    accent: '#4ade80',
  },
  {
    icon: Package,
    title: 'Product Master',
    desc: 'Catalogue furniture (Goods/Service/Combo) with sales price, cost, and category.',
    badge: 'Master Data',
    accent: '#60a5fa',
  },
  {
    icon: BookOpen,
    title: 'Chart of Accounts',
    desc: 'Define all ledger accounts — Assets, Liabilities, Income, Expenses, and Capital.',
    badge: 'Master Data',
    accent: '#f472b6',
  },
  {
    icon: Layers,
    title: 'Journals',
    desc: 'Organise transactions into Sales, Purchase, Bank, and Cash journals automatically.',
    badge: 'Master Data',
    accent: '#fb923c',
  },
  {
    icon: ShoppingCart,
    title: 'Sales & Purchase Orders',
    desc: 'Create orders and convert them into invoices or vendor bills with a single click.',
    badge: 'Transactions',
    accent: '#a78bfa',
  },
  {
    icon: Wallet,
    title: 'Payment Registration',
    desc: 'Register payments against invoices and bills via Bank or Cash — ledgers update automatically.',
    badge: 'Transactions',
    accent: '#34d399',
  },
  {
    icon: BarChart3,
    title: 'Budget Tracking',
    desc: 'Set analytic accounts, define budgets by period, and monitor planned vs actual spend.',
    badge: 'Budget',
    accent: '#fbbf24',
  },
  {
    icon: FileText,
    title: 'Financial Reports',
    desc: 'Auto-generate Balance Sheet, Profit & Loss, and Budget Reports in real time.',
    badge: 'Reports',
    accent: '#f87171',
  },
]

export default function FeaturesSection() {
  return (
    <section className="features-section" id="features">
      <div className="section-header">
        <Badge variant="outline" className="section-eyebrow">Everything you need</Badge>
        <h2 className="section-title">Built for the full accounting workflow</h2>
        <p className="section-sub">
          From master data setup to real-time financial reports — every module connects
          seamlessly so nothing falls through the cracks.
        </p>
      </div>

      <div className="features-grid">
        {features.map(({ icon: Icon, title, desc, badge, accent }) => (
          <Card key={title} className="feature-card">
            <CardContent className="feature-card-content">
              <div
                className="feature-icon-wrap"
                style={{ background: `${accent}18`, border: `1px solid ${accent}30` }}
              >
                <Icon size={18} style={{ color: accent }} />
              </div>
              <div>
                <Badge variant="secondary" className="feature-badge">{badge}</Badge>
                <h3 className="feature-title">{title}</h3>
                <p className="feature-desc">{desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
