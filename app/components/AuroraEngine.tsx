"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import '../../styles/auroraEngine.css'
import CommandPalette from './CommandPalette'
import Pricing from './Pricing'

export default function AuroraEngine() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Command Palette */}
      <CommandPalette />
      
      {/* Animated Aurora Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-[10px] opacity-50">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
          <div className="absolute bottom-20 right-20 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-6000"></div>
        </div>
      </div>

      {/* Floating Glass Navigation */}
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl">
        <div className="backdrop-blur-2xl bg-white/10 dark:bg-black/20 border border-white/20 rounded-2xl shadow-2xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-lg shadow-lg"></div>
              <span className="text-xl font-bold text-white">Aurora Engine</span>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <button
                className="flex items-center gap-2 text-white/60 hover:text-white/80 transition-all duration-200 text-sm"
                aria-label="Open command palette"
              >
                <span>🔍</span>
                <span>Search</span>
                <kbd className="hidden lg:inline-block px-2 py-1 text-xs bg-white/10 rounded border border-white/20">
                  ⌘K
                </kbd>
              </button>
              <a 
                href="#features" 
                className="text-white/80 hover:text-white transition-all duration-200 hover:scale-105"
                aria-label="Navigate to features section"
              >
                Features
              </a>
              <a 
                href="#pricing" 
                className="text-white/80 hover:text-white transition-all duration-200 hover:scale-105"
                aria-label="Navigate to pricing section"
              >
                Pricing
              </a>
              <button 
                className="px-4 py-2 backdrop-blur-xl bg-gradient-to-r from-cyan-500/80 to-purple-500/80 border border-white/20 rounded-lg text-white font-medium hover:from-cyan-500 hover:to-purple-500 hover:scale-105 hover:shadow-lg transition-all duration-300"
                aria-label="Start creating with Aurora Engine"
              >
                Start Creating
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer for fixed nav */}
      <div className="h-20"></div>

      {/* Hero Section */}
      <section className="relative z-40 pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
                The <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">Aurora Engine</span> for Growth
              </h1>
              <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto leading-relaxed">
                Generate ads and reels, refine with personas, and publish everywhere—automatically.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12"
            >
              <button className="px-8 py-4 backdrop-blur-xl bg-gradient-to-r from-cyan-500/80 to-purple-500/80 border border-white/20 rounded-xl text-white font-semibold text-lg hover:from-cyan-500 hover:to-purple-500 transform hover:scale-105 transition-all duration-300 shadow-2xl">
                Start Creating
              </button>
              <button className="px-8 py-4 backdrop-blur-xl bg-white/5 border border-white/20 rounded-xl text-white font-semibold text-lg hover:bg-white/10 transition-all duration-300">
                Explore Features
              </button>
            </motion.div>
          </div>

          {/* Hero Visual - Glass Interface Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 40 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="mt-20 relative"
          >
            <div className="backdrop-blur-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-3xl p-8 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl mb-4"></div>
                  <h3 className="text-white font-semibold text-lg mb-2">AI Generator</h3>
                  <p className="text-white/70">Turn prompts + personas into on-brand ads in seconds.</p>
                </div>
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl mb-4"></div>
                  <h3 className="text-white font-semibold text-lg mb-2">Reels Studio</h3>
                  <p className="text-white/70">Storyboard, captions, and voice—export ready.</p>
                </div>
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-xl mb-4"></div>
                  <h3 className="text-white font-semibold text-lg mb-2">Broadcast</h3>
                  <p className="text-white/70">One-click publish to TikTok, IG, YouTube, X.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-40 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Create. Remix. <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">Broadcast.</span>
            </h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">Built for modern creators—fast, friendly, and production-ready.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "AI Generator", desc: "Turn prompts + personas into on-brand ads in seconds.", icon: "🎨" },
              { title: "Reels Studio", desc: "Storyboard, captions, and voice—export ready.", icon: "🎬" },
              { title: "Broadcast", desc: "One-click publish to TikTok, IG, YouTube, X.", icon: "📡" },
              { title: "Persona Engine", desc: "Rounded tones, styles, and audiences.", icon: "👤" }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 group"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-white/70 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="relative z-40 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="backdrop-blur-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-3xl p-12 text-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div>
                <div className="text-4xl font-bold text-white mb-2">10,000+</div>
                <div className="text-white/70">Creators</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-white mb-2">500K+</div>
                <div className="text-white/70">Ads Generated</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-white mb-2">2M+</div>
                <div className="text-white/70">Hours Saved</div>
              </div>
            </div>
            <blockquote className="text-2xl text-white/90 italic mb-6 max-w-3xl mx-auto">
              "Aurora helped us launch 10x faster without losing quality. We went from ideas to exports in minutes."
            </blockquote>
            <div className="text-white/70">
              <strong>Nova Collective</strong> - Global creator network
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <Pricing />

      {/* CTA Section */}
      <section className="relative z-40 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to create your <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">Aurora</span>?
          </h2>
          <p className="text-xl text-white/80 mb-8">Start your free trial today</p>
          <button className="px-12 py-4 backdrop-blur-xl bg-gradient-to-r from-cyan-500/80 to-purple-500/80 border border-white/20 rounded-xl text-white font-semibold text-xl hover:from-cyan-500 hover:to-purple-500 transform hover:scale-105 transition-all duration-300 shadow-2xl">
            Start Creating Now
          </button>
        </div>
      </section>
    </div>
  )
}
