"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Feature {
  icon: string;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: "✨",
    title: "AI-Powered Generation",
    description: "Leverage advanced AI models to create compelling ad copy instantly"
  },
  {
    icon: "🎯",
    title: "Multiple Tones",
    description: "Choose from professional, casual, urgent, and more tone options"
  },
  {
    icon: "⚡",
    title: "Real-time Streaming",
    description: "Watch your content generate in real-time with streaming responses"
  },
  {
    icon: "📊",
    title: "Usage Analytics",
    description: "Track your usage and stay within your plan limits effortlessly"
  }
];

export default function FeatureRail() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return (
    <section id="features" className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-display font-bold text-center mb-12">
          Powerful Features
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
              whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="p-8 bg-card border border-border rounded-lg hover:border-primary-500/50 transition-colors group focus-within:ring-2 focus-within:ring-primary-500"
            >
              <div className="text-4xl mb-4" role="img" aria-label={feature.title}>
                {feature.icon}
              </div>
              
              <h3 className="text-xl font-semibold mb-4 group-hover:text-primary-500 transition-colors">
                {feature.title}
              </h3>
              
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
