import { Link } from 'react-router-dom'
import { Shield, BookOpen, User, Check, ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const actors = [
  {
    id: 'admin',
    icon: Shield,
    role: 'Admin',
    subtitle: 'Business Owner',
    accent: '#f59e0b',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.2)',
    tag: 'Full Access',
    description:
      'Complete control over the system — the Business Owner sets up all master data, records every transaction, archives records, and views all reports.',
    permissions: [
      'Create, Modify & Archive Master Data',
      'Record Sales & Purchase Transactions',
      'Generate all Financial Reports',
      'Manage User Roles & Contacts',
      'Set Budgets & Analytic Accounts',
      'View Journal Entries & Ledgers',
    ],
    cta: { label: 'Admin Login', to: '/login?role=admin' },
  },
  {
    id: 'accountant',
    icon: BookOpen,
    role: 'Invoicing User',
    subtitle: 'Accountant',
    accent: '#60a5fa',
    bg: 'rgba(96,165,250,0.08)',
    border: 'rgba(96,165,250,0.2)',
    tag: 'Create & Record',
    description:
      'The Accountant handles day-to-day operations — creates master data, records transactions, manages invoices & bills, and generates reports.',
    permissions: [
      'Create Contacts, Products & Journals',
      'Record Purchase & Sales Orders',
      'Generate Customer Invoices & Vendor Bills',
      'Register Payments (Bank / Cash)',
      'View all Financial Reports',
      'Create Chart of Account entries',
    ],
    cta: { label: 'Accountant Login', to: '/login?role=accountant' },
  },
  {
    id: 'contact',
    icon: User,
    role: 'Contact',
    subtitle: 'Customer / Vendor',
    accent: '#4ade80',
    bg: 'rgba(74,222,128,0.08)',
    border: 'rgba(74,222,128,0.2)',
    tag: 'Limited Access',
    description:
      'Contacts are created from the Contact Master. They can only view their own invoices or bills and make payments — nothing else is exposed.',
    permissions: [
      'View own Invoices (Customer)',
      'View own Bills (Vendor)',
      'Make Payments via Bank / Cash',
      'Download Invoice PDF',
    ],
    cta: { label: 'Contact Portal', to: '/login?role=contact' },
  },
]

export default function ActorsSection() {
  return (
    <section className="actors-section" id="actors">
      {/* Section header */}
      <div className="section-header">
        <Badge variant="outline" className="section-eyebrow">Primary Actors</Badge>
        <h2 className="section-title">Three roles, one system</h2>
        <p className="section-sub">
          Every user in FurNio has a clearly defined role — from full system
          control down to view-only portal access.
        </p>
      </div>

      {/* Cards */}
      <div className="actors-grid">
        {actors.map(({ id, icon: Icon, role, subtitle, accent, bg, border, tag, description, permissions, cta }) => (
          <div
            key={id}
            className="actor-card"
            style={{ '--actor-accent': accent, '--actor-bg': bg, '--actor-border': border } as React.CSSProperties}
          >
            {/* Top accent bar */}
            <div className="actor-card-bar" />

            {/* Header */}
            <div className="actor-card-header">
              <div className="actor-icon-wrap" style={{ background: bg, border: `1px solid ${border}` }}>
                <Icon size={22} style={{ color: accent }} />
              </div>
              <div className="actor-title-group">
                <span className="actor-tag" style={{ color: accent, background: bg, borderColor: border }}>
                  {tag}
                </span>
                <h3 className="actor-role">{role}</h3>
                <p className="actor-subtitle">{subtitle}</p>
              </div>
            </div>

            {/* Description */}
            <p className="actor-desc">{description}</p>

            {/* Divider */}
            <div className="actor-divider" />

            {/* Permissions list */}
            <ul className="actor-perms">
              {permissions.map((perm) => (
                <li key={perm} className="actor-perm-item">
                  <span className="actor-perm-dot" style={{ background: accent }}>
                    <Check size={9} strokeWidth={3} color="#000" />
                  </span>
                  <span>{perm}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <Link to={cta.to} className="actor-cta" style={{ '--actor-accent': accent } as React.CSSProperties}>
              {cta.label}
              <ArrowRight size={14} />
            </Link>
          </div>
        ))}
      </div>
    </section>
  )
}
