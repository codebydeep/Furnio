import Navbar          from '@/components/Navbar'
import HeroSection    from '@/components/HeroSection'
import FeaturesSection from '@/components/FeaturesSection'
import Footer         from '@/components/Footer'

export default function LandingPage() {
  return (
    <div className="landing-root min-h-screen flex flex-col bg-[var(--lp-bg)] text-[var(--lp-text)] transition-colors duration-300">
      {/* Fixed Navbar at the top */}
      <Navbar />

      <main className="flex-1">
        {/* 1. Home UI Page */}
        <section id="home">
          <HeroSection />
        </section>

        {/* 2. Features Section (Directly below Home when scrolling) */}
        <section id="features" className="scroll-mt-20">
          <FeaturesSection />
        </section>
      </main>

      {/* 3. Footer (Directly below Features when scrolling) */}
      <div id="footer" className="scroll-mt-20">
        <Footer />
      </div>
    </div>
  )
}
