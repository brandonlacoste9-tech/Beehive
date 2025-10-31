import type { Handler } from '@netlify/functions';
import { createHmac, timingSafeEqual } from 'crypto';
import { EventRouter } from '../../packages/webhook-gateway/src/router';
import { TelemetryLogger } from '../../packages/webhook-gateway/src/telemetry';

<<<<<<< HEAD
=======
import type { Handler } from '@netlify/functions';
import { createHmac, timingSafeEqual } from 'crypto';
import { EventRouter } from '../../packages/webhook-gateway/src/router';
import { TelemetryLogger } from '../../packages/webhook-gateway/src/telemetry';
import { createLogger } from '../../lib/logger';

>>>>>>> feat/aurora-home
const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET!;
const ENABLE_WEBHOOK_PROCESSING = process.env.ENABLE_WEBHOOK_PROCESSING === 'true';

export const handler: Handler = async (event) => {
  const startTime = Date.now();
<<<<<<< HEAD
  const telemetry = new TelemetryLogger();
  try {
    if (event.httpMethod !== 'POST') {
=======
  const requestId = crypto.randomUUID();
  const logger = createLogger({ requestId, function: 'github-webhook' });
  const telemetry = new TelemetryLogger();
  
  logger.info('webhook_received', { 
    method: event.httpMethod,
    path: event.path 
  });

  try {
    if (event.httpMethod !== 'POST') {
      logger.warn('method_not_allowed', { method: event.httpMethod });
>>>>>>> feat/aurora-home
      return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    const headers = event.headers as Record<string, string>;
    const githubEvent = headers['x-github-event'] || headers['X-GitHub-Event'];
    const deliveryId = headers['x-github-delivery'] || headers['X-GitHub-Delivery'];
    const signature = headers['x-hub-signature-256'] || headers['X-Hub-Signature-256'];

    if (!githubEvent || !deliveryId || !signature) {
<<<<<<< HEAD
=======
      logger.warn('missing_headers', { githubEvent, deliveryId, hasSignature: !!signature });
>>>>>>> feat/aurora-home
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing required headers' }) };
    }

    const payload = event.body ?? '';
    if (!verifySignature(payload, signature)) {
<<<<<<< HEAD
=======
      logger.error('signature_verification_failed', { deliveryId, event: githubEvent });
>>>>>>> feat/aurora-home
      telemetry.log('security', 'webhook_signature_invalid', { deliveryId, event: githubEvent });
      return { statusCode: 401, body: JSON.stringify({ error: 'Invalid signature' }) };
    }

    const data = payload ? JSON.parse(payload) : {};

<<<<<<< HEAD
=======
    logger.info('webhook_validated', {
      event: githubEvent,
      deliveryId,
      action: data.action || 'none',
      repository: data.repository?.full_name,
      sender: data.sender?.login
    });

>>>>>>> feat/aurora-home
    telemetry.log('webhook', 'received', {
      event: githubEvent,
      deliveryId,
      action: data.action || 'none',
      repository: data.repository?.full_name,
      sender: data.sender?.login
    });

    if (!ENABLE_WEBHOOK_PROCESSING) {
<<<<<<< HEAD
=======
      logger.info('processing_disabled', { deliveryId });
>>>>>>> feat/aurora-home
      telemetry.log('webhook', 'processing_disabled', { deliveryId });
      return {
        statusCode: 200,
        body: JSON.stringify({ received: true, processed: false, reason: 'Processing disabled' })
      };
    }

    const router = new EventRouter(telemetry);
    const result = await router.route(githubEvent, data);

    const duration = Date.now() - startTime;
<<<<<<< HEAD
=======
    
    logger.info('webhook_processed', { 
      deliveryId, 
      duration, 
      success: result.success,
      taskId: result.taskId,
      status: 200
    });

>>>>>>> feat/aurora-home
    telemetry.log('performance', 'webhook_processed', { deliveryId, duration, success: result.success });

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true, processed: true, deliveryId, taskId: result.taskId, duration })
    };
<<<<<<< HEAD
  } catch (error: any) {
    const duration = Date.now() - startTime;
    telemetry.log('error', 'webhook_processing_failed', { error: error.message, stack: error.stack, duration });
    return { statusCode: 500, body: JSON.stringify({ error: 'Webhook processing failed', message: error.message }) };
=======
  } catch (error: unknown) {
    const duration = Date.now() - startTime;
    const err = error as Error;
    
    logger.error('webhook_processing_failed', { 
      error: err.message,
      duration,
      status: 500
    });
    
    telemetry.log('error', 'webhook_processing_failed', { error: err.message, duration });
    
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: 'Webhook processing failed', message: err.message }) 
    };
>>>>>>> feat/aurora-home
  }
};

function verifySignature(payload: string, signature: string): boolean {
  if (!WEBHOOK_SECRET) return false;
  const hmac = createHmac('sha256', WEBHOOK_SECRET);
  const digest = 'sha256=' + hmac.update(payload).digest('hex');
  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
  } catch {
    return false;
  }
}
