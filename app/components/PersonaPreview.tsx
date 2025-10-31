"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Persona {
  name: string;
  role: string;
  avatar: string;
  quote: string;
}

const personas: Persona[] = [
  {
    name: "Sarah Chen",
    role: "Marketing Director",
    avatar: "👩‍💼",
    quote: "AdGenXAI helps us create dozens of ad variations in minutes, not hours."
  },
  {
    name: "Mike Rodriguez",
    role: "Startup Founder",
    avatar: "👨‍💻",
    quote: "The AI-powered copy is consistently better than what I could write myself."
  },
  {
    name: "Emma Thompson",
    role: "Agency Owner",
    avatar: "👩‍🎨",
    quote: "Our clients love the quality and speed. This tool is a game-changer."
  }
];

export default function PersonaPreview() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-display font-bold text-center mb-12">
          Trusted by Creators
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {personas.map((persona, index) => (
            <motion.article
              key={persona.name}
              initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.95 }}
              whileInView={prefersReducedMotion ? {} : { opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="p-8 bg-card border border-border rounded-lg focus-within:ring-2 focus-within:ring-primary-500"
            >
              <div className="flex items-start gap-4 mb-4">
                <div 
                  className="text-5xl flex-shrink-0" 
                  role="img" 
                  aria-label={`${persona.name}'s avatar`}
                >
                  {persona.avatar}
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold">{persona.name}</h3>
                  <p className="text-sm text-muted-foreground">{persona.role}</p>
                </div>
              </div>
              
              <blockquote className="text-foreground/80 italic leading-relaxed">
                "{persona.quote}"
              </blockquote>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
