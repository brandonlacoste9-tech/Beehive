import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../../src/lib/supabaseAdmin';

/**
 * Signup API Endpoint
 *
 * Creates new user account with Supabase Auth
 *
 * POST /api/auth/signup
 * Body: { email, password, name, plan }
 */

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password, name, plan = 'free' } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters',
      });
    }

    // Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email for MVP
      user_metadata: {
        name: name || email.split('@')[0],
      },
    });

    if (authError) {
      console.error('Signup error:', authError);

      if (authError.message.includes('already registered')) {
        return res.status(409).json({
          error: 'Email already registered',
        });
      }

      return res.status(400).json({
        error: 'Failed to create account',
        details: authError.message,
      });
    }

    if (!authData.user) {
      return res.status(500).json({
        error: 'Failed to create user',
      });
    }

    // Determine usage limits based on plan
    const limitsMap: Record<string, { daily: number; monthly: number }> = {
      free: { daily: 10, monthly: 300 },
      pro: { daily: 100, monthly: 3000 },
      enterprise: { daily: -1, monthly: -1 }, // -1 = unlimited
    };
    const limits = limitsMap[plan as string] || { daily: 10, monthly: 300 };

    // Create user profile in database
    const { error: profileError } = await supabaseAdmin.from('users').insert({
      id: authData.user.id,
      email,
      name: name || email.split('@')[0],
      plan,
      subscription_status: 'active',
      daily_limit: limits.daily,
      monthly_limit: limits.monthly,
      daily_usage: 0,
      monthly_usage: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Don't fail if profile creation fails - user can still login
    }

    // Sign in the user to get session
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (sessionError || !sessionData.session) {
      // User created but couldn't auto-login - they can login manually
      return res.status(201).json({
        success: true,
        message: 'Account created successfully. Please login.',
        user: {
          id: authData.user.id,
          email,
        },
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: authData.user.id,
        email,
        name: name || email.split('@')[0],
        plan,
      },
      session: {
        access_token: sessionData.session.access_token,
        refresh_token: sessionData.session.refresh_token,
        expires_at: sessionData.session.expires_at,
      },
    });
  } catch (error) {
    console.error('Signup handler error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
