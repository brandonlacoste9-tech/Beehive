import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Admin user IDs (add your admin user IDs here)
const ADMIN_USER_IDS = process.env.ADMIN_USER_IDS?.split(',') || [];

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalGenerations: number;
  revenue: {
    mrr: number;
    arr: number;
  };
  planDistribution: {
    free: number;
    pro: number;
    enterprise: number;
  };
  growthRate: number;
  conversionRate: number;
  timeSeriesData: {
    signups: Array<{ date: string; count: number }>;
    generations: Array<{ date: string; count: number }>;
    revenue: Array<{ date: string; amount: number }>;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AdminStats | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify admin authentication
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Check if user is admin
    if (!ADMIN_USER_IDS.includes(user.id)) {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    // Get time range from query (default: 30 days)
    const days = parseInt(req.query.days as string) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString();

    // Fetch all users
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('*');

    if (usersError) {
      throw usersError;
    }

    // Calculate plan distribution
    const planDistribution = users.reduce(
      (acc, user) => {
        const plan = user.plan || 'free';
        acc[plan] = (acc[plan] || 0) + 1;
        return acc;
      },
      { free: 0, pro: 0, enterprise: 0 }
    );

    // Fetch all generations
    const { data: generations, error: generationsError } = await supabaseAdmin
      .from('generations')
      .select('*');

    if (generationsError) {
      throw generationsError;
    }

    // Calculate active users (generated at least once in time range)
    const activeUserIds = new Set(
      generations
        .filter(g => new Date(g.created_at) >= startDate)
        .map(g => g.user_id)
    );

    // Fetch payments for revenue calculation
    const { data: payments, error: paymentsError } = await supabaseAdmin
      .from('payments')
      .select('*')
      .gte('created_at', startDateStr);

    if (paymentsError && paymentsError.code !== 'PGRST116') {
      // Ignore "relation does not exist" error if payments table not created yet
      throw paymentsError;
    }

    // Calculate MRR (Monthly Recurring Revenue)
    const activePaidUsers = users.filter(
      u => (u.plan === 'pro' || u.plan === 'enterprise') && u.subscription_status === 'active'
    );

    const mrr = activePaidUsers.reduce((sum, user) => {
      if (user.plan === 'pro') return sum + 97;
      if (user.plan === 'enterprise') return sum + 497;
      return sum;
    }, 0);

    const arr = mrr * 12;

    // Calculate conversion rate (free → paid)
    const freeUsers = users.filter(u => u.plan === 'free').length;
    const paidUsers = users.filter(u => u.plan !== 'free').length;
    const conversionRate = users.length > 0 ? (paidUsers / users.length) * 100 : 0;

    // Calculate growth rate (users created in last 30 days vs previous 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const recentUsers = users.filter(u => new Date(u.created_at) >= thirtyDaysAgo).length;
    const previousUsers = users.filter(
      u => new Date(u.created_at) >= sixtyDaysAgo && new Date(u.created_at) < thirtyDaysAgo
    ).length;

    const growthRate = previousUsers > 0 ? ((recentUsers - previousUsers) / previousUsers) * 100 : 0;

    // Generate time series data for charts
    const timeSeriesData = generateTimeSeriesData(users, generations, payments || [], days);

    const stats: AdminStats = {
      totalUsers: users.length,
      activeUsers: activeUserIds.size,
      totalGenerations: generations.length,
      revenue: {
        mrr,
        arr,
      },
      planDistribution,
      growthRate,
      conversionRate,
      timeSeriesData,
    };

    return res.status(200).json(stats);
  } catch (error) {
    console.error('Admin stats error:', error);
    return res.status(500).json({ error: 'Failed to fetch admin statistics' });
  }
}

function generateTimeSeriesData(
  users: any[],
  generations: any[],
  payments: any[],
  days: number
) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Generate date labels
  const dates: string[] = [];
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }

  // Aggregate signups by date
  const signupsByDate = users.reduce((acc, user) => {
    const date = new Date(user.created_at).toISOString().split('T')[0];
    if (dates.includes(date)) {
      acc[date] = (acc[date] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const signups = dates.map(date => ({
    date,
    count: signupsByDate[date] || 0,
  }));

  // Aggregate generations by date
  const generationsByDate = generations.reduce((acc, gen) => {
    const date = new Date(gen.created_at).toISOString().split('T')[0];
    if (dates.includes(date)) {
      acc[date] = (acc[date] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const generationsTimeSeries = dates.map(date => ({
    date,
    count: generationsByDate[date] || 0,
  }));

  // Aggregate revenue by date
  const revenueByDate = payments.reduce((acc, payment) => {
    const date = new Date(payment.created_at).toISOString().split('T')[0];
    if (dates.includes(date) && payment.amount) {
      acc[date] = (acc[date] || 0) + payment.amount / 100; // Convert cents to dollars
    }
    return acc;
  }, {} as Record<string, number>);

  const revenue = dates.map(date => ({
    date,
    amount: revenueByDate[date] || 0,
  }));

  return {
    signups,
    generations: generationsTimeSeries,
    revenue,
  };
}
