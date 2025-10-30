import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

/**
 * Stripe Customer Portal Session Creator
 *
 * Creates a portal session for customers to manage their subscription
 *
 * POST /api/stripe/create-portal
 * Body: { customerId, returnUrl }
 */

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-02-24.acacia',
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { customerId, returnUrl } = req.body;

    if (!customerId) {
      return res.status(400).json({ error: 'Customer ID is required' });
    }

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl || `${process.env.NEXT_PUBLIC_URL}/dashboard`,
    });

    return res.status(200).json({
      success: true,
      url: session.url,
    });
  } catch (error) {
    console.error('Stripe portal error:', error);
    return res.status(500).json({
      error: 'Failed to create portal session',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
