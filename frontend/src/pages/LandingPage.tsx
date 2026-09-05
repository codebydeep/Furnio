import LocomotiveProvider from '@/lib/LocomotiveProvider'
import Navbar from '@/components/Navbar'
import HeroSection from '@/components/HeroSection'
import ActorsSection from '@/components/ActorsSection'
import MasterDataSection from '@/components/MasterDataSection'
import TransactionFlowSection from '@/components/TransactionFlowSection'
import SystemEngineSection from '@/components/SystemEngineSection'

export default function LandingPage() {
  return (
    <LocomotiveProvider>
      {/*
        Navbar is position:fixed z-index:1000 — it lives inside the
        scroll container but is NOT inside a data-scroll-section,
        so Locomotive's translate transform never moves it.
      */}
      <Navbar />

      {/*
        Each section is its own data-scroll-section.
        Locomotive measures each one independently — no overlap.
      */}
      <section data-scroll-section>
        <HeroSection />
      </section>

      <section data-scroll-section>
        <ActorsSection />
      </section>

      <section data-scroll-section>
        <MasterDataSection />
      </section>

      <section data-scroll-section>
        <TransactionFlowSection />
      </section>

      <section data-scroll-section>
        <SystemEngineSection />
      </section>
    </LocomotiveProvider>
  )
}
