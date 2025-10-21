import { getStore } from '@netlify/blobs';

export type CodexLineageEntry = {
  jobId: string;
  status: 'queued' | 'building' | 'deploying' | 'success' | 'failed';
  previewUrl?: string | null;
  deployId?: string | null;
  artifactUrl?: string | null;
  sizeBytes?: number | null;
  note?: string | null;
  triggeredAt: string;
  completedAt?: string | null;
};

const STORE = 'beehive_badge';
const HISTORY_KEY = 'codex_spark_history';

function sanitize(entry: CodexLineageEntry): CodexLineageEntry {
  return {
    jobId: entry.jobId,
    status: entry.status,
    triggeredAt: entry.triggeredAt,
    previewUrl: entry.previewUrl ?? null,
    deployId: entry.deployId ?? null,
    artifactUrl: entry.artifactUrl ?? null,
    sizeBytes: typeof entry.sizeBytes === 'number' ? entry.sizeBytes : null,
    note: entry.note ?? null,
    completedAt: entry.completedAt ?? null,
  };
}

export async function appendCodexHistory(entry: CodexLineageEntry, opts?: { max?: number; maxDays?: number }) {
  const store = getStore(STORE);
  const existing = ((await store.get(HISTORY_KEY, { type: 'json' })) as CodexLineageEntry[]) || [];
  const normalized = sanitize(entry);

  const filtered = existing.filter((item) => item.jobId !== normalized.jobId);
  filtered.push(normalized);

  const max = opts?.max ?? 200;
  const maxDays = opts?.maxDays ?? 120;
  const cutoff = Date.now() - maxDays * 86_400_000;

  const pruned = filtered
    .filter((item) => {
      const t = new Date(item.triggeredAt).getTime();
      return Number.isFinite(t) && t >= cutoff;
    })
    .slice(-max);

  await store.set(HISTORY_KEY, pruned);
  return normalized;
}

export async function readCodexHistory(limit = 50): Promise<CodexLineageEntry[]> {
  const store = getStore(STORE);
  const existing = ((await store.get(HISTORY_KEY, { type: 'json' })) as CodexLineageEntry[]) || [];
  if (!limit || existing.length <= limit) {
    return existing;
  }
  return existing.slice(-limit);
}
