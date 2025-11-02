import type { Handler } from '@netlify/functions';
import { log, logMutation } from './_logger';
import { env } from 'node:process';
import { setTimeout as delay } from 'node:timers/promises';

const TIMEOUT_MS = Number(env.RITUAL_TIMEOUT_MS ?? 30_000);
const MAX_RETRIES = Number(env.RITUAL_MAX_RETRIES ?? 3);
const PARALLEL_LIMIT = Math.max(1, Number(env.RITUAL_PARALLEL_LIMIT ?? 3));

function githubToken() {
  return (
    env.GITHUB_TOKEN ??
    env.GITHUB_PAT ??
    env.CODEX_GITHUB_TOKEN ??
    env.GITHUB_APP_TOKEN ??
    ''
  );
}

function githubRepo() {
  return env.GITHUB_REPO ?? env.CODEX_GITHUB_REPO ?? '';
}

async function gh(path: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const token = githubToken();
    const baseHeaders: Record<string, string> = {
      accept: 'application/vnd.github+json',
      'x-github-api-version': '2022-11-28',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    };

    const headers = {
      ...baseHeaders,
      ...(init?.headers as Record<string, string> | undefined),
    };

    return await fetch(`https://api.github.com${path}`, {
      ...init,
      headers,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function retry<T>(fn: () => Promise<T>, label: string): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const nextDelay = 250 * Math.pow(2, attempt);
      log.warn('retrying ritual action', { label, attempt: attempt + 1, waitMs: nextDelay });
      await delay(nextDelay);
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

function requireEnv(name: string, value?: string) {
  if (!value) {
    throw new Error(`Missing required env: ${name}`);
  }
  return value;
}

function normalizeArray<T>(value: T | T[] | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

type Ritual =
  | { kind: 'sequential'; steps: Action[] }
  | { kind: 'parallel'; steps: Action[] };

type Action =
  | { type: 'hydrate-pr'; number: number }
  | { type: 'comment-pr'; number: number; body: string }
  | { type: 'label-pr'; number: number; labels: string[] }
  | { type: 'run-webhook'; url: string; payload?: unknown };

type OrchestratorRequest = {
  rituals?: Ritual[];
  idemKey?: string;
};

type PRHydration = {
  pr: unknown;
  files: unknown[];
  comments: unknown[];
  commits: unknown[];
};

async function hydratePR(number: number): Promise<PRHydration> {
  const repo = requireEnv('GITHUB_REPO', githubRepo());
  const base = `/repos/${repo}/pulls/${number}`;
  const [pr, files, comments, commits] = await Promise.all([
    retry(async () => {
      const response = await gh(base);
      if (!response.ok) throw new Error(`PR ${number} fetch failed: ${response.status}`);
      return response.json();
    }, `pr-${number}`),
    retry(async () => {
      const response = await gh(`${base}/files?per_page=300`);
      if (!response.ok) throw new Error(`PR files ${number} fetch failed: ${response.status}`);
      return response.json();
    }, `files-${number}`),
    retry(async () => {
      const response = await gh(`/repos/${repo}/issues/${number}/comments?per_page=100`);
      if (!response.ok)
        throw new Error(`PR comments ${number} fetch failed: ${response.status}`);
      return response.json();
    }, `comments-${number}`),
    retry(async () => {
      const response = await gh(`${base}/commits?per_page=250`);
      if (!response.ok) throw new Error(`PR commits ${number} fetch failed: ${response.status}`);
      return response.json();
    }, `commits-${number}`),
  ]);

  return { pr, files, comments, commits };
}

async function execAction(action: Action) {
  switch (action.type) {
    case 'hydrate-pr': {
      const token = githubToken();
      if (!token) {
        log.warn('hydrate-pr skipped: missing GitHub token', { prNumber: action.number });
        return { pr: null, files: [], comments: [], commits: [] } satisfies PRHydration;
      }
      const hydrated = await hydratePR(action.number);
      const overlay = { hydrated: true, prNumber: action.number };
      log.info('hydrated pull request', { prNumber: action.number }, overlay);
      return hydrated;
    }
    case 'comment-pr': {
      const repo = requireEnv('GITHUB_REPO', githubRepo());
      const body = action.body.slice(0, 65_536);
      await retry(async () => {
        const response = await gh(`/repos/${repo}/issues/${action.number}/comments`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ body }),
        });
        if (!response.ok) throw new Error(`comment failed: ${response.status}`);
      }, `comment-${action.number}`);
      log.info('commented pull request', { prNumber: action.number });
      return;
    }
    case 'label-pr': {
      const repo = requireEnv('GITHUB_REPO', githubRepo());
      const labels = normalizeArray(action.labels).slice(0, 20);
      await retry(async () => {
        const response = await gh(`/repos/${repo}/issues/${action.number}/labels`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ labels }),
        });
        if (!response.ok) throw new Error(`label failed: ${response.status}`);
      }, `label-${action.number}`);
      log.info('labeled pull request', { prNumber: action.number, labels });
      return;
    }
    case 'run-webhook': {
      await retry(async () => {
        const response = await fetch(action.url, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(action.payload ?? {}),
        });
        if (!response.ok) throw new Error(`webhook failed: ${response.status}`);
      }, `webhook-${action.url}`);
      log.info('webhook invoked', { url: action.url });
      return;
    }
    default: {
      const exhaustive: never = action;
      return exhaustive;
    }
  }
}

