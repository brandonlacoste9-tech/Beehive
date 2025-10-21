import type { Handler } from '@netlify/functions';
import { Buffer } from 'node:buffer';
import { addBullet, makePack } from '../../src/context/ace-pack';

type MetricEvt = { ts: string; event: string; pr: number; repo: string; meta?: Record<string, unknown> };

type CacheLike = { put(request: Request, response: Response): Promise<void> };
type CacheStorageLike = { default?: CacheLike };

const ECHO_BUCKET = 'codex_echo';
const HISTORY_BUCKET = 'codex_history';

const has = (value?: string): value is string => typeof value === 'string' && value.length > 0;

const getCache = (): CacheLike | undefined => {
  const store = (globalThis as unknown as { caches?: CacheStorageLike }).caches;
  return store?.default;
};

const putBlob = async (bucket: string, key: string, data: string | Blob) => {
  try {
    const cache = getCache();
    if (!cache) {
      console.warn('[codex] blob cache unavailable', { bucket, key });
      return;
    }

    const target = new Request(`https://blob/${bucket}/${key}`);
    await cache.put(target, new Response(data));
  } catch (error) {
    console.warn('[codex] putBlob failed', { bucket, key, error });
  }
};

const emitMetric = async (evt: MetricEvt) => {
  console.log('[metrics]', evt.event, evt);
  await putBlob('metrics', `${evt.ts}-${evt.event}-${evt.pr}.json`, JSON.stringify(evt));
};

const writeEcho = async (id: string, body: unknown) => {
  const key = `${new Date().toISOString()}-${id}.json`;
  await putBlob(ECHO_BUCKET, key, JSON.stringify(body, null, 2));
  return key;
};

const promoteHistory = async (echoKey: string, note: string) => {
  const promoted = { echoKey, note, promotedAt: new Date().toISOString() };
  await putBlob(HISTORY_BUCKET, `promoted-${promoted.promotedAt}.json`, JSON.stringify(promoted, null, 2));
};

const badgeGate = async (
  badge: 'deploy:proposed' | 'escalate',
  ctx: { reason: string; payload?: unknown }
) => {
  if (badge.startsWith('deploy') && has(process.env.SLACK_WEBHOOK_URL)) {
    await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        text: `🛡️ *Approval needed*: ${ctx.reason}\n\`\`\`\n${JSON.stringify(ctx.payload, null, 2)}\n\`\`\``,
      }),
    });

    throw new Error('Awaiting operator approval (HITL gate).');
  }
};

const extractResponseText = (payload: any): string => {
  if (!payload) return '';
  if (typeof payload.output_text === 'string' && payload.output_text.length > 0) {
    return payload.output_text;
  }

  if (Array.isArray(payload.output)) {
    const collected = payload.output
      .flatMap((entry: any) => entry?.content ?? [])
      .map((piece: any) => piece?.text)
      .filter((text: unknown): text is string => typeof text === 'string');
    if (collected.length > 0) return collected.join('\n');
  }

  if (Array.isArray(payload.choices)) {
    const choice = payload.choices[0];
    const message = choice?.message?.content;
    if (typeof message === 'string') return message;
    if (Array.isArray(message)) {
      const text = message
        .map((part: any) => part?.text)
        .filter((value: unknown): value is string => typeof value === 'string')
        .join('\n');
      if (text.length > 0) return text;
    }
  }

  return typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2);
};

const OPENAI_BASE = has(process.env.OPENAI_API_BASE)
  ? process.env.OPENAI_API_BASE
  : 'https://api.openai.com/v1';

const handler: Handler = async (event) => {
  if (!event.body) {
    return { statusCode: 400, body: 'Missing request body.' };
  }

  const payload = JSON.parse(event.body) as {
    repo?: string;
    pr?: number;
    base?: string;
    head?: string;
    diff?: string;
  };

  const { repo = 'unknown', pr = 0, base = 'origin/main', head = 'HEAD', diff = '' } = payload;

  const siteUrl = process.env.URL ?? process.env.SITE_URL ?? 'https://codex.local';
  const diffBytes = Buffer.byteLength(diff, 'utf8');

  const aceSeed = makePack(`Review PR #${pr} in ${repo}`);
  const acePrimed = addBullet(
    aceSeed,
    'agent',
    `Diff received (${diffBytes} bytes) between ${base} and ${head}.`
  );

  const startTs = new Date().toISOString();
  await emitMetric({ ts: startTs, event: 'start', pr, repo, meta: { diffBytes, siteUrl } });
  const echoKey = await writeEcho(`pr-${pr}-start`, {
    repo,
    base,
    head,
    diffBytes,
    ace: acePrimed,
  });

  const prompt = `You are Codex, an elite reviewer. Provide concise, high-signal insights for PR #${pr} in ${repo}.\n` +
    `Base: ${base}\nHead: ${head}\nDiff:\n${diff}`;

  const gatewayUrl = `${OPENAI_BASE.replace(/\/$/, '')}/responses`;

  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (has(process.env.OPENAI_API_KEY)) {
    headers.authorization = `Bearer ${process.env.OPENAI_API_KEY}`;
  }

  const response = await fetch(gatewayUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({ model: 'gpt-5-pro', input: prompt }),
  });

  if (!response.ok) {
    const failureBody = await response.text();
    await emitMetric({
      ts: new Date().toISOString(),
      event: 'failure',
      pr,
      repo,
      meta: { status: response.status, failureBody },
    });
    await badgeGate('escalate', {
      reason: 'Codex review failed',
      payload: { status: response.status, failureBody, pr, repo },
    });
    return {
      statusCode: 502,
      body: `Codex review failed (${response.status}).\n${failureBody}`,
    };
  }

  const result = await response.json();
  const summary = extractResponseText(result);

  const aceFinal = addBullet(acePrimed, 'agent', 'Codex analysis captured.');

  await emitMetric({
    ts: new Date().toISOString(),
    event: 'success',
    pr,
    repo,
    meta: { tokens: result?.usage, aceVersion: aceFinal.version },
  });

  await writeEcho(`pr-${pr}-result`, { summary, pr, repo, ace: aceFinal, usage: result?.usage });

  if (false) {
    await promoteHistory(echoKey, 'High-signal Codex review');
  }

  if (false) {
    await badgeGate('deploy:proposed', {
      reason: 'PR auto-deploy proposal',
      payload: { pr, repo, echoKey },
    });
  }

  const overlay = [
    '---',
    'meta: {',
    `  jobId: "${echoKey}",`,
    `  echoKey: "${echoKey}",`,
    `  sizeBytes: ${diffBytes},`,
    '  status: "success"',
    '}',
    `site: ${siteUrl}`,
    '---',
  ].join('\n');

  const body = `Codex Swarm Review — PR #${pr}\nRepository: ${repo}\nBase → Head: ${base} → ${head}\n${overlay}\n${summary}`;

  return {
    statusCode: 200,
    body,
  };
};

export { handler };
