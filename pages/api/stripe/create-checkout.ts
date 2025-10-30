import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

/**
 * Stripe Checkout Session Creator
 *
 * Creates a Stripe Checkout session for subscription payments
 *
 * POST /api/stripe/create-checkout
 * Body: { priceId, successUrl, cancelUrl }
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
    const { priceId, successUrl, cancelUrl, email } = req.body;

    if (!priceId) {
      return res.status(400).json({ error: 'Price ID is required' });
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl || `${process.env.NEXT_PUBLIC_URL}/dashboard?success=true`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_URL}/pricing?canceled=true`,
      customer_email: email,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      metadata: {
        source: 'adgenxai',
        timestamp: new Date().toISOString(),
      },
      subscription_data: {
        metadata: {
          plan: priceId.includes('pro') ? 'pro' : 'enterprise',
        },
        trial_period_days: 14, // 14-day free trial
      },
    });

    return res.status(200).json({
      success: true,
      url: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return res.status(500).json({
      error: 'Failed to create checkout session',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
