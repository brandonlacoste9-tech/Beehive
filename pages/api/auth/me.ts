import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../../src/lib/supabaseAdmin';

/**
 * Get Current User API Endpoint
 *
 * Returns authenticated user's profile and stats
 *
 * GET /api/auth/me
 * Headers: { Authorization: Bearer <token> }
 */

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'No authorization token provided',
      });
    }

    const token = authHeader.substring(7);

    // Verify token and get user
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({
        error: 'Invalid or expired token',
      });
    }

    // Get user profile
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (userError) {
      console.error('User fetch error:', userError);
      return res.status(404).json({
        error: 'User not found',
      });
    }

    // Get usage stats for today
    const today = new Date().toISOString().split('T')[0];
    const { data: todayUsage } = await supabaseAdmin
      .from('generations')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', today);

    // Get total generations
    const { data: totalGenerations } = await supabaseAdmin
      .from('generations')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id);

    return res.status(200).json({
      success: true,
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        plan: userData.plan,
        subscription_status: userData.subscription_status,
        daily_limit: userData.daily_limit,
        monthly_limit: userData.monthly_limit,
        daily_usage: userData.daily_usage || 0,
        monthly_usage: userData.monthly_usage || 0,
        stripe_customer_id: userData.stripe_customer_id,
        created_at: userData.created_at,
      },
      stats: {
        today_usage: todayUsage?.length || 0,
        total_generations: totalGenerations?.length || 0,
        remaining_today: userData.daily_limit === -1
          ? 'unlimited'
          : Math.max(0, userData.daily_limit - (userData.daily_usage || 0)),
      },
    });
  } catch (error) {
    console.error('Get user handler error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
