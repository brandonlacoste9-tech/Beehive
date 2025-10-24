export type InvocationStatus = 'pending' | 'running' | 'completed' | 'failed';

export type InvocationMetadata = Record<string, unknown>;

export interface InvocationRecord {
  id: string;
  ritual: string;
  status: InvocationStatus;
  createdAt: string;
  updatedAt: string;
  payload?: Record<string, unknown>;
  metadata?: InvocationMetadata;
  notes: string[];
}

interface CreateInvocationOptions {
  ritual: string;
  payload?: Record<string, unknown>;
  metadata?: InvocationMetadata;
}

let invocationCounter = 0;

function nextId(prefix: string): string {
  invocationCounter += 1;
  return `${prefix}-${Date.now()}-${invocationCounter}`;
}

export function createInvocation(options: CreateInvocationOptions): InvocationRecord {
  const timestamp = new Date().toISOString();
  const metadata = options.metadata ? { ...options.metadata } : undefined;
  const payload = options.payload ? { ...options.payload } : undefined;
  return {
    id: nextId('invocation'),
    ritual: options.ritual,
    status: 'pending',
    createdAt: timestamp,
    updatedAt: timestamp,
    payload,
    metadata,
    notes: [],
  };
}

export function advanceInvocation(
  record: InvocationRecord,
  status: InvocationStatus,
  note?: string,
  metadata?: InvocationMetadata,
): InvocationRecord {
  const timestamp = new Date().toISOString();
  const notes = note ? [...record.notes, note] : [...record.notes];
  const nextMetadata = metadata
    ? { ...(record.metadata ?? {}), ...metadata }
    : record.metadata;

  return {
    ...record,
    status,
    updatedAt: timestamp,
    metadata: nextMetadata,
    notes,
  };
}

export function annotateInvocation(
  record: InvocationRecord,
  note: string,
  metadata?: InvocationMetadata,
): InvocationRecord {
  return advanceInvocation(record, record.status, note, metadata);
}
