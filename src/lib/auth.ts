import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from './supabaseAdmin';

/**
 * Authentication Utilities
 *
 * Middleware and helpers for protecting API routes
 */

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  plan: string;
  subscription_status: string;
  daily_limit: number;
  monthly_limit: number;
  daily_usage: number;
  monthly_usage: number;
}

export interface AuthenticatedRequest extends NextApiRequest {
  user?: AuthenticatedUser;
}

/**
 * Middleware to require authentication
 *
 * Usage:
 * export default withAuth(async (req, res) => {
 *   const user = req.user; // Guaranteed to exist
 * });
 */
export function withAuth(
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'No authorization token provided',
        });
      }

      const token = authHeader.substring(7);

      // Verify token
      const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

      if (authError || !user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid or expired token',
        });
      }

      // Get user profile
      const { data: userData, error: userError } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (userError || !userData) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'User not found',
        });
      }

      // Attach user to request
      req.user = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        plan: userData.plan,
        subscription_status: userData.subscription_status,
        daily_limit: userData.daily_limit,
        monthly_limit: userData.monthly_limit,
        daily_usage: userData.daily_usage || 0,
        monthly_usage: userData.monthly_usage || 0,
      };

      return handler(req, res);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(500).json({
        error: 'Internal server error',
        message: 'Authentication failed',
      });
    }
  };
}

/**
 * Check if user has reached their usage limit
 */
export async function checkUsageLimit(userId: string): Promise<{
  allowed: boolean;
  reason?: string;
  remaining?: number;
}> {
  const { data: userData, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !userData) {
    return { allowed: false, reason: 'User not found' };
  }

  // Unlimited plans
  if (userData.daily_limit === -1) {
    return { allowed: true, remaining: -1 };
  }

  // Check daily limit
  const dailyUsage = userData.daily_usage || 0;
  if (dailyUsage >= userData.daily_limit) {
    return {
      allowed: false,
      reason: `Daily limit reached (${userData.daily_limit} generations/day)`,
      remaining: 0,
    };
  }

  return {
    allowed: true,
    remaining: userData.daily_limit - dailyUsage,
  };
}

/**
 * Increment user's usage counter
 */
export async function incrementUsage(userId: string): Promise<void> {
  const today = new Date().toISOString().split('T')[0];

  // Get current usage
  const { data: userData } = await supabaseAdmin
    .from('users')
    .select('daily_usage, daily_usage_date')
    .eq('id', userId)
    .single();

  let dailyUsage = userData?.daily_usage || 0;

  // Reset daily counter if it's a new day
  if (userData?.daily_usage_date !== today) {
    dailyUsage = 0;
  }

  // Increment counters
  await supabaseAdmin
    .from('users')
    .update({
      daily_usage: dailyUsage + 1,
      monthly_usage: (userData?.monthly_usage || 0) + 1,
      daily_usage_date: today,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);
}

/**
 * Record generation in history
 */
export async function recordGeneration(params: {
  userId: string;
  product: string;
  audience: string;
  tone: string;
  headline: string;
  body: string;
  imagePrompt: string;
  model?: string;
}): Promise<void> {
  await supabaseAdmin.from('generations').insert({
    user_id: params.userId,
    product: params.product,
    audience: params.audience,
    tone: params.tone,
    headline: params.headline,
    body: params.body,
    image_prompt: params.imagePrompt,
    model: params.model || 'gemini-1.5-pro',
    created_at: new Date().toISOString(),
  });
}
