import type { NextApiRequest, NextApiResponse } from 'next';
import { subscribeToNewsletter } from '../../../src/lib/beehiv';

/**
 * API Route: Subscribe to Beehiv Newsletter
 *
 * POST /api/beehiv/subscribe
 *
 * Body:
 * {
 *   "email": "user@example.com",
 *   "utmSource": "website",
 *   "utmCampaign": "campaign-123",
 *   "customFields": { "interest": "marketing" }
 * }
 */

interface SubscribeRequest {
  email: string;
  utmSource?: string;
  utmCampaign?: string;
  utmMedium?: string;
  referringSite?: string;
  customFields?: Record<string, any>;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      email,
      utmSource,
      utmCampaign,
      utmMedium,
      referringSite,
      customFields,
    }: SubscribeRequest = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    const metadata = {
      ...customFields,
      subscribed_from: 'beehive-platform',
      utm_source: utmSource,
      utm_campaign: utmCampaign,
      utm_medium: utmMedium,
      referring_site: referringSite || req.headers.referer,
      user_agent: req.headers['user-agent'],
      subscribed_at: new Date().toISOString(),
    };

    const result = await subscribeToNewsletter(email, metadata);

    return res.status(200).json({
      success: true,
      message: 'Successfully subscribed to newsletter',
      data: result,
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);

    return res.status(500).json({
      error: 'Failed to subscribe',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
