import type { Handler } from '@netlify/functions';
import Stripe from 'stripe';
import crypto from 'node:crypto';

type StripeEvent = Stripe.Event;

type CoinbaseEvent = {
  id: string;
  type: string;
  data: Record<string, unknown>;
};

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const coinbaseSecret = process.env.COINBASE_COMMERCE_WEBHOOK_SECRET;

const stripeClient = stripeSecret ? new Stripe(stripeSecret) : null;

function verifyStripeWebhook(body: string, signature?: string | null): StripeEvent | null {
  if (!stripeClient || !stripeWebhookSecret || !signature) return null;
  try {
    return stripeClient.webhooks.constructEvent(body, signature, stripeWebhookSecret);
  } catch {
    return null;
  }
}

function verifyCoinbaseWebhook(body: string, signature?: string | null): CoinbaseEvent | null {
  if (!coinbaseSecret || !signature) return null;
  const computed = crypto.createHmac('sha256', coinbaseSecret).update(body).digest('hex');
  if (computed !== signature) return null;
  try {
    const parsed = JSON.parse(body);
    if (parsed && typeof parsed === 'object') {
      return {
        id: String(parsed.id ?? ''),
        type: String(parsed.event?.type ?? parsed.type ?? 'unknown'),
        data: parsed,
      };
    }
  } catch {
    return null;
  }
  return null;
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const rawBody = event.body ?? '';
  const stripeSignature = event.headers['stripe-signature'] || event.headers['Stripe-Signature'];
  const coinbaseSignature =
    event.headers['x-cc-webhook-signature'] || event.headers['X-Cc-Webhook-Signature'];

  const stripeEvent = verifyStripeWebhook(rawBody, stripeSignature);
  const coinbaseEvent = verifyCoinbaseWebhook(rawBody, coinbaseSignature);

  if (!stripeEvent && !coinbaseEvent) {
    return {
      statusCode: 400,
      body: JSON.stringify({ ok: false, error: 'unverified webhook', status: 'rejected' }),
    };
  }

  const response = {
    ok: true,
    status: 'accepted',
    receivedAt: new Date().toISOString(),
    stripe: stripeEvent
      ? {
          id: stripeEvent.id,
          type: stripeEvent.type,
          livemode: stripeEvent.livemode,
        }
      : null,
    coinbase: coinbaseEvent
      ? {
          id: coinbaseEvent.id,
          type: coinbaseEvent.type,
        }
      : null,
  };

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(response),
  };
};
