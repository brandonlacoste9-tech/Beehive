import type { Handler } from '@netlify/functions';
import { getStore } from '@netlify/blobs';

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL!;
const BEACON_TOKEN = process.env.BEACON_TOKEN;

const STORE = 'beehive_badge';
const KEY = 'ritual_status';
const HISTORY_KEY = 'history';

function isLocalContext() {
  const ctx = (process.env.CONTEXT || '').toLowerCase();
  return ctx === 'local' || ctx === 'dev' || ctx === 'development' || process.env.NETLIFY_DEV === 'true';
}

function normalizeSizeBytes(value: unknown): number | undefined {
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
  return undefined;
}

function formatNumber(value: number): string {
  try {
    return new Intl.NumberFormat('en-US').format(value);
  } catch {
    return String(value);
  }
}

async function postSlack(payload: unknown) {
  if (!SLACK_WEBHOOK_URL) return;
  try {
    const res = await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    await res.text().catch(() => {});
  } catch {
    // ignore Slack errors
  }
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: { Allow: 'POST' }, body: 'Method not allowed' };
  }

  // authenticate for prod
  if (!isLocalContext()) {
    const token =
      (event.headers['x-beehive-token'] as string) ??
      (event.headers['X-Beehive-Token'] as unknown as string);
    if (!BEACON_TOKEN || token !== BEACON_TOKEN) {
      return { statusCode: 401, body: 'unauthorized' };
    }
  }

  let body: Record<string, unknown> = {};
  try {
    if (event.body) {
      const parsed = JSON.parse(event.body) as unknown;
      if (parsed && typeof parsed === 'object') {
        body = parsed as Record<string, unknown>;
      }
    }
  } catch {
    // ignore invalid JSON
  }

  const actor = body?.actor;
  const status = body?.status;
  const normalized: 'ok' | 'fail' = status === 'fail' ? 'fail' : 'ok';

  const jobIdRaw = body?.jobId ?? body?.job_id;
  const artifactUrlRaw = body?.artifactUrl ?? body?.artifact_url;
  const sizeRaw = body?.sizeBytes ?? body?.size_bytes;
  const notesRaw = body?.notes;

  const actorStr = typeof actor === 'string' && actor.trim() ? actor.trim() : actor ? String(actor) : undefined;
  const jobId = typeof jobIdRaw === 'string' && jobIdRaw.trim() ? jobIdRaw.trim() : undefined;
  const artifactUrl =
    typeof artifactUrlRaw === 'string' && artifactUrlRaw.trim() ? artifactUrlRaw.trim() : undefined;
  const sizeBytes = normalizeSizeBytes(sizeRaw);
  const notes = typeof notesRaw === 'string' && notesRaw.trim() ? notesRaw.trim() : undefined;

  const store = getStore(STORE);
  const updated = {
    status: normalized,
    updatedAt: new Date().toISOString(),
    ...(actorStr ? { actor: actorStr } : {}),
    ...(jobId ? { jobId } : {}),
    ...(typeof sizeBytes === 'number' ? { sizeBytes } : {}),
    ...(artifactUrl ? { artifactUrl } : {}),
    ...(notes ? { notes } : {}),
  };

  // avoid duplicates within 10 seconds
  const history = ((await store.get(HISTORY_KEY, { type: 'json' })) as any[]) || [];
  const last = history.length ? history[history.length - 1] : null;
  const now = Date.now();
  if (last && last.status === normalized && Math.abs(now - new Date(last.timestamp).getTime()) < 10_000) {
    return {
      statusCode: 202,
      body: JSON.stringify({ ok: false, reason: 'Duplicate ping within 10s', updated }),
    };
  }

  const eventObj = {
    timestamp: updated.updatedAt,
    status: normalized,
    actor: actorStr ?? null,
    jobId: jobId ?? null,
    sizeBytes: typeof sizeBytes === 'number' ? sizeBytes : null,
    artifactUrl: artifactUrl ?? null,
    notes: notes ?? null,
  };
  const newHistory = [...history, eventObj].slice(-1000);
  await store.set(HISTORY_KEY, newHistory);
  await store.set(KEY, updated);

  const contextElements = [
    { type: 'mrkdwn', text: `time: \`${updated.updatedAt}\`` },
    ...(actorStr ? [{ type: 'mrkdwn', text: `actor: \`${actorStr}\`` }] : []),
    ...(jobId ? [{ type: 'mrkdwn', text: `job: \`${jobId}\`` }] : []),
  ];

  const detailLines = [
    typeof sizeBytes === 'number' ? `• *sizeBytes:* \`${formatNumber(sizeBytes)}\`` : null,
    artifactUrl ? `• *artifact:* <${artifactUrl}|open>` : null,
    notes ? `• *notes:* ${notes}` : null,
  ].filter(Boolean);

  const blocks: Array<Record<string, unknown>> = [
    { type: 'section', text: { type: 'mrkdwn', text: `*BeeHive ritual*: *${normalized.toUpperCase()}*` } },
    { type: 'context', elements: contextElements },
  ];

  if (detailLines.length > 0) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: detailLines.join('\n'),
      },
    });
  }

  await postSlack({
    text: `🐝 *Ritual beacon* ${normalized.toUpperCase()}`,
    blocks,
  });

  return { statusCode: 200, body: JSON.stringify({ ok: true, updated }) };
};
