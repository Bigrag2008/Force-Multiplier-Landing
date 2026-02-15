import Hero from './components/Hero'
import Instructor from './components/Instructor'
import Modules from './components/Modules'
import Problem from './components/Problem'
import SocialProof from './components/SocialProof'
import Testimonials from './components/Testimonials'
import FAQ from './components/FAQ'
import FinalCTA from './components/FinalCTA'
import Footer from './components/Footer'
import LeadMagnet from './components/LeadMagnet'

export default function Home() {
  return (
    <main>
      <Hero />
      <Problem />
      <SocialProof />
      <Modules />
      <Instructor />
      <Testimonials />
      <FAQ />
      <LeadMagnet />
      <FinalCTA />
      <Footer />
    </main>
  )
}
