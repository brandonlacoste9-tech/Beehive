import type { NextApiRequest, NextApiResponse } from 'next';
import { withRateLimit, RateLimitPresets } from '../../src/lib/rateLimit';

/**
 * Health Check Endpoint
 *
 * GET /api/health
 * Returns API health status
 *
 * Rate limited to 30 requests per minute (public preset)
 */

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  return res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    uptime: process.uptime(),
  });
}

// Apply rate limiting
export default withRateLimit(handler, RateLimitPresets.public);
