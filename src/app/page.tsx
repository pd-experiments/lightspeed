import ClientSection from "@/components/landing/client-section";
import CallToActionSection from "@/components/landing/cta-section";
import HeroSection from "@/components/landing/hero-section";
import PricingSection from "@/components/landing/pricing-section";
import Particles from "@/components/magicui/particles";
import { SphereMask } from "@/components/magicui/sphere-mask";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import FeaturesSection from "@/components/landing/features";
import DotPattern from "@/components/magicui/dot-pattern";
import { cn } from "@/lib/utils";
import FragmentedAdSection from "@/components/landing/fragmented-ad-section";
import AccurateAdSection from "@/components/landing/accurate-ad-section";

export default async function Page() {
  return (
    <>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        disableTransitionOnChange
      >
        <main className="relative overflow-hidden">
          <HeroSection />
          <FeaturesSection />
          <FragmentedAdSection />
          <AccurateAdSection />
          <Particles
            className="absolute inset-0 -z-10"
            quantity={50}
            ease={70}
            size={0.05}
            staticity={40}
            color={"#3b82f6"}
          />
        </main>
      </ThemeProvider>
      <SiteFooter />
      <DotPattern
        className={cn(
          "fixed inset-0 w-full h-full pointer-events-none -z-20",
          "[mask-image:radial-gradient(ellipse_at_center,white,transparent)]"
        )}
      />
    </>
  );
}