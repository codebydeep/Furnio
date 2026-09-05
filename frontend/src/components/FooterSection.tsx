import { Separator } from '@/components/ui/separator'

const links = {
  Product: ['Features', 'Pricing', 'Changelog', 'Roadmap'],
  Company: ['About', 'Careers', 'Blog', 'Press'],
  Legal: ['Privacy', 'Terms', 'Security'],
}

export default function FooterSection() {
  return (
    <footer className="footer-section">
      <div className="footer-top">
        <div className="footer-brand">
          <div className="footer-logo">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="2" x2="12" y2="22" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
              <line x1="19.07" y1="4.93" x2="4.93" y2="19.07" />
            </svg>
          </div>
          <span className="footer-brand-name">UrbanBooks</span>
          <p className="footer-brand-desc">
            The accounting system built for modern urban furniture businesses.
          </p>
        </div>

        <div className="footer-links">
          {Object.entries(links).map(([group, items]) => (
            <div key={group} className="footer-link-group">
              <p className="footer-link-heading">{group}</p>
              {items.map(item => (
                <a key={item} href="#" className="footer-link">{item}</a>
              ))}
            </div>
          ))}
        </div>
      </div>

      <Separator className="footer-sep" />

      <div className="footer-bottom">
        <p>© 2026 UrbanBooks. Built for Urban Furniture.</p>
        <p>Made with ♥ for the Odoo Hackathon</p>
      </div>
    </footer>
  )
}
