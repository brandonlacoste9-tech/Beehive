import type { Handler } from '@netlify/functions';
import { TelemetryLogger } from '../../packages/webhook-gateway/src/telemetry';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'GET') return { statusCode: 405, body: 'Method not allowed' };

  const telemetry = new TelemetryLogger();
  const days = parseInt(event.queryStringParameters?.days || '7');

  try {
    const events = await telemetry.getHistoricalEvents(days);
    const stats = {
      totalEvents: events.length,
      byCategory: {} as Record<string, number>,
      byEvent: {} as Record<string, number>,
      processing: { mode: process.env.ENABLE_WEBHOOK_PROCESSING === 'true' ? 'active' : 'observation', enabled: process.env.ENABLE_WEBHOOK_PROCESSING === 'true' },
      timeRange: { start: events[events.length - 1]?.timestamp, end: events[0]?.timestamp }
    };

    events.forEach(e => {
      stats.byCategory[e.category] = (stats.byCategory[e.category] || 0) + 1;
      stats.byEvent[e.event] = (stats.byEvent[e.event] || 0) + 1;
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stats, events: events.slice(0, 100) })
    };
  } catch (error: any) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};

