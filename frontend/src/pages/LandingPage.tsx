import Navbar from '@/components/Navbar'
import HeroSection from '@/components/HeroSection'
import StatsStrip from '@/components/StatsStrip'
import FeaturesSection from '@/components/FeaturesSection'
import WorkflowSection from '@/components/WorkflowSection'

export default function LandingPage() {
  return (
    <div className="landing-root">
      <Navbar />
      <HeroSection />
      <StatsStrip />
      <FeaturesSection />
      <WorkflowSection />
    </div>
  )
}
