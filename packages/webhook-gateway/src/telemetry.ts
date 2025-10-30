import { getStore } from '@netlify/blobs';

export type TelemetryCategory = 'webhook' | 'router' | 'dispatcher' | 'security' | 'performance' | 'error';

export interface TelemetryEvent {
  timestamp: string;
  category: TelemetryCategory;
  event: string;
  data: Record<string, any>;
}

export class TelemetryLogger {
  private events: TelemetryEvent[] = [];
  private store = getStore('webhook-telemetry');

  log(category: TelemetryCategory, event: string, data: Record<string, any> = {}) {
    const telemetryEvent: TelemetryEvent = { timestamp: new Date().toISOString(), category, event, data };
    this.events.push(telemetryEvent);
    if (process.env.NODE_ENV === 'development') console.log(`[${category}] ${event}:`, data);
    this.persistAsync(telemetryEvent);
  }

  private async persistAsync(event: TelemetryEvent) {
    try {
      const key = `events/${new Date().toISOString().split('T')[0]}/${event.timestamp}`;
      await this.store.set(key, JSON.stringify(event));
    } catch (error) {
      console.error('Failed to persist telemetry:', error);
    }
  }

  getEvents(): TelemetryEvent[] {
    return [...this.events];
  }

  async getHistoricalEvents(days: number = 7): Promise<TelemetryEvent[]> {
    const events: TelemetryEvent[] = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    try {
      const { blobs } = await this.store.list({ prefix: 'events/' });
      for (const blob of blobs) {
        const data = await this.store.get(blob.key);
        if (data) {
          const event = JSON.parse(data as string);
          if (new Date(event.timestamp) >= startDate) events.push(event);
        }
      }
    } catch (error) {
      console.error('Failed to retrieve historical events:', error);
    }

    return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
}

