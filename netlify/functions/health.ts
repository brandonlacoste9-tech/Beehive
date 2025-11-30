import type { Handler } from '@netlify/functions';
import packageJson from '../../package.json' assert { type: 'json' };
import { TelemetryLogger, type TelemetryEvent } from '../../packages/webhook-gateway/src/telemetry';

const DEFAULT_RETENTION = '30 days';
const DEFAULT_TELEMETRY_WINDOW_DAYS = 30;

interface TelemetryStats {
  totalEvents: number;
  byCategory: Record<string, number>;
  byEvent: Record<string, number>;
  processing: { mode: 'active' | 'observation'; enabled: boolean };
  timeRange: { start?: string; end?: string };
}

interface HealthPayload {
  status: 'healthy' | 'degraded' | 'down';
  timestamp: string;
  version: string;
  cortex: {
    webhook: {
      configured: boolean;
      processing: boolean;
    };
    telemetry: {
      enabled: boolean;
      retention: string;
      lastEvent?: string;
    };
    colonyOS: {
      registered: boolean;
      mode: 'observation' | 'active';
      environment: string;
    };
  };
  endpoints: Record<string, string>;
  telemetry: {
    stats: TelemetryStats;
  };
}

function buildTelemetryStats(events: TelemetryEvent[], processingEnabled: boolean): TelemetryStats {
  const stats: TelemetryStats = {
    totalEvents: events.length,
    byCategory: {},
    byEvent: {},
    processing: {
      mode: processingEnabled ? 'active' : 'observation',
      enabled: processingEnabled
    },
    timeRange: {
      start: events[events.length - 1]?.timestamp,
      end: events[0]?.timestamp
    }
  };

  for (const event of events) {
    stats.byCategory[event.category] = (stats.byCategory[event.category] || 0) + 1;
    stats.byEvent[event.event] = (stats.byEvent[event.event] || 0) + 1;
  }

  return stats;
}

export const handler: Handler = async () => {
  const telemetry = new TelemetryLogger();
  const processingEnabled = process.env.ENABLE_WEBHOOK_PROCESSING === 'true';
  const events = await telemetry.getHistoricalEvents(DEFAULT_TELEMETRY_WINDOW_DAYS);

  const payload: HealthPayload = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: packageJson.version,
    cortex: {
      webhook: {
        configured: Boolean(process.env.GITHUB_WEBHOOK_SECRET),
        processing: processingEnabled
      },
      telemetry: {
        enabled: true,
        retention: DEFAULT_RETENTION,
        lastEvent: events[0]?.timestamp
      },
      colonyOS: {
        registered: true,
        mode: processingEnabled ? 'active' : 'observation',
        environment: process.env.COLONY_OS_ENV || 'production'
      }
    },
    endpoints: {
      webhook: '/.netlify/functions/github-webhook',
      telemetry: '/.netlify/functions/webhook-telemetry',
      dashboard: '/.netlify/functions/telemetry-dashboard',
      health: '/.netlify/functions/health'
    },
    telemetry: {
      stats: buildTelemetryStats(events, processingEnabled)
    }
  };

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload, null, 2)
  };
};
