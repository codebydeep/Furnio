/* Partner / trusted-by logos strip — mirrors the reference image */
export default function LogosStrip() {
  const logos = [
    'LogoIpsum', 'Logoipsum', 'IPSUM', 'logo ipsum', 'LOCO', 'Logiq',
  ]

  return (
    <section className="lp-logos-section" id="logos">
      <p className="lp-logos-label">Trusted by 10,000+ Teams Worldwide</p>
      <div className="lp-logos-row">
        {logos.map((name) => (
          <div key={name} className="lp-logo-item">
            {/* Generic wordmark pill — replace with real SVGs as needed */}
            <span className="lp-logo-text">{name}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
