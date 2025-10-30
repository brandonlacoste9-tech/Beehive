import { withAuth, AuthenticatedRequest } from '../../../src/lib/auth';
import { supabaseAdmin } from '../../../src/lib/supabaseAdmin';
import type { NextApiResponse } from 'next';

/**
 * Generation History API
 *
 * Fetches user's generation history with pagination
 *
 * GET /api/generations/history?limit=10&offset=0
 * Headers: { Authorization: Bearer <token> }
 */

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = req.user!;
    const { limit = '10', offset = '0', search = '' } = req.query;

    const limitNum = parseInt(limit as string, 10);
    const offsetNum = parseInt(offset as string, 10);

    let query = supabaseAdmin
      .from('generations')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // Search filter
    if (search) {
      query = query.or(`product.ilike.%${search}%,audience.ilike.%${search}%,headline.ilike.%${search}%`);
    }

    // Pagination
    query = query.range(offsetNum, offsetNum + limitNum - 1);

    const { data: generations, error, count } = await query;

    if (error) {
      console.error('Fetch generations error:', error);
      return res.status(500).json({
        error: 'Failed to fetch generations',
      });
    }

    return res.status(200).json({
      success: true,
      generations: generations || [],
      pagination: {
        total: count || 0,
        limit: limitNum,
        offset: offsetNum,
        hasMore: (count || 0) > offsetNum + limitNum,
      },
    });
  } catch (error) {
    console.error('History handler error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export default withAuth(handler);
