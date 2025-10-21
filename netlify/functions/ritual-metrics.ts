import type { Handler } from '@netlify/functions';
import { getStore } from '@netlify/blobs';

const STORE = 'beehive_badge';
const HISTORY_KEY = 'history';
const VERSION = 1;

type MetricEntry = {
  timestamp: string;
  status: 'ok' | 'fail';
  actor: string | null;
  jobId: string | null;
  sizeBytes: number | null;
  artifactUrl: string | null;
  notes: string | null;
};

function parseSizeBytes(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.max(0, Math.round(value));
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed) {
      const parsed = Number(trimmed);
      if (Number.isFinite(parsed)) {
        return Math.max(0, Math.round(parsed));
      }
    }
  }
  return null;
}

function toMetricEntry(raw: any): MetricEntry | null {
  if (!raw || typeof raw !== 'object') return null;
  const status: 'ok' | 'fail' = raw.status === 'fail' ? 'fail' : 'ok';

  const timestampCandidate =
    typeof raw.timestamp === 'string' && raw.timestamp
      ? raw.timestamp
      : typeof raw.updatedAt === 'string' && raw.updatedAt
      ? raw.updatedAt
      : null;
  if (!timestampCandidate) return null;

  const actor =
    typeof raw.actor === 'string' && raw.actor.trim() ? raw.actor.trim() : null;
  const jobId =
    typeof raw.jobId === 'string' && raw.jobId.trim() ? raw.jobId.trim() : null;
  const artifactUrlCandidate = raw.artifactUrl ?? raw.artifact_url;
  const artifactUrl =
    typeof artifactUrlCandidate === 'string' && artifactUrlCandidate.trim()
      ? artifactUrlCandidate.trim()
      : null;
  const notes =
    typeof raw.notes === 'string' && raw.notes.trim() ? raw.notes.trim() : null;
  const sizeCandidate = raw.sizeBytes ?? raw.size_bytes;
  const sizeBytes = parseSizeBytes(sizeCandidate);

  return {
    timestamp: timestampCandidate,
    status,
    actor,
    jobId,
    sizeBytes,
    artifactUrl,
    notes,
  };
}

function pruneHistory<T extends { timestamp: string }>(list: T[], max = 1000, maxDays = 90) {
  const cutoff = Date.now() - maxDays * 86_400_000;
  return (list || [])
    .filter((entry) => {
      const t = new Date(entry.timestamp).getTime();
      return Number.isFinite(t) && t > cutoff;
    })
    .slice(-max);
}

function summarize(entry: MetricEntry) {
  return {
    timestamp: entry.timestamp,
    status: entry.status,
    actor: entry.actor,
    jobId: entry.jobId,
    sizeBytes: entry.sizeBytes,
    artifactUrl: entry.artifactUrl,
    notes: entry.notes,
  };
}

export const handler: Handler = async () => {
  const store = getStore(STORE);
  const rawHistory = ((await store.get(HISTORY_KEY, { type: 'json' })) as any[]) || [];
  const history = rawHistory
    .map((entry) => toMetricEntry(entry))
    .filter((entry): entry is MetricEntry => entry !== null);

  const now = Date.now();
  const lastDay = now - 86_400_000;

  const total = history.length;
  const ok = history.filter((e) => e.status === 'ok').length;
  const fail = history.filter((e) => e.status === 'fail').length;

  const recent = history.filter((e) => new Date(e.timestamp).getTime() > lastDay);
  const last24 = recent.length;
  const last24Ok = recent.filter((e) => e.status === 'ok').length;

  const bytesTotal = history.reduce((sum, entry) => sum + (entry.sizeBytes ?? 0), 0);
  const bytesLast24 = recent.reduce((sum, entry) => sum + (entry.sizeBytes ?? 0), 0);

  const current = total ? history[total - 1] : null;
  const currentPayload = current ? summarize(current) : null;
  const overlay = current
    ? {
        status: current.status,
        jobId: current.jobId,
        sizeBytes: current.sizeBytes,
        artifactUrl: current.artifactUrl,
        timestamp: current.timestamp,
        actor: current.actor,
        notes: current.notes,
      }
    : null;

  const payload = {
    version: VERSION,
    current: currentPayload,
    statistics: {
      total,
      ok,
      fail,
      success_ratio: total ? (ok / total) * 100 : null,
      bytes_total: bytesTotal || null,
      bytes_last_24h: bytesLast24 || null,
    },
    uptime: {
      last_24h: last24 ? (last24Ok / last24) * 100 : null,
    },
    replay_overlay: overlay,
    recent_history: pruneHistory(history, 10).map(summarize),
  };

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'max-age=30',
    },
    body: JSON.stringify(payload),
  };
};
