"use client";
import { motion } from "framer-motion";
import AuroraField from "./AuroraField";
import MetricCounter from "./MetricCounter";
import ThemeToggle from "./ThemeToggle";

export default function HeroAurora() {
  return (
    <>
      <AuroraField />
      <header role="banner" aria-label="AdGenXAI hero" className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 pt-16 pb-8">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-xl rounded-3xl p-10 md:p-16 relative overflow-hidden">
            <div className="flex items-start justify-between gap-4">
              <motion.h1
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
                className="text-5xl md:text-7xl font-extrabold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-accent-400 to-accent-300 drop-shadow-lg"
              >
                AI-Powered Ad Creative
              </motion.h1>
              <div className="mt-2">
                <ThemeToggle />
              </div>
            </div>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, duration: 0.5 }}
              className="mt-4 text-lg text-foreground/80"
            >
              Generate compelling ad copy in seconds with the power of AI
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.45 }}
              className="mt-8 flex flex-wrap items-center gap-4"
              aria-label="Primary actions"
            >
              <button
                className="px-8 py-4 bg-primary-500/80 backdrop-blur-lg text-white rounded-lg font-medium hover:bg-primary-600/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-2 transition-colors shadow-lg"
                onClick={() => document.getElementById('prompt-card')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Get Started
              </button>
              <button
                className="px-8 py-4 bg-white/10 border-2 border-primary-500/40 text-primary-500 rounded-lg font-medium hover:bg-primary-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-2 transition-colors shadow-lg"
                onClick={() => window.location.href = '#features'}
              >
                Learn More
              </button>
            </motion.div>
          </div>
        </div>
        {/* Stats row */}
        <section 
          aria-label="Key outcomes" 
          className="max-w-7xl mx-auto px-6 pb-14 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-lg rounded-2xl p-6 flex flex-col items-center">
            <MetricCounter label="Faster output" suffix="×" from={0} to={10} />
          </div>
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-lg rounded-2xl p-6 flex flex-col items-center">
            <MetricCounter label="Avg. CTR lift" suffix="%" from={0} to={27} />
          </div>
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-lg rounded-2xl p-6 flex flex-col items-center">
            <MetricCounter label="Markets" from={0} to={38} />
          </div>
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-lg rounded-2xl p-6 flex flex-col items-center">
            <MetricCounter label="Auto channels" from={0} to={4} />
          </div>
        </section>
      </header>
    </>
  );
}

