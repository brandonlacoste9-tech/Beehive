import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../../src/lib/useAuth';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

/**
 * Admin Analytics Dashboard
 *
 * Platform-wide analytics and metrics for administrators
 * Requires admin role
 */

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalGenerations: number;
  todayGenerations: number;
  revenue: {
    mrr: number; // Monthly Recurring Revenue
    arr: number; // Annual Recurring Revenue
    totalPayments: number;
  };
  planDistribution: {
    free: number;
    pro: number;
    enterprise: number;
  };
  growthRate: number;
  avgGenerationsPerUser: number;
  conversionRate: number;
}

interface ChartData {
  signups: number[];
  generations: number[];
  revenue: number[];
  labels: string[];
}

export default function AdminDashboard() {
  const { user, loading: authLoading, logout } = useAuth(true);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    if (user) {
      fetchAdminStats();
    }
  }, [user, timeRange]);

  const fetchAdminStats = async () => {
    try {
      const session = localStorage.getItem('session');
      if (!session) return;

      const { access_token } = JSON.parse(session);

      const response = await fetch(`/api/admin/stats?range=${timeRange}`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setChartData(data.chartData);
      } else if (response.status === 403) {
        alert('Admin access required');
        window.location.href = '/dashboard';
      }
    } catch (error) {
      console.error('Admin stats fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="loading-spinner w-12 h-12 border-4 border-white border-t-transparent"></div>
      </div>
    );
  }

  if (!user || !stats) {
    return null;
  }

  // Chart configurations
  const signupsChartData = {
    labels: chartData?.labels || [],
    datasets: [
      {
        label: 'New Signups',
        data: chartData?.signups || [],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const generationsChartData = {
    labels: chartData?.labels || [],
    datasets: [
      {
        label: 'Generations',
        data: chartData?.generations || [],
        backgroundColor: '#8b5cf6',
      },
    ],
  };

  const revenueChartData = {
    labels: chartData?.labels || [],
    datasets: [
      {
        label: 'Revenue ($)',
        data: chartData?.revenue || [],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const planDistributionData = {
    labels: ['Free', 'Pro', 'Enterprise'],
    datasets: [
      {
        data: [
          stats.planDistribution.free,
          stats.planDistribution.pro,
          stats.planDistribution.enterprise,
        ],
        backgroundColor: ['#94a3b8', '#3b82f6', '#8b5cf6'],
      },
    ],
  };

  return (
    <>
      <Head>
        <title>Admin Dashboard - AdGenXAI</title>
        <meta name="description" content="Platform analytics" />
        <meta name="robots" content="noindex" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
        {/* Header */}
        <nav className="bg-black/20 backdrop-blur-lg border-b border-white/10">
          <div className="container mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <Link href="/" className="flex items-center space-x-2">
                <span className="text-3xl">🐝</span>
                <span className="text-2xl font-bold text-white">AdGenXAI Admin</span>
              </Link>
              <div className="flex items-center space-x-4">
                <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">
                  User Dashboard
                </Link>
                <Link href="/admin/dashboard" className="text-white font-semibold">
                  Admin
                </Link>
                <button onClick={logout} className="text-gray-300 hover:text-white transition-colors">
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>

        <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-12">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Platform Analytics</h1>
              <p className="text-gray-300">Real-time metrics and insights</p>
            </div>

            {/* Time Range Selector */}
            <div className="flex space-x-2">
              {(['7d', '30d', '90d'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    timeRange === range
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
                </button>
              ))}
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="text-sm text-gray-400 mb-2">TOTAL USERS</div>
              <div className="text-3xl font-bold text-white mb-2">{stats.totalUsers.toLocaleString()}</div>
              <div className="text-sm text-green-400">
                {stats.activeUsers} active ({((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}%)
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="text-sm text-gray-400 mb-2">TOTAL GENERATIONS</div>
              <div className="text-3xl font-bold text-white mb-2">{stats.totalGenerations.toLocaleString()}</div>
              <div className="text-sm text-blue-400">{stats.todayGenerations} today</div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="text-sm text-gray-400 mb-2">MRR (Monthly Recurring Revenue)</div>
              <div className="text-3xl font-bold text-white mb-2">${stats.revenue.mrr.toLocaleString()}</div>
              <div className="text-sm text-green-400">
                ARR: ${stats.revenue.arr.toLocaleString()}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="text-sm text-gray-400 mb-2">CONVERSION RATE</div>
              <div className="text-3xl font-bold text-white mb-2">{stats.conversionRate.toFixed(1)}%</div>
              <div className="text-sm text-purple-400">
                Free → Paid conversions
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Signups Chart */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-6">User Signups</h3>
              <Line
                data={signupsChartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { labels: { color: '#fff' } },
                  },
                  scales: {
                    x: { ticks: { color: '#9ca3af' } },
                    y: { ticks: { color: '#9ca3af' } },
                  },
                }}
              />
            </div>

            {/* Generations Chart */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-6">Daily Generations</h3>
              <Bar
                data={generationsChartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { labels: { color: '#fff' } },
                  },
                  scales: {
                    x: { ticks: { color: '#9ca3af' } },
                    y: { ticks: { color: '#9ca3af' } },
                  },
                }}
              />
            </div>

            {/* Revenue Chart */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-6">Revenue Trend</h3>
              <Line
                data={revenueChartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { labels: { color: '#fff' } },
                  },
                  scales: {
                    x: { ticks: { color: '#9ca3af' } },
                    y: { ticks: { color: '#9ca3af' } },
                  },
                }}
              />
            </div>

            {/* Plan Distribution */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-6">Plan Distribution</h3>
              <div className="h-64 flex items-center justify-center">
                <Doughnut
                  data={planDistributionData}
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
              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-white">{stats.planDistribution.free}</div>
                  <div className="text-sm text-gray-400">Free</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{stats.planDistribution.pro}</div>
                  <div className="text-sm text-gray-400">Pro</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{stats.planDistribution.enterprise}</div>
                  <div className="text-sm text-gray-400">Enterprise</div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-bold text-white mb-4">Growth Rate</h3>
              <div className="text-4xl font-bold text-green-400 mb-2">
                +{stats.growthRate.toFixed(1)}%
              </div>
              <p className="text-gray-400 text-sm">Month-over-month user growth</p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-bold text-white mb-4">Avg Generations/User</h3>
              <div className="text-4xl font-bold text-blue-400 mb-2">
                {stats.avgGenerationsPerUser.toFixed(1)}
              </div>
              <p className="text-gray-400 text-sm">Average generations per active user</p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-bold text-white mb-4">Total Payments</h3>
              <div className="text-4xl font-bold text-purple-400 mb-2">
                ${stats.revenue.totalPayments.toLocaleString()}
              </div>
              <p className="text-gray-400 text-sm">All-time payment volume</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
