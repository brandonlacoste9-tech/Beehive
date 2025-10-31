import type { Handler } from '@netlify/functions';
import { TelemetryLogger } from '../../packages/webhook-gateway/src/telemetry';
<<<<<<< HEAD

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'GET') return { statusCode: 405, body: 'Method not allowed' };
=======
import { createLogger } from '../../lib/logger';

export const handler: Handler = async (event) => {
  const requestId = crypto.randomUUID();
  const logger = createLogger({ requestId, function: 'webhook-telemetry' });
  
  logger.info('telemetry_request', { 
    method: event.httpMethod,
    path: event.path 
  });

  if (event.httpMethod !== 'GET') {
    logger.warn('method_not_allowed', { method: event.httpMethod });
    return { statusCode: 405, body: 'Method not allowed' };
  }
>>>>>>> feat/aurora-home

  const telemetry = new TelemetryLogger();
  const days = parseInt(event.queryStringParameters?.days || '7');

<<<<<<< HEAD
=======
  logger.info('fetching_telemetry', { days });

>>>>>>> feat/aurora-home
  try {
    const events = await telemetry.getHistoricalEvents(days);
    const stats = {
      totalEvents: events.length,
      byCategory: {} as Record<string, number>,
      byEvent: {} as Record<string, number>,
<<<<<<< HEAD
      processing: { mode: process.env.ENABLE_WEBHOOK_PROCESSING === 'true' ? 'active' : 'observation', enabled: process.env.ENABLE_WEBHOOK_PROCESSING === 'true' },
=======
      processing: { 
        mode: process.env.ENABLE_WEBHOOK_PROCESSING === 'true' ? 'active' : 'observation', 
        enabled: process.env.ENABLE_WEBHOOK_PROCESSING === 'true' 
      },
>>>>>>> feat/aurora-home
      timeRange: { start: events[events.length - 1]?.timestamp, end: events[0]?.timestamp }
    };

    events.forEach(e => {
      stats.byCategory[e.category] = (stats.byCategory[e.category] || 0) + 1;
      stats.byEvent[e.event] = (stats.byEvent[e.event] || 0) + 1;
    });

<<<<<<< HEAD
=======
    logger.info('telemetry_fetched', { 
      totalEvents: events.length,
      days,
      status: 200
    });

>>>>>>> feat/aurora-home
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stats, events: events.slice(0, 100) })
    };
<<<<<<< HEAD
  } catch (error: any) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
=======
  } catch (error: unknown) {
    const err = error as Error;
    
    logger.error('telemetry_fetch_failed', { 
      error: err.message,
      status: 500
    });
    
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: err.message }) 
    };
>>>>>>> feat/aurora-home
  }
};

