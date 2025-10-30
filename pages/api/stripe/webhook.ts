import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { buffer } from 'micro';
import { supabaseAdmin } from '../../../src/lib/supabaseAdmin';
import { sendPaymentEmail, sendWelcomeEmail } from '../../../src/lib/email';

/**
 * Stripe Webhook Handler
 *
 * Handles Stripe events:
 * - checkout.session.completed - New subscription
 * - customer.subscription.updated - Subscription changed
 * - customer.subscription.deleted - Subscription canceled
 * - invoice.payment_succeeded - Payment successful
 * - invoice.payment_failed - Payment failed
 */

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-02-24.acacia',
});

// Disable body parsing to get raw body for signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];

  if (!sig) {
    return res.status(400).json({ error: 'Missing stripe-signature header' });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).json({
      error: 'Webhook signature verification failed',
    });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return res.status(500).json({
      error: 'Webhook handler failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;
  const email = session.customer_email;

  // Get subscription details
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const plan = subscription.metadata.plan || 'pro';

  // Determine limits based on plan
  const limits = {
    pro: { daily: 100, monthly: 3000 },
    enterprise: { daily: -1, monthly: -1 }, // -1 = unlimited
  }[plan] || { daily: 100, monthly: 3000 };

  // Create or update user in Supabase
  const { error } = await supabaseAdmin.from('users').upsert({
    email,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
    plan,
    subscription_status: subscription.status,
    daily_limit: limits.daily,
    monthly_limit: limits.monthly,
    trial_ends_at: subscription.trial_end
      ? new Date(subscription.trial_end * 1000).toISOString()
      : null,
    subscription_started_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error('Failed to create user:', error);
  }

  // Send welcome email
  if (email) {
    await sendWelcomeEmail({
      email,
      plan,
    });
  }

  console.log(`Subscription created: ${subscriptionId} for ${email}`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  // Update subscription status
  const { error } = await supabaseAdmin
    .from('users')
    .update({
      subscription_status: subscription.status,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_customer_id', customerId);

  if (error) {
    console.error('Failed to update subscription:', error);
  }

  console.log(`Subscription updated: ${subscription.id}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  // Downgrade to free plan
  const { error } = await supabaseAdmin
    .from('users')
    .update({
      plan: 'free',
      subscription_status: 'canceled',
      stripe_subscription_id: null,
      daily_limit: 10,
      monthly_limit: 300,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_customer_id', customerId);

  if (error) {
    console.error('Failed to cancel subscription:', error);
  }

  console.log(`Subscription canceled: ${subscription.id}`);
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  // Log payment
  await supabaseAdmin.from('payments').insert({
    stripe_customer_id: customerId,
    stripe_invoice_id: invoice.id,
    amount: invoice.amount_paid / 100, // Convert cents to dollars
    currency: invoice.currency,
    status: 'succeeded',
    paid_at: new Date(invoice.created * 1000).toISOString(),
  });

  // Get user email and plan for notification
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('email, plan')
    .eq('stripe_customer_id', customerId)
    .single();

  if (user?.email) {
    await sendPaymentEmail({
      email: user.email,
      amount: invoice.amount_paid,
      plan: user.plan || 'pro',
      status: 'success',
      invoiceUrl: invoice.hosted_invoice_url || undefined,
    });
  }

  console.log(`Payment succeeded: ${invoice.id}`);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  // Log failed payment
  await supabaseAdmin.from('payments').insert({
    stripe_customer_id: customerId,
    stripe_invoice_id: invoice.id,
    amount: invoice.amount_due / 100,
    currency: invoice.currency,
    status: 'failed',
    paid_at: new Date().toISOString(),
  });

  // Get user email and plan for notification
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('email, plan')
    .eq('stripe_customer_id', customerId)
    .single();

  if (user?.email) {
    await sendPaymentEmail({
      email: user.email,
      amount: invoice.amount_due,
      plan: user.plan || 'pro',
      status: 'failed',
    });
  }

  console.log(`Payment failed: ${invoice.id}`);
}
