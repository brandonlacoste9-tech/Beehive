import { getStore } from '@netlify/blobs';
import { appendCodexHistory, type CodexLineageEntry } from './codex_history';

export type CodexSparkStatus = Omit<CodexLineageEntry, 'completedAt'> & {
  completedAt?: string | null;
};

const STORE = 'beehive_badge';
const STATUS_KEY = 'codex_spark_status';

function normaliseStatus(status: string): CodexSparkStatus['status'] {
  const lowered = status.toLowerCase();
  if (lowered === 'queued' || lowered === 'building' || lowered === 'deploying') {
    return lowered;
  }
  if (lowered === 'success' || lowered === 'succeeded' || lowered === 'ok' || lowered === 'complete') {
    return 'success';
  }
  if (lowered === 'failed' || lowered === 'error') {
    return 'failed';
  }
  return 'queued';
}

export async function echoSparkStatus(status: CodexSparkStatus) {
  const store = getStore(STORE);
  const now = new Date().toISOString();
  const payload: CodexSparkStatus = {
    jobId: status.jobId,
    status: normaliseStatus(status.status),
    previewUrl: status.previewUrl ?? null,
    deployId: status.deployId ?? null,
    artifactUrl: status.artifactUrl ?? null,
    sizeBytes: typeof status.sizeBytes === 'number' ? status.sizeBytes : null,
    note: status.note ?? null,
    triggeredAt: status.triggeredAt ?? now,
    completedAt: status.completedAt ?? null,
  };

  await store.set(STATUS_KEY, payload);
  await appendCodexHistory({
    jobId: payload.jobId,
    status: payload.status,
    previewUrl: payload.previewUrl,
    deployId: payload.deployId,
    artifactUrl: payload.artifactUrl,
    sizeBytes: payload.sizeBytes,
    note: payload.note,
    triggeredAt: payload.triggeredAt,
    completedAt: payload.completedAt ?? undefined,
  });

  return payload;
}

export async function readSparkStatus(): Promise<CodexSparkStatus | null> {
  const store = getStore(STORE);
  const payload = (await store.get(STATUS_KEY, { type: 'json' })) as CodexSparkStatus | null;
  return payload ?? null;
}
