import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../src/lib/useAuth';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

/**
 * User Dashboard
 *
 * Main hub for authenticated users showing:
 * - Usage stats and analytics
 * - Generation history
 * - Subscription management
 * - Quick generation access
 */

interface Generation {
  id: string;
  product: string;
  audience: string;
  tone: string;
  headline: string;
  body: string;
  image_prompt: string;
  model: string;
  created_at: string;
}

interface DashboardStats {
  today_usage: number;
  total_generations: number;
  remaining_today: number | 'unlimited';
}

export default function Dashboard() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentGenerations, setRecentGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const session = localStorage.getItem('session');
      if (!session) return;

      const { access_token } = JSON.parse(session);

      // Fetch user stats
      const meResponse = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      if (meResponse.ok) {
        const meData = await meResponse.json();
        setStats(meData.stats);
      }

      // Fetch recent generations
      const historyResponse = await fetch('/api/generations/history?limit=5', {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        setRecentGenerations(historyData.generations || []);
      }
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const session = localStorage.getItem('session');
      if (!session) return;

      const { access_token } = JSON.parse(session);

      const response = await fetch('/api/stripe/create-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify({
          customerId: user?.stripe_customer_id,
          returnUrl: `${window.location.origin}/dashboard`,
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Portal error:', error);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="loading-spinner w-12 h-12 border-4 border-white border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Calculate usage percentage
  const usagePercentage =
    user.daily_limit === -1
      ? 0
      : (user.daily_usage / user.daily_limit) * 100;

  // Chart data
  const usageData = {
    labels: ['Used Today', 'Remaining'],
    datasets: [
      {
        data: [
          user.daily_usage,
          user.daily_limit === -1 ? 100 : Math.max(0, user.daily_limit - user.daily_usage),
        ],
        backgroundColor: ['#3b82f6', '#e5e7eb'],
        borderColor: ['#2563eb', '#d1d5db'],
        borderWidth: 2,
      },
    ],
  };

  return (
    <>
      <Head>
        <title>Dashboard - AdGenXAI</title>
        <meta name="description" content="Your AdGenXAI dashboard" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
        {/* Header */}
        <nav className="bg-black/20 backdrop-blur-lg border-b border-white/10">
          <div className="container mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <Link href="/" className="flex items-center space-x-2">
                <span className="text-3xl">🐝</span>
                <span className="text-2xl font-bold text-white">AdGenXAI</span>
              </Link>
              <div className="flex items-center space-x-4">
                <Link
                  href="/"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Generate
                </Link>
                <Link
                  href="/dashboard"
                  className="text-white font-semibold"
                >
                  Dashboard
                </Link>
                <Link
                  href="/history"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  History
                </Link>
                <button
                  onClick={logout}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>

        <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
          {/* Welcome Section */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-white mb-2">
              Welcome back, {user.name}!
            </h1>
            <p className="text-gray-300">
              Here's your AdGenXAI activity overview
            </p>
          </div>

          {/* Success message from Stripe */}
          {router.query.success && (
            <div className="mb-8 p-4 bg-green-500/20 border border-green-500 rounded-lg text-green-200">
              <strong>Success!</strong> Your subscription is now active.
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            {/* Plan Card */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="text-sm text-gray-400 mb-2">CURRENT PLAN</div>
              <div className="text-3xl font-bold text-white mb-4 capitalize">
                {user.plan}
              </div>
              {user.plan !== 'enterprise' && (
                <Link
                  href="/pricing"
                  className="text-blue-400 hover:text-blue-300 text-sm font-semibold"
                >
                  Upgrade Plan →
                </Link>
              )}
            </div>

            {/* Usage Today */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="text-sm text-gray-400 mb-2">USED TODAY</div>
              <div className="text-3xl font-bold text-white mb-2">
                {stats?.today_usage || 0}
              </div>
              <div className="text-sm text-gray-400">
                of {user.daily_limit === -1 ? '∞' : user.daily_limit} generations
              </div>
            </div>

            {/* Remaining Today */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="text-sm text-gray-400 mb-2">REMAINING TODAY</div>
              <div className="text-3xl font-bold text-white mb-2">
                {stats?.remaining_today === 'unlimited' ? '∞' : stats?.remaining_today || 0}
              </div>
              <div className="text-sm text-gray-400">generations left</div>
            </div>

            {/* Total Generations */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="text-sm text-gray-400 mb-2">TOTAL GENERATED</div>
              <div className="text-3xl font-bold text-white mb-2">
                {stats?.total_generations || 0}
              </div>
              <div className="text-sm text-gray-400">all time</div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Usage Chart */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-6">
                Today's Usage
              </h3>
              <div className="h-64 flex items-center justify-center">
                <Doughnut
                  data={usageData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: { color: '#fff' },
                      },
                    },
                  }}
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-6">
                Quick Actions
              </h3>
              <div className="space-y-4">
                <Link
                  href="/"
                  className="block w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all text-center"
                >
                  ✨ Generate New Ad
                </Link>
                <Link
                  href="/history"
                  className="block w-full px-6 py-4 bg-white/20 text-white font-semibold rounded-lg hover:bg-white/30 transition-all text-center"
                >
                  📜 View All History
                </Link>
                {user.plan !== 'free' && user.stripe_customer_id && (
                  <button
                    onClick={handleManageSubscription}
                    className="w-full px-6 py-4 bg-white/20 text-white font-semibold rounded-lg hover:bg-white/30 transition-all"
                  >
                    ⚙️ Manage Subscription
                  </button>
                )}
                {user.plan === 'free' && (
                  <Link
                    href="/pricing"
                    className="block w-full px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all text-center"
                  >
                    🚀 Upgrade to Pro
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Recent Generations */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">
                Recent Generations
              </h3>
              <Link
                href="/history"
                className="text-blue-400 hover:text-blue-300 text-sm font-semibold"
              >
                View All →
              </Link>
            </div>

            {recentGenerations.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <p className="text-gray-300 mb-4">
                  No generations yet. Create your first ad!
                </p>
                <Link
                  href="/"
                  className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Generate Now
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentGenerations.map((gen) => (
                  <div
                    key={gen.id}
                    className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-lg font-semibold text-white">
                        {gen.product}
                      </h4>
                      <span className="text-xs text-gray-400">
                        {new Date(gen.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm mb-2">
                      <strong>Headline:</strong> {gen.headline}
                    </p>
                    <div className="flex gap-2">
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded">
                        {gen.tone}
                      </span>
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded">
                        {gen.model}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
