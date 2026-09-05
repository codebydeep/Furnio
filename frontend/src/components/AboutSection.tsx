import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'

const highlights = [
  'End-to-end double-entry accounting built for growing businesses',
  'Role-based access — Admin, Accountant, and User portals',
  'Real-time dashboard with revenue flow, invoices, and payslips',
  'Automated journal entries on every transaction',
  'GST-ready invoices, payslips, and financial reports as PDF',
  'Budget vs. actual tracking with analytic account drill-down',
]

const stats = [
  { val: '10K+', label: 'Active Teams' },
  { val: '₹2.4Cr', label: 'Processed Daily' },
  { val: '99.9%', label: 'Uptime SLA' },
  { val: '< 2s',  label: 'Report Generation' },
]

export default function AboutSection() {
  return (
    <section className="lp-about-section" id="reports">
      {/* ambient glow */}
      <div className="lp-about-glow" />

      <div className="lp-about-inner">
        {/* left — copy */}
        <div className="lp-about-copy">
          <span className="lp-section-eyebrow">About FurNio</span>
          <h2 className="lp-section-title" style={{ textAlign: 'left', marginTop: 14 }}>
            Finance automation for <br />
            <span className="lp-text-gradient">modern businesses</span>
          </h2>
          <p className="lp-section-sub" style={{ textAlign: 'left', marginTop: 14, marginBottom: 28 }}>
            FurNio is an Odoo-powered accounting SaaS that replaces spreadsheet chaos
            with automated invoicing, payroll, and reporting — all in one place.
          </p>

          <ul className="lp-about-list">
            {highlights.map((h) => (
              <li key={h} className="lp-about-list-item">
                <CheckCircle2 size={16} className="lp-about-check" />
                <span>{h}</span>
              </li>
            ))}
          </ul>

          <Link to="/register" className="lp-about-cta">
            Get Started Free <ArrowRight size={15} />
          </Link>
        </div>

        {/* right — stats grid */}
        <div className="lp-about-stats">
          {stats.map(({ val, label }) => (
            <div key={label} className="lp-about-stat-card">
              <div className="lp-about-stat-val">{val}</div>
              <div className="lp-about-stat-label">{label}</div>
            </div>
          ))}

          {/* decorative mini dashboard card */}
          <div className="lp-about-mini-card">
            <div className="lp-about-mini-row">
              <span className="lp-about-mini-label">Outstanding Invoices</span>
              <span className="lp-about-mini-badge">Live</span>
            </div>
            <div className="lp-about-mini-val">₹ 8,24,500</div>
            <div className="lp-about-mini-bar-track">
              <div className="lp-about-mini-bar-fill" style={{ width: '68%' }} />
            </div>
            <div className="lp-about-mini-sub">68% collected this month</div>
          </div>
        </div>
      </div>
    </section>
  )
}
