import LocomotiveProvider   from '@/lib/LocomotiveProvider'
import Navbar               from '@/components/Navbar'
import HeroSection          from '@/components/HeroSection'
import LogosStrip           from '@/components/LogosStrip'
import FeaturesSection      from '@/components/FeaturesSection'
import AboutSection         from '@/components/AboutSection'
import TransactionFlowSection from '@/components/TransactionFlowSection'
import SystemEngineSection  from '@/components/SystemEngineSection'
import FooterSection        from '@/components/FooterSection'

export default function LandingPage() {
  return (
    <LocomotiveProvider>
      {/*
        Navbar is position:fixed z-index:1000 — it lives inside the
        scroll container but is NOT inside a data-scroll-section,
        so Locomotive's translate transform never moves it.
      */}
      <Navbar />

      {/* Hero */}
      <section data-scroll-section>
        <HeroSection />
      </section>

      {/* Trusted-by logos */}
      <section data-scroll-section>
        <LogosStrip />
      </section>

      {/* Features — Invoice, Payslip, Reports … */}
      <section data-scroll-section>
        <FeaturesSection />
      </section>

      {/* About FurNio */}
      <section data-scroll-section>
        <AboutSection />
      </section>

      {/* Transaction workflow */}
      <section data-scroll-section id="workflow">
        <TransactionFlowSection />
      </section>

      {/* System / accounting engine */}
      <section data-scroll-section id="system">
        <SystemEngineSection />
      </section>

      {/* Footer */}
      <section data-scroll-section id="blog">
        <FooterSection />
      </section>
    </LocomotiveProvider>
  )
}
