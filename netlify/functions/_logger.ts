import { getStore } from '@netlify/blobs';
import { env } from 'node:process';

type Level = 'debug' | 'info' | 'warn' | 'error';
type Overlay = Record<string, unknown>;

type MutationStatus = 'success' | 'failure';

type MutationLogInput = {
  actor: string;
  ritual: string;
  status: MutationStatus;
  message?: string;
  metadata?: Record<string, unknown> | null;
  overlay?: Overlay | null;
};

type MutationHistoryEntry = {
  timestamp: string;
  status: 'ok' | 'fail';
  actor: string;
  ritual: string;
  message: string | null;
  metadata: Record<string, unknown> | null;
  overlay?: Overlay;
};

const STORE = 'beehive_badge';
const STATUS_KEY = 'ritual_status';
const HISTORY_KEY = 'history';
const LOG_FORMAT = (env.LOG_FORMAT ?? 'json').toLowerCase();

function ts() {
  return new Date().toISOString();
}

function line(o: Record<string, unknown>) {
  if (LOG_FORMAT === 'plain') {
    const { level, msg, ...rest } = o;
    return `[${o.time}] ${String(level).toUpperCase()}: ${msg}` +
      (Object.keys(rest).length ? ` ${JSON.stringify(rest)}` : '');
  }
  return JSON.stringify(o);
}

function base(
  level: Level,
  msg: string,
  extra?: Record<string, unknown>,
  overlay?: Overlay
) {
  const event: Record<string, unknown> = {
    time: ts(),
    level,
    msg,
    fn: env.NETLIFY_FUNCTION_NAME ?? 'unknown',
    requestId: env.NETLIFY_REQUEST_ID ?? undefined,
    codexReplayOverlay: overlay ?? undefined,
    ...extra,
  };
  const writer =
    level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
  writer(line(event));
}

export const log = {
  debug: (msg: string, extra?: Record<string, unknown>, overlay?: Overlay) =>
    base('debug', msg, extra, overlay),
  info: (msg: string, extra?: Record<string, unknown>, overlay?: Overlay) =>
    base('info', msg, extra, overlay),
  warn: (msg: string, extra?: Record<string, unknown>, overlay?: Overlay) =>
    base('warn', msg, extra, overlay),
  error: (msg: string, extra?: Record<string, unknown>, overlay?: Overlay) =>
    base('error', msg, extra, overlay),
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function resolveOverlay(entry: MutationLogInput): Overlay | undefined {
  if (entry.overlay && isRecord(entry.overlay)) {
    return entry.overlay;
  }
  const metadataOverlay = isRecord(entry.metadata) && isRecord(entry.metadata.overlay)
    ? (entry.metadata.overlay as Overlay)
    : undefined;
  return metadataOverlay;
}

export async function logMutation(entry: MutationLogInput) {
  const store = getStore(STORE);
  const timestamp = ts();
  const normalized: 'ok' | 'fail' = entry.status === 'success' ? 'ok' : 'fail';
  const overlay = resolveOverlay(entry);

  let history: MutationHistoryEntry[] = [];
  try {
    history =
      ((await store.get(HISTORY_KEY, { type: 'json' })) as MutationHistoryEntry[]) || [];
  } catch (error) {
    log.warn('mutation history read failed', {
      err: error instanceof Error ? error.message : String(error),
    });
  }

  const record: MutationHistoryEntry = {
    timestamp,
    status: normalized,
    actor: entry.actor,
    ritual: entry.ritual,
    message: entry.message ?? null,
    metadata: entry.metadata ?? null,
    ...(overlay ? { overlay } : {}),
  };

  const nextHistory = [...history, record].slice(-1000);

  try {
    await store.set(HISTORY_KEY, nextHistory);
  } catch (error) {
    log.error('mutation history append failed', {
      err: error instanceof Error ? error.message : String(error),
    });
  }

  const statusPayload: Record<string, unknown> = {
    status: normalized,
    updatedAt: timestamp,
    actor: entry.actor,
    ritual: entry.ritual,
    ...(entry.message ? { message: entry.message } : {}),
    ...(overlay ? { overlay } : {}),
  };

  try {
    await store.set(STATUS_KEY, statusPayload);
  } catch (error) {
    log.error('mutation badge update failed', {
      err: error instanceof Error ? error.message : String(error),
    });
  }
}
