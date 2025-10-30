import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../../src/lib/supabaseAdmin';

/**
 * Login API Endpoint
 *
 * Authenticates users with Supabase Auth
 *
 * POST /api/auth/login
 * Body: { email, password }
 */

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required',
      });
    }

    // Authenticate with Supabase
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Login error:', error);
      return res.status(401).json({
        error: 'Invalid email or password',
        details: error.message,
      });
    }

    if (!data.user || !data.session) {
      return res.status(401).json({
        error: 'Authentication failed',
      });
    }

    // Get user details from database
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (userError && userError.code !== 'PGRST116') {
      console.error('User fetch error:', userError);
    }

    // Update last login
    await supabaseAdmin
      .from('users')
      .update({
        last_login_at: new Date().toISOString(),
      })
      .eq('id', data.user.id);

    return res.status(200).json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: userData?.name || '',
        plan: userData?.plan || 'free',
        subscription_status: userData?.subscription_status || 'active',
      },
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
      },
    });
  } catch (error) {
    console.error('Login handler error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
