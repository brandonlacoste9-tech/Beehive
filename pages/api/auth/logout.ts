import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../../src/lib/supabaseAdmin';

/**
 * Logout API Endpoint
 *
 * Signs out user and invalidates session
 *
 * POST /api/auth/logout
 * Headers: { Authorization: Bearer <token> }
 */

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
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

    // Sign out user
    const { error } = await supabaseAdmin.auth.admin.signOut(token);

    if (error) {
      console.error('Logout error:', error);
      // Don't fail - just return success
    }

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout handler error:', error);
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  }
}
