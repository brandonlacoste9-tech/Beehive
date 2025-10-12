"use client"

import Link from 'next/link'
import { LoginButton } from './LoginButton'
import { ThemeToggle } from './ThemeToggle'

export function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold bg-gradient-to-r from-brand-DEFAULT to-brand-light bg-clip-text text-transparent">
              🐝 BeeHive
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-600 hover:text-brand-DEFAULT dark:text-gray-300 dark:hover:text-brand-light transition-colors">
              Home
            </Link>
            <Link href="/get-started" className="text-gray-600 hover:text-brand-DEFAULT dark:text-gray-300 dark:hover:text-brand-light transition-colors">
              Get Started
            </Link>
            <Link href="/showcase" className="text-gray-600 hover:text-brand-DEFAULT dark:text-gray-300 dark:hover:text-brand-light transition-colors">
              Showcase
            </Link>
            <Link href="/dashboard" className="text-gray-600 hover:text-brand-DEFAULT dark:text-gray-300 dark:hover:text-brand-light transition-colors">
              Dashboard
            </Link>
          </div>

          {/* Auth and Theme Controls */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <LoginButton />
          </div>
        </div>
      </div>
    </nav>
  )
}