import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { BeehivClient, BeehivWebhookPayload } from '../../src/lib/beehiv';
import { supabaseAdmin } from '../../src/lib/supabaseAdmin';

/**
 * Beehiv Sync Function
 *
 * Handles Beehiv webhook events and syncs newsletter subscriber data
 * with the Beehive platform for campaign coordination.
 *
 * Endpoints:
 * - POST /webhook - Receive Beehiv webhook events
 * - POST /send-campaign - Send newsletter campaign
 * - GET /stats - Get newsletter statistics
 */

interface SendCampaignPayload {
  title: string;
  content: string;
  sentiment?: string;
  campaignId?: string;
  tags?: string[];
}

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const { httpMethod, path, body, headers } = event;

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' };
  }

  try {
    const beehiv = new BeehivClient();

    // Handle webhook events from Beehiv
    if (path.includes('/webhook') && httpMethod === 'POST') {
      if (!body) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Missing request body' }),
        };
      }

      const payload: BeehivWebhookPayload = JSON.parse(body);
      const { email, publication_id, status, created } = payload.data;

      // Log subscriber event to Supabase
      await supabaseAdmin.from('newsletter_subscribers').upsert({
        email,
        publication_id,
        status,
        subscribed_at: new Date(created * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      });

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ success: true, message: 'Webhook processed' }),
      };
    }

    // Send newsletter campaign
    if (path.includes('/send-campaign') && httpMethod === 'POST') {
      if (!body) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Missing request body' }),
        };
      }

      const payload: SendCampaignPayload = JSON.parse(body);
      const result = await beehiv.sendCampaignUpdate(payload);

      // Log campaign send to Supabase
      await supabaseAdmin.from('newsletter_campaigns').insert({
        title: payload.title,
        campaign_id: payload.campaignId,
        sentiment: payload.sentiment,
        tags: payload.tags || [],
        sent_at: new Date().toISOString(),
        beehiv_post_id: result.id,
      });

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ success: true, data: result }),
      };
    }

    // Get newsletter stats
    if (path.includes('/stats') && httpMethod === 'GET') {
      const stats = await beehiv.getStats();

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ success: true, data: stats }),
      };
    }

    // Get publication info
    if (path.includes('/publication') && httpMethod === 'GET') {
      const publication = await beehiv.getPublication();

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ success: true, data: publication }),
      };
    }

    return {
      statusCode: 404,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Endpoint not found' }),
    };
  } catch (error) {
    console.error('Beehiv sync error:', error);

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};

export { handler };
