"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { TrendingUp, Sparkles, RefreshCw, Rocket, BarChart2, MessageSquare, Target, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
const features: { href: string, title: string, description: string, icon: React.ElementType, image: string }[] = [
  { href: "/research", title: "Real-time Insights", description: "Aggregate voter sentiment from social media and current events.", icon: TrendingUp, image: "/images/real-time-insights.jpg" },
  { href: "/create/generate", title: "AI Ad Creation", description: "Generate ad suggestions based on trending topics and successful campaigns.", icon: Sparkles, image: "/images/ai-ad-creation.jpg" },
  { href: "/create/testing", title: "Rapid A/B Testing", description: "Quickly test and iterate on ad variations for maximum impact.", icon: RefreshCw, image: "/images/ab-testing.jpg" },
  { href: "/deployment", title: "Multi-Platform", description: "Seamlessly deploy ads across Google, Meta, and other platforms.", icon: Rocket, image: "/images/multi-platform.jpg" },
  { href: "/dashboard", title: "Analytics", description: "Track and analyze ad performance with detailed insights.", icon: BarChart2, image: "/images/analytics.jpg" },
  { href: "/research", title: "Social Listening", description: "Monitor conversations on TikTok, Threads, and Reddit for voter opinions.", icon: MessageSquare, image: "/images/social-listening.jpg" },
  { href: "/create/ideation", title: "Targeted Messaging", description: "Craft messages that resonate with specific voter segments.", icon: Target, image: "/images/targeted-messaging.jpg" },
  { href: "/dashboard", title: "Automation", description: "Streamline your ad creation process with AI-powered assistance.", icon: Zap, image: "/images/automated-workflow.jpg" },
];

export function FeatureCard({ feature, index }: { feature: (typeof features)[number], index: number }) {
    const router = useRouter();

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        whileHover={{ scale: 1.05 }}
        className="flex flex-col h-full overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 hover:shadow-xl"
      >
        <div className="p-6 flex-grow">
          <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-blue-100 dark:bg-blue-900">
            <feature.icon className="w-6 h-6 text-blue-500 dark:text-blue-300" />
          </div>
          <h3 className="mb-2 text-xl font-semibold text-blue-500 dark:text-white">
            {feature.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            {feature.description}
          </p>
        </div>
        <div className="p-6 bg-gray-50 dark:bg-gray-700">
          <a onClick={() => router.push(feature.href)} className="text-blue-500 hover:text-blue-600 dark:text-blue-300 dark:hover:text-blue-200 font-medium">
            Learn more →
          </a>
        </div>
      </motion.div>
    );
  }
  
export default function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      className="relative mx-auto my-32 max-w-7xl px-6 text-center md:px-8"
    >
      <motion.h2 
        initial={{ opacity: 0, y: -20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="mb-12 text-4xl font-semibold tracking-tight sm:text-5xl"
      >
        <span className="bg-gradient-to-br from-blue-600 to-blue-400 bg-clip-text text-transparent">
        Make smarter political ads faster and cheaper.
        </span>
      </motion.h2>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4"
      >
        {features.map((feature, index) => (
          <FeatureCard key={feature.title} feature={feature} index={index} />
        ))}
      </motion.div>
    </section>
  );
}