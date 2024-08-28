// "use client"

// import React from 'react';
// import Link from 'next/link';
// import Image from 'next/image';
// import { Button } from "@/components/ui/button";
// import { ArrowRight, Zap, BarChart2, Rocket, Sparkles, RefreshCw, TrendingUp, MessageSquare, Target } from 'lucide-react';
// import { Carousel, CarouselItem } from "@/components/ui/carousel";
// import AnimatedGradientText from "@/components/magicui/animated-gradient-text";
// import NumberTicker from "@/components/magicui/number-ticker";
// import { cn } from "@/lib/utils";
// import LandingPage from "@/components/ui/LandingPage";

// type featureType = {
//   title: string;
//   description: string;
//   icon: React.ElementType;
//   cta: string;
//   href: string;
// }

// const features: featureType[] = [
//   { title: "Real-time Insights", description: "Aggregate voter sentiment from social media and current events.", icon: TrendingUp, cta: "Learn More", href: "/research"  },
//   { title: "AI Ad Creation", description: "Generate ad suggestions based on trending topics and successful campaigns.", icon: Sparkles, cta: "Learn More", href: "/create" },
//   { title: "Rapid A/B Testing", description: "Quickly test and iterate on ad variations for maximum impact.", icon: RefreshCw, cta: "Learn More", href: "/research" },
//   { title: "Multi-Platform Deployment", description: "Seamlessly deploy ads across Google, Meta, and other platforms.", icon: Rocket, cta: "Learn More", href: "/research" },
//   { title: "Performance Analytics", description: "Track and analyze ad performance with detailed insights.", icon: BarChart2, cta: "Learn More", href: "/research" },
//   { title: "Social Listening", description: "Monitor conversations on TikTok, Threads, and Reddit for voter opinions.", icon: MessageSquare, cta: "Learn More", href: "/research" },
//   { title: "Targeted Messaging", description: "Craft messages that resonate with specific voter segments.", icon: Target, cta: "Learn More", href: "/research" },
//   { title: "Automated Workflow", description: "Streamline your ad creation process with AI-powered assistance.", icon: Zap, cta: "Learn More", href: "/research" },
// ];

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