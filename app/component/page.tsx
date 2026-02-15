import Hero from "@/components/sections/Hero";
import SocialProof from "@/components/sections/SocialProof";
import Problem from "@/components/sections/Problem";
import Solution from "@/components/sections/Solution";
import Modules from "@/components/sections/Modules";
import CaseStudy from "@/components/sections/CaseStudy";
import Testimonials from "@/components/sections/Testimonials";
import Pricing from "@/components/sections/Pricing";
import FAQ from "@/components/sections/FAQ";
import Instructor from "@/components/sections/Instructor";
import FinalCTA from "@/components/sections/FinalCTA";
import LeadMagnet from "@/components/sections/LeadMagnet";
import Footer from "@/components/sections/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-background font-sans">
      <Hero />
      <SocialProof />
      <Problem />
      <Solution />
      <Modules />
      <CaseStudy />
      <Testimonials />
      <Pricing />
      <FAQ />
      <Instructor />
      <FinalCTA />
      <LeadMagnet />
      <Footer />
    </main>
  );
}
