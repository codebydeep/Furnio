import { Separator } from '@/components/ui/separator'
import { Link } from 'react-router-dom'

const links = {
  Product:  ['Invoice', 'Payslip', 'Reports', 'Budget Tracker'],
  Company:  ['About Us', 'Careers', 'Blog', 'Press'],
  Support:  ['Documentation', 'API Reference', 'Status'],
  Legal:    ['Privacy', 'Terms', 'Security'],
}

export default function FooterSection() {
  return (
    <footer className="lp-footer">
      <div className="lp-footer-top">
        {/* brand column */}
        <div className="lp-footer-brand">
          <Link to="/" className="lp-footer-logo-wrap">
            <div className="lp-footer-logo-mark">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.2"
                strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="M15 6l6 6-6 6" />
                <path d="M9 6L3 12l6 6" />
              </svg>
            </div>
            <span className="lp-footer-brand-name">FurNio</span>
          </Link>
          <p className="lp-footer-brand-desc">
            AI-driven finance automation for modern businesses. Invoicing, payroll, and
            accounting — all in one platform.
          </p>
          <div className="lp-footer-socials">
            {['𝕏', 'in', 'GH'].map(s => (
              <a key={s} href="#" className="lp-footer-social-btn">{s}</a>
            ))}
          </div>
        </div>

        {/* link columns */}
        <div className="lp-footer-links">
          {Object.entries(links).map(([group, items]) => (
            <div key={group} className="lp-footer-link-group">
              <p className="lp-footer-link-heading">{group}</p>
              {items.map(item => (
                <a key={item} href="#" className="lp-footer-link">{item}</a>
              ))}
            </div>
          ))}
        </div>
      </div>

      <Separator style={{ background: 'rgba(139,92,246,0.15)' }} />

      <div className="lp-footer-bottom">
        <p>© 2026 FurNio. Powered by Odoo.</p>
        <p>Made with ♥ for the Odoo Hackathon</p>
      </div>
    </footer>
  )
}
