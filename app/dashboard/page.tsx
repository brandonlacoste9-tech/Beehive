"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Navigation } from "../../components/Navigation"

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return // Still loading
    if (!session) {
      router.push("/api/auth/signin")
      return
    }
  }, [session, status, router])

  if (status === "loading") {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400 text-lg">Loading your dashboard...</p>
          </div>
        </div>
      </>
    )
  }

  if (!session) {
    return null // Will redirect
  }

  // Calculate user stats (in real app, this would come from database)
  const userStats = {
    projectsCount: 0,
    generationsCount: 0,
    creditsRemaining: 100,
    memberSince: new Date().toLocaleDateString(),
    accountType: "Free Plan"
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="pt-24 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Welcome Header */}
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-6">
                {session.user?.image && (
                  <img 
                    src={session.user.image} 
                    alt={session.user.name || "User"} 
                    className="w-20 h-20 rounded-full border-4 border-white shadow-lg mr-4"
                  />
                )}
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
                    Welcome back, {session.user?.name?.split(' ')[0]}! 🐝
                  </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
                    Ready to create something amazing today?
                  </p>
                </div>
              </div>
            </div>

            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
              
              {/* User Profile Card */}
              <div className="lg:col-span-1">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                    👤 Profile
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      {session.user?.image && (
                        <img 
                          src={session.user.image} 
                          alt={session.user.name || "User"} 
                          className="w-16 h-16 rounded-full border-2 border-gray-200 dark:border-gray-600"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {session.user?.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {session.user?.email}
                        </p>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-200 dark:border-gray-600 pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Account Type</span>
                        <span className="font-medium text-blue-600 dark:text-blue-400">{userStats.accountType}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Member Since</span>
                        <span className="font-medium text-gray-900 dark:text-white">{userStats.memberSince}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">User ID</span>
                        <span className="font-mono text-xs text-gray-500 dark:text-gray-400">
                          {session.user?.email?.substring(0, 8)}...
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats and Quick Actions */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* Usage Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Projects</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">{userStats.projectsCount}</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <span className="text-2xl">📁</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Total created</p>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">AI Generations</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">{userStats.generationsCount}</p>
                      </div>
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                        <span className="text-2xl">🤖</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">This month</p>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Credits</p>
                        <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{userStats.creditsRemaining}</p>
                      </div>
                      <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                        <span className="text-2xl">⚡</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Remaining</p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                    🚀 Quick Actions
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button className="group p-4 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white transition-all duration-200 transform hover:scale-105">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">✨</span>
                        <div className="text-left">
                          <div className="font-semibold">Create New Project</div>
                          <div className="text-sm opacity-90">Start your next AI creation</div>
                        </div>
                      </div>
                    </button>

                    <button className="group p-4 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white transition-all duration-200 transform hover:scale-105">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">🎨</span>
                        <div className="text-left">
                          <div className="font-semibold">AI Studio</div>
                          <div className="text-sm opacity-90">Generate with AI tools</div>
                        </div>
                      </div>
                    </button>

                    <button className="group p-4 rounded-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white transition-all duration-200 transform hover:scale-105">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">🔑</span>
                        <div className="text-left">
                          <div className="font-semibold">API Keys</div>
                          <div className="text-sm opacity-90">Manage developer access</div>
                        </div>
                      </div>
                    </button>

                    <button className="group p-4 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white transition-all duration-200 transform hover:scale-105">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">⚙️</span>
                        <div className="text-left">
                          <div className="font-semibold">Settings</div>
                          <div className="text-sm opacity-90">Configure preferences</div>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Coming Soon Features */}
            <div className="bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 rounded-xl p-8 text-white">
              <h2 className="text-3xl font-bold mb-6 text-center">🔮 Coming Soon to Your Hive</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">💎</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Premium Features</h3>
                  <p className="text-sm opacity-90">Unlock advanced AI models, priority processing, and unlimited generations</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">👥</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Team Collaboration</h3>
                  <p className="text-sm opacity-90">Share projects, collaborate in real-time, and manage team workflows</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">📊</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Analytics Dashboard</h3>
                  <p className="text-sm opacity-90">Track usage, monitor performance, and optimize your AI workflows</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}