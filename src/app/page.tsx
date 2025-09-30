import { LandingNavbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { AqiExplained } from "@/components/landing/aqi-explained";
import { PersonalizedAdvice } from "@/components/landing/personalized-advice";
import { FootprintCta } from "@/components/landing/footprint-cta";
import { ChallengesCta } from "@/components/landing/challenges-cta";
import { Footer } from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <LandingNavbar />
      <main className="flex-grow">
        <Hero />
        <Features />
        <AqiExplained />
        <PersonalizedAdvice />
        <FootprintCta />
        <ChallengesCta />
      </main>
      <Footer />
    </div>
  );
}
