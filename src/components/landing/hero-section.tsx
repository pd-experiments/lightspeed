"use client";

import { BorderBeam } from "@/components/magicui/border-beam";
import TextShimmer from "@/components/magicui/text-shimmer";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon, DashboardIcon } from "@radix-ui/react-icons";
import { useInView } from "framer-motion";
import { useRef } from "react";
import HeroVideo from "@/components/magicui/hero-video";
import { CloudLightning } from "lucide-react";
import { useRouter } from "next/navigation";
import { SphereMask } from "@/components/magicui/sphere-mask";

export default function HeroSection() {
  const router = useRouter();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  return (
    <section
      id="hero"
      className="relative mx-auto mt-32 max-w-[80rem] px-6 text-center md:px-8"
    >
      <div onClick={() => router.push("/dashboard")} className="backdrop-filter-[12px] inline-flex h-7 items-center justify-between rounded-full border border-blue-200/30 bg-blue-100/20 px-5 py-3 text-md text-blue-500 dark:text-blue-200 transition-all ease-in hover:cursor-pointer hover:bg-blue-200/30 group translate-y-[-1rem] animate-fade-in opacity-0">
        <TextShimmer className="inline-flex items-center justify-center space-x-2">
          <DashboardIcon className="w-4 h-4" />
          <span>We&apos;re live at /dashboard</span>
          <ArrowRightIcon className="w-3 h-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
        </TextShimmer>
      </div>
      <h1 className="translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:200ms]">
        <span className="flex items-center justify-center">
          <CloudLightning className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 mr-4 text-blue-500 dark:text-blue-400" />
          <span className="bg-gradient-to-br from-blue-600 to-blue-400 dark:from-blue-400 dark:to-blue-600 bg-clip-text py-6 text-5xl font-medium leading-none tracking-tighter text-transparent text-balance sm:text-6xl md:text-7xl lg:text-8xl">
            Lightspeed Ads
          </span>
        </span>
        <span className="p-3 bg-gradient-to-br from-blue-600 to-blue-400 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium leading-tight tracking-tighter text-transparent text-balance block mt-2">
          a single AI workflow for political media monitoring, PR, & advertising teams.
        </span>
      </h1>
      <Button  onClick={() => router.push("/dashboard")}  className="mt-[55px] translate-y-[-1rem] animate-fade-in gap-1 rounded-lg text-white opacity-0 ease-in-out [--animation-delay:600ms] bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 dark:bg-white dark:text-black dark:hover:bg-gray-200">
        <span>Check out our public demo!</span>
        <ArrowRightIcon className="ml-1 size-4 transition-transform duration-300 ease-in-out group-hover:translate-x-1" />
      </Button>
    <HeroVideo
      animationStyle="from-center"
      videoSrc="/demo video.mp4"
      thumbnailSrc="/thumbnail.png"
      thumbnailAlt="Hero Video Thumbnail"
      className="w-full"
    />
    </section>
  );
}
