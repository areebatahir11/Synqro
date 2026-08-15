import { LandingNav } from "@/components/landing/LandingNav";
import { Hero } from "@/components/landing/Hero";
import { FeatureSection } from "@/components/landing/FeatureSection";
import { WorkflowSection } from "@/components/landing/WorkflowSection";
import { WhySection } from "@/components/landing/WhySection";
import { CTASection } from "@/components/landing/CTASection";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-canvas">
      <LandingNav />
      <Hero />
      <FeatureSection />
      <WorkflowSection />
      <WhySection />
      <CTASection />
      <LandingFooter />
    </div>
  );
}