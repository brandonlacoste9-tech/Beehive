import type { Handler } from '@netlify/functions';
import { getStore } from '@netlify/blobs';
import { createHash } from 'node:crypto';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN ?? process.env.RELEASE_NOTES_GITHUB_TOKEN;
const GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY ?? process.env.GITHUB_REPO;
const CHANGELOG_PATH = process.env.RELEASE_NOTES_CHANGELOG_PATH ?? 'CHANGELOG.md';
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const MUTATIONS_TABLE = process.env.RELEASE_NOTES_MUTATIONS_TABLE ?? 'codex_mutations';
const MUTATION_STORE = process.env.RELEASE_NOTES_MUTATION_STORE ?? 'beehive_mutations';
const MUTATION_HISTORY_KEY = 'release_notes_history';
const MUTATION_HISTORY_LIMIT = 200;

interface PullRequestSummary {
  number: number;
  title: string;
  html_url: string;
  merged_at?: string | null;
  merged_by?: { login?: string | null } | null;
  user?: { login?: string | null } | null;
  merge_commit_sha?: string | null;
}

interface WebhookPayload {
  action?: string;
  pull_request?: PullRequestSummary & { merged: boolean };
  repository?: { full_name?: string; default_branch?: string };
}

function json(statusCode: number, payload: Record<string, unknown>) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload),
  };
}

function buildJobId(base?: string) {
  const stamp = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return [base ?? 'release-notes', stamp, rand].join('-');
}

function parseBody(event: Parameters<Handler>[0]) {
  if (!event.body) return {};
  const raw = event.isBase64Encoded
    ? Buffer.from(event.body, 'base64').toString('utf8')
    : event.body;
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function normaliseRepo(fullName?: string | null) {
  if (fullName) return fullName;
  return GITHUB_REPOSITORY ?? null;
}

function extractPr(payload: Record<string, unknown>, eventType?: string) {
  if (eventType === 'pull_request') {
    const pr = (payload as WebhookPayload)?.pull_request;
    if (pr) return pr;
  }

  if ('pull_request' in payload && payload.pull_request && typeof payload.pull_request === 'object') {
    return payload.pull_request as PullRequestSummary & { merged?: boolean };
  }

  if ('pr' in payload && typeof payload.pr === 'object') {
    return payload.pr as PullRequestSummary & { merged?: boolean };
  }

  return payload as PullRequestSummary & { merged?: boolean };
}

async function githubFetch(path: string, init: RequestInit = {}) {
  if (!GITHUB_TOKEN) {
    throw new Error('Missing GITHUB_TOKEN/RELEASE_NOTES_GITHUB_TOKEN');
  }

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'beehive-release-notes',
    Authorization: `Bearer ${GITHUB_TOKEN}`,
  };

  if (init.headers) {
    for (const [key, value] of Object.entries(init.headers as Record<string, string>)) {
      headers[key] = value;
    }
  }

  const response = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(`GitHub request failed (${response.status} ${path}): ${message}`);
  }

  return response;
}

function buildEntry(pr: PullRequestSummary, mergedAt?: string | null) {
  const mergedDate = mergedAt ?? pr.merged_at ?? new Date().toISOString();
  const day = new Date(mergedDate).toISOString().slice(0, 10);
  const steward = pr.merged_by?.login ?? pr.user?.login ?? 'unknown';
  const lines = [
    `### ${day} — #${pr.number} ${pr.title}`,
    `- Steward: @${steward}`,
  ];

  if (pr.merge_commit_sha) {
    lines.push(`- Merge commit: ${pr.merge_commit_sha}`);
  }
  lines.push(`- URL: ${pr.html_url}`);

  return `${lines.join('\n')}\n`;
}

function normaliseEntry(entry: string) {
  return entry.replace(/\r?\n/g, '\n').trim();
}

function fingerprintEntry(entry: string) {
  return createHash('sha256').update(normaliseEntry(entry)).digest('hex');
}

function injectEntry(existing: string, entry: string) {
  const normalisedExisting = existing.replace(/\r?\n/g, '\n');
  const trimmedEntry = normaliseEntry(entry);

  if (normalisedExisting.includes(trimmedEntry)) {
    return { content: existing, changed: false };
  }

  const trimmedCurrent = existing.trimEnd();
  const nextContent = trimmedCurrent
    ? `${trimmedCurrent}\n\n${trimmedEntry}\n`
    : `${trimmedEntry}\n`;

  return { content: nextContent.endsWith('\n') ? nextContent : `${nextContent}\n`, changed: true };
}

function measureEntry(entry: string) {
  const normalised = normaliseEntry(entry);
  const sizeBytes = Buffer.byteLength(`${normalised}\n`, 'utf8');
  const hash = fingerprintEntry(entry);
  return { sizeBytes, hash, normalized: normalised };
}

async function updateChangelog(repo: string, branch: string, entry: string) {
  const encodedPath = encodeURIComponent(CHANGELOG_PATH);
  const response = await githubFetch(`/repos/${repo}/contents/${encodedPath}?ref=${encodeURIComponent(branch)}`);
  const payload = (await response.json()) as { content: string; sha: string };
  const current = Buffer.from(payload.content, 'base64').toString('utf8');
  const { content, changed } = injectEntry(current, entry);

  if (!changed) {
    return { changed: false, sha: payload.sha };
  }

  await githubFetch(`/repos/${repo}/contents/${encodedPath}`, {
    method: 'PUT',
    body: JSON.stringify({
      message: `docs: add release notes for #${entry.match(/#(\d+)/)?.[1] ?? '?'}`,
      content: Buffer.from(content, 'utf8').toString('base64'),
      sha: payload.sha,
      branch,
      committer: {
        name: 'Beehive Codex',
        email: 'ops@adgen.ai',
      },
    }),
  });

  return { changed: true };
}

