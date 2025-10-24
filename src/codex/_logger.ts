import {
  advanceInvocation,
  annotateInvocation,
  type InvocationMetadata,
  type InvocationRecord,
  type InvocationStatus,
} from './invocation_protocol';

export type LedgerEvent = {
  id: string;
  invocationId: string;
  ritual: string;
  status: InvocationStatus;
  timestamp: string;
  note?: string;
  metadata?: InvocationMetadata;
};

export interface LedgerEntry {
  invocation: InvocationRecord;
  events: LedgerEvent[];
  summary?: string;
}

let eventCounter = 0;

function nextEventId(): string {
  eventCounter += 1;
  return `event-${Date.now()}-${eventCounter}`;
}

function cloneEntry(entry: LedgerEntry): LedgerEntry {
  return {
    invocation: {
      ...entry.invocation,
      notes: [...entry.invocation.notes],
      metadata: entry.invocation.metadata
        ? { ...entry.invocation.metadata }
        : undefined,
      payload: entry.invocation.payload
        ? { ...entry.invocation.payload }
        : undefined,
    },
    events: entry.events.map((event) => ({
      ...event,
      metadata: event.metadata ? { ...event.metadata } : undefined,
    })),
    summary: entry.summary,
  };
}

export class ImmutableLedger {
  private entries: LedgerEntry[] = [];

  start(
    invocation: InvocationRecord,
    metadata?: InvocationMetadata,
    note?: string,
  ): LedgerEntry {
    const started = advanceInvocation(invocation, 'running', note, metadata);
    const event = this.createEvent(started, 'running', note, metadata);
    const entry: LedgerEntry = {
      invocation: started,
      events: [event],
      summary: note,
    };
    this.entries = [...this.entries, entry];
    return cloneEntry(entry);
  }

  annotate(
    invocationId: string,
    note: string,
    metadata?: InvocationMetadata,
  ): LedgerEntry | null {
    let updated: LedgerEntry | null = null;
    this.entries = this.entries.map((entry) => {
      if (entry.invocation.id !== invocationId) {
        return entry;
      }
      const invocation = annotateInvocation(entry.invocation, note, metadata);
      const event = this.createEvent(
        invocation,
        invocation.status,
        note,
        metadata,
      );
      updated = {
        invocation,
        events: [...entry.events, event],
        summary: entry.summary,
      };
      return updated;
    });
    return updated ? cloneEntry(updated) : null;
  }

  complete(
    invocationId: string,
    metadata?: InvocationMetadata,
    note?: string,
  ): LedgerEntry | null {
    return this.recordStatus(invocationId, 'completed', note, metadata);
  }

  fail(
    invocationId: string,
    metadata?: InvocationMetadata,
    note?: string,
  ): LedgerEntry | null {
    return this.recordStatus(invocationId, 'failed', note, metadata);
  }

  snapshot(): LedgerEntry[] {
    return this.entries.map((entry) => cloneEntry(entry));
  }

  get(invocationId: string): LedgerEntry | null {
    const entry = this.entries.find((item) => item.invocation.id === invocationId);
    return entry ? cloneEntry(entry) : null;
  }

  reset(): void {
    this.entries = [];
  }

  private recordStatus(
    invocationId: string,
    status: InvocationStatus,
    note?: string,
    metadata?: InvocationMetadata,
  ): LedgerEntry | null {
    let updated: LedgerEntry | null = null;
    this.entries = this.entries.map((entry) => {
      if (entry.invocation.id !== invocationId) {
        return entry;
      }
      const invocation = advanceInvocation(entry.invocation, status, note, metadata);
      const event = this.createEvent(invocation, status, note, metadata);
      updated = {
        invocation,
        events: [...entry.events, event],
        summary: status === 'completed' ? note ?? entry.summary : entry.summary,
      };
      return updated;
    });
    return updated ? cloneEntry(updated) : null;
  }

  private createEvent(
    invocation: InvocationRecord,
    status: InvocationStatus,
    note?: string,
    metadata?: InvocationMetadata,
  ): LedgerEvent {
    const timestamp = new Date().toISOString();
    return {
      id: nextEventId(),
      invocationId: invocation.id,
      ritual: invocation.ritual,
      status,
      timestamp,
      note,
      metadata: metadata ? { ...metadata } : undefined,
    };
  }
}

export const grandLaunchLedger = new ImmutableLedger();
