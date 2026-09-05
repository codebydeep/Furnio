import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

const steps = [
  {
    step: '01',
    title: 'Set Up Master Data',
    desc: 'Add contacts (customers & vendors like Nimesh Pathak & Azure Furniture), products such as Office Chairs, chart of accounts, and journals.',
    accent: '#4ade80',
    tags: ['Contacts', 'Products', 'CoA', 'Journals'],
  },
  {
    step: '02',
    title: 'Record Transactions',
    desc: 'Create purchase orders from vendors, convert them to vendor bills. Create sales orders for customers and generate customer invoices.',
    accent: '#60a5fa',
    tags: ['Purchase Order', 'Vendor Bill', 'Sales Order', 'Invoice'],
  },
  {
    step: '03',
    title: 'Register Payments',
    desc: 'Link payments to invoices and bills via Bank or Cash journals. Ledgers and journal entries update automatically following double-entry rules.',
    accent: '#f472b6',
    tags: ['Bank', 'Cash', 'Journal Entries'],
  },
  {
    step: '04',
    title: 'Generate Reports',
    desc: 'Get Balance Sheet, Profit & Loss, and Budget Reports instantly for any reporting period with real-time accuracy.',
    accent: '#fbbf24',
    tags: ['Balance Sheet', 'P&L', 'Budget Report'],
  },
]

export default function WorkflowSection() {
  return (
    <section className="workflow-section" id="workflow">
      <div className="section-header">
        <Badge variant="outline" className="section-eyebrow">How it works</Badge>
        <h2 className="section-title">End-to-end in four steps</h2>
        <p className="section-sub">
          Master Data → Transactions → Payments → Reports. Clean, traceable,
          and double-entry compliant at every step.
        </p>
      </div>

      <div className="workflow-grid">
        {steps.map(({ step, title, desc, accent, tags }) => (
          <Card key={step} className="workflow-card">
            <CardContent className="workflow-card-content">
              <span className="workflow-step-num" style={{ color: accent }}>{step}</span>
              <h3 className="workflow-step-title">{title}</h3>
              <p className="workflow-step-desc">{desc}</p>
              <div className="workflow-tags">
                {tags.map(t => (
                  <span
                    key={t}
                    className="workflow-tag"
                    style={{ borderColor: `${accent}40`, color: accent, background: `${accent}10` }}
                  >
                    {t}
                  </span>
                ))}
              </div>
              <div className="workflow-accent-line" style={{ background: accent }} />
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