async function postComment(repo: string, number: number, body: string) {
  await githubFetch(`/repos/${repo}/issues/${number}/comments`, {
    method: 'POST',
    body: JSON.stringify({ body }),
  });
}

async function recordMutation(record: Record<string, unknown>) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return { recorded: false, reason: 'missing_supabase_env' };
  }

  const res = await fetch(`${SUPABASE_URL}/rest/v1/${MUTATIONS_TABLE}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(record),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`Supabase insert failed: ${text}`);
  }

  return { recorded: true };
}

async function updateMutationFeed(event: Record<string, unknown>) {
  try {
    const store = getStore(MUTATION_STORE);
    const history = ((await store.get(MUTATION_HISTORY_KEY, { type: 'json' })) as any[]) || [];
    const enrichedEvent = {
      ...event,
      timestamp:
        event.timestamp ??
        (typeof event.inserted_at === 'string' ? event.inserted_at : new Date().toISOString()),
    };
    const next = [...history, enrichedEvent].slice(-MUTATION_HISTORY_LIMIT);
    await store.set(MUTATION_HISTORY_KEY, next);
  } catch {
    // ignore store errors
  }
}

export const handler: Handler = async (event) => {
  const jobId = buildJobId(event.headers['x-nf-request-id']);

  if (event.httpMethod !== 'POST') {
    return json(405, { jobId, status: 'rejected', reason: 'method_not_allowed' });
  }

  const eventType =
    (event.headers['x-github-event'] as string) ??
    (event.headers['X-GitHub-Event'] as unknown as string) ??
    null;

  const payload = parseBody(event);

  if (eventType === 'ping') {
    return json(200, { jobId, status: 'ok', reason: 'pong' });
  }

  const repo = normaliseRepo((payload as WebhookPayload)?.repository?.full_name);
  if (!repo) {
    return json(400, { jobId, status: 'error', reason: 'missing_repository' });
  }

  const pr = extractPr(payload, eventType);
  if (!pr || !pr.number) {
    return json(400, { jobId, status: 'error', reason: 'missing_pr' });
  }

  const mergedFlag =
    (pr as { merged?: boolean }).merged ??
    (payload as WebhookPayload)?.pull_request?.merged ??
    false;

  if (!mergedFlag) {
    return json(202, { jobId, status: 'skipped', reason: 'pr_not_merged', pr: pr.number });
  }

  const branch =
    process.env.RELEASE_NOTES_BRANCH ??
    ((payload as WebhookPayload)?.repository?.default_branch ?? 'main');

  const entry = buildEntry(
    {
      number: pr.number,
      title: pr.title,
      html_url:
        pr.html_url ?? `https://github.com/${repo}/pull/${pr.number}`,
      merged_at: pr.merged_at,
      merged_by: pr.merged_by,
      user: pr.user,
      merge_commit_sha: pr.merge_commit_sha,
    },
    (payload as any)?.merged_at as string | undefined
  );
  const metrics = measureEntry(entry);
  const steward = pr.merged_by?.login ?? pr.user?.login ?? 'unknown';
  const etchedAt = new Date().toISOString();
  const metadata = {
    branch,
    changelogPath: CHANGELOG_PATH,
    entryHash: metrics.hash,
    sizeBytes: metrics.sizeBytes,
  };

  try {
    const changelog = await updateChangelog(repo, branch, entry);

    if (!changelog.changed) {
      return json(200, {
        jobId,
        status: 'skipped',
        reason: 'entry_exists',
        pr: pr.number,
        steward,
        metadata: { ...metadata, duplicate: true },
      });
    }

    const commentBody = [
      '🧾 **Release notes sealed.**',
      '',
      metrics.normalized,
      '',
      `Ledger job: \`${jobId}\``,
      `Entry hash: \`${metrics.hash.slice(0, 12)}\``,
      `Bytes etched: ${metrics.sizeBytes}`,
      `Branch: \`${branch}\``,
    ].join('\n');

    await postComment(repo, pr.number, commentBody);

    const mutationRecord = {
      ritual: 'release-notes',
      actor: steward,
      status: 'ok',
      pr_number: pr.number,
      repo,
      job_id: jobId,
      payload: metrics.normalized,
      inserted_at: etchedAt,
      entry_hash: metrics.hash,
      size_bytes: metrics.sizeBytes,
      branch,
      changelog_path: CHANGELOG_PATH,
    };

    try {
      await recordMutation(mutationRecord);
    } catch (mutationError) {
      await updateMutationFeed({
        ...mutationRecord,
        status: 'warn',
        error: String(mutationError),
        metadata: { ...metadata, etchedAt },
      });
      return json(200, {
        jobId,
        status: 'partial',
        pr: pr.number,
        warning: 'supabase_logging_failed',
        detail: mutationError instanceof Error ? mutationError.message : String(mutationError),
        steward,
        metadata: { ...metadata, etchedAt },
      });
    }

    await updateMutationFeed({
      ...mutationRecord,
      status: 'ok',
      metadata: { ...metadata, etchedAt },
    });

    return json(200, {
      jobId,
      status: 'ok',
      pr: pr.number,
      steward,
      entry: metrics.normalized,
      metadata: { ...metadata, etchedAt },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await updateMutationFeed({
      ritual: 'release-notes',
      status: 'error',
      job_id: jobId,
      detail: message,
      pr: pr.number,
      repo,
      branch,
      entry_hash: metrics.hash,
      size_bytes: metrics.sizeBytes,
      changelog_path: CHANGELOG_PATH,
      metadata,
    });
    return json(500, {
      jobId,
      status: 'error',
      pr: pr.number,
      message,
      metadata,
    });
  }
};

