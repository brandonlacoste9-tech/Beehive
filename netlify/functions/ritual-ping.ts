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

  let body: any = {};
  try {
    if (event.body) body = JSON.parse(event.body);
  } catch {
    // ignore invalid JSON
  }

  const { actor, status } = body || {};
  const normalized: 'ok' | 'fail' = status === 'fail' ? 'fail' : 'ok';

  const store = getStore(STORE);
  const updated = {
    status: normalized,
    updatedAt: new Date().toISOString(),
    ...(actor ? { actor: String(actor) } : {}),
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

  const eventObj = { timestamp: updated.updatedAt, status: normalized, actor: updated['actor'] ?? null };
  const newHistory = [...history, eventObj].slice(-1000);
  await store.set(HISTORY_KEY, newHistory);
  await store.set(KEY, updated);

  await postSlack({
    text: `🐝 *Ritual beacon* ${normalized.toUpperCase()}`,
    blocks: [
      { type: 'section', text: { type: 'mrkdwn', text: `*BeeHive ritual*: *${normalized.toUpperCase()}*` } },
      {
        type: 'context',
        elements: [
          { type: 'mrkdwn', text: `time: \`${updated.updatedAt}\`` },
          ...(updated['actor'] ? [{ type: 'mrkdwn', text: `actor: \`${updated['actor']}\`` }] : []),
        ],
      },
    ],
  });

  return { statusCode: 200, body: JSON.stringify({ ok: true, updated }) };
};
