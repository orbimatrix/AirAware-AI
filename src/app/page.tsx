import { LandingNavbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { AqiExplained } from "@/components/landing/aqi-explained";
import { Footer } from "@/components/landing/footer";
import { CtaFooter } from "@/components/landing/cta-footer";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <LandingNavbar />
      <main className="flex-grow">
        <Hero />
        <Features />
        <AqiExplained />
        <CtaFooter />
      </main>
      <Footer />
    </div>
  );
}