async function runParallel(steps: Action[]) {
  const queue = steps.map((step, index) => ({ step, index }));
  const running = new Set<Promise<void>>();
  const results: unknown[] = new Array(steps.length);

  while (queue.length || running.size) {
    while (queue.length && running.size < PARALLEL_LIMIT) {
      const { step, index } = queue.shift()!;
      const task = execAction(step)
        .then((value) => {
          results[index] = value;
        })
        .finally(() => {
          running.delete(task);
        });
      running.add(task);
    }

    if (running.size) {
      await Promise.race(Array.from(running));
    }
  }

  return results;
}

async function runSequential(steps: Action[]) {
  const results: unknown[] = [];
  for (const step of steps) {
    results.push(await execAction(step));
  }
  return results;
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: { Allow: 'POST' }, body: 'Use POST' };
  }

  let request: OrchestratorRequest;
  try {
    request = JSON.parse(event.body ?? '{}');
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  const rituals = Array.isArray(request.rituals) ? request.rituals : [];
  const token = githubToken();

  if (!token) {
    log.warn('no GitHub token configured; hydration disabled');
  }

  const baseOverlay = {
    replayReady: Boolean(token),
    idemKey: request.idemKey ?? null,
    rituals: rituals.length,
    jobId: env.NETLIFY_REQUEST_ID ?? null,
  };

  const actor = request.idemKey ? `orchestrator/${request.idemKey}` : 'orchestrator';
  const startedAt = Date.now();

  try {
    const results: unknown[] = [];
    for (const ritual of rituals) {
      if (ritual?.kind === 'parallel') {
        results.push(await runParallel(ritual.steps ?? []));
      } else if (ritual?.kind === 'sequential') {
        results.push(await runSequential(ritual.steps ?? []));
      } else {
        throw new Error('Unknown ritual kind');
      }
    }

    const durationMs = Date.now() - startedAt;
    const sizeBytes = Buffer.byteLength(JSON.stringify(results));
    const overlay = { ...baseOverlay, status: 'success', durationMs, sizeBytes } as const;

    log.info('orchestration complete', { durationMs, resultsCount: results.length }, overlay);

    await logMutation({
      actor,
      ritual: 'orchestrator',
      status: 'success',
      message: `executed ${rituals.length} ritual groups in ${durationMs}ms`,
      metadata: { overlay },
    });

    const responseBody = {
      ok: true,
      ms: durationMs,
      results,
      codexReplayOverlay: overlay,
    };

    return {
      statusCode: 200,
      headers: {
        'content-type': 'application/json',
        'x-replay-ready': String(overlay.replayReady),
      },
      body: JSON.stringify(responseBody),
    };
  } catch (error) {
    const durationMs = Date.now() - startedAt;
    const message = error instanceof Error ? error.message : String(error);
    const overlay = { ...baseOverlay, status: 'failure', durationMs } as const;

    log.error('orchestration failed', { durationMs, err: message }, overlay);

    await logMutation({
      actor,
      ritual: 'orchestrator',
      status: 'failure',
      message,
      metadata: { overlay },
    });

    return {
      statusCode: 500,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ok: false, error: message }),
    };
  }
};
