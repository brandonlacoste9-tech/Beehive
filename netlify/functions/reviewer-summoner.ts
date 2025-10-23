import type { Handler } from '@netlify/functions';
import { logMutation } from './_logger';

type MutationStatus = 'success' | 'failure';

const CONFIG = {
  capabilityKey: process.env.CODEX_CAPABILITY_KEY,
  githubToken: process.env.GITHUB_PAT,
  defaultRepo: process.env.GITHUB_REPO,
};

const USER_AGENT = 'beehive-reviewer-summoner';

const EXPERTISE_MAP = {
  infra: ['brandon-leroux'],
  dependencies: ['brandon-leroux'],
  routing: ['steward-frontend'],
  auth: ['steward-security', 'brandon-leroux'],
  scripts: ['steward-ops'],
  database: ['steward-data'],
} as const;

type ExpertiseKey = keyof typeof EXPERTISE_MAP;

const EXPERTISE_PATTERNS: Record<ExpertiseKey, RegExp> = {
  infra: /netlify\.toml|Dockerfile|\.github\/workflows/,
  dependencies: /package\.json|lock\.json|pnpm-lock\.yaml/,
  routing: /src\/routes|router/,
  auth: /auth|login|session|token/,
  scripts: /^scripts\//,
  database: /supabase|schema|database/,
};

const FALLBACK_REVIEWERS = ['brandon-leroux', 'steward-core'];

type SummonReport = {
  reviewers: string[];
  matched: Record<ExpertiseKey, string[]>;
  unmatched: string[];
};

type RateLimitSnapshot = {
  limit?: number;
  remaining?: number;
  reset?: number;
};

type GitHubPullRequestFile = {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  changes: number;
};

type GitHubPullRequestEvent = {
  action?: string;
  pull_request?: {
    number?: number;
    draft?: boolean;
  };
  repository?: {
    full_name?: string;
  };
};

class GitHubError extends Error {
  readonly status: number;
  readonly details: string;

  constructor(status: number, message: string, details: string) {
    super(message);
    this.name = 'GitHubError';
    this.status = status;
    this.details = details;
  }
}

const GITHUB_HEADERS = (token: string) => ({
  Authorization: `Bearer ${token}`,
  Accept: 'application/vnd.github+json',
  'User-Agent': USER_AGENT,
});

function toNumber(value: unknown): number | null {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function parseRateLimit(headers: Headers): RateLimitSnapshot | undefined {
  const limit = headers.get('x-ratelimit-limit');
  const remaining = headers.get('x-ratelimit-remaining');
  const reset = headers.get('x-ratelimit-reset');

  if (!limit && !remaining && !reset) {
    return undefined;
  }

  const toInt = (value: string | null) => {
    if (!value) return undefined;
    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? undefined : parsed;
  };

  return {
    limit: toInt(limit),
    remaining: toInt(remaining),
    reset: toInt(reset),
  };
}

function hasNextPage(headers: Headers): boolean {
  const link = headers.get('link');
  return Boolean(link && /rel="next"/.test(link));
}

function summonReviewers(files: string[]): SummonReport {
  const reviewers = new Set<string>();
  const matched: Record<ExpertiseKey, Set<string>> = {
    infra: new Set(),
    dependencies: new Set(),
    routing: new Set(),
    auth: new Set(),
    scripts: new Set(),
    database: new Set(),
  };
  const unmatched: string[] = [];

  for (const file of files) {
    let wasMatched = false;

    for (const key of Object.keys(EXPERTISE_PATTERNS) as ExpertiseKey[]) {
      if (EXPERTISE_PATTERNS[key].test(file)) {
        wasMatched = true;
        matched[key].add(file);
        for (const steward of EXPERTISE_MAP[key]) {
          reviewers.add(steward);
        }
      }
    }

    if (!wasMatched) {
      unmatched.push(file);
    }
  }

  if (reviewers.size === 0) {
    for (const steward of FALLBACK_REVIEWERS) {
      reviewers.add(steward);
    }
  }

  return {
    reviewers: Array.from(reviewers),
    matched: Object.fromEntries(
      Object.entries(matched).map(([key, value]) => [key, Array.from(value).sort()]),
    ) as Record<ExpertiseKey, string[]>,
    unmatched,
  };
}

async function fetchChangedFiles(
  repo: string,
  prNumber: number,
  token: string,
): Promise<{ files: GitHubPullRequestFile[]; rateLimit?: RateLimitSnapshot }> {
  const files: GitHubPullRequestFile[] = [];
  const perPage = 100;
  let page = 1;
  let latestHeaders: Headers | null = null;

  while (true) {
    const url = new URL(`https://api.github.com/repos/${repo}/pulls/${prNumber}/files`);
    url.searchParams.set('per_page', String(perPage));
    url.searchParams.set('page', String(page));

    const res = await fetch(url, {
      headers: GITHUB_HEADERS(token),
    });

    latestHeaders = res.headers;

    if (!res.ok) {
      const details = await res.text().catch(() => res.statusText);
      throw new GitHubError(res.status, `GitHub responded with ${res.status}`, details);
    }

    const batch = (await res.json()) as GitHubPullRequestFile[];
    files.push(...batch);

    if (!hasNextPage(res.headers) || batch.length === 0) {
      break;
    }

    page += 1;
  }

  return { files, rateLimit: latestHeaders ? parseRateLimit(latestHeaders) : undefined };
}

function ensureConfig():
  | { ok: true; capabilityKey: string; githubToken: string; defaultRepo: string }
  | { ok: false; missing: string[] } {
  const missing: string[] = [];

  if (!CONFIG.capabilityKey) missing.push('CODEX_CAPABILITY_KEY');
  if (!CONFIG.githubToken) missing.push('GITHUB_PAT');
  if (!CONFIG.defaultRepo) missing.push('GITHUB_REPO');

  if (missing.length > 0) {
    return { ok: false, missing };
  }

  return {
    ok: true,
    capabilityKey: CONFIG.capabilityKey as string,
    githubToken: CONFIG.githubToken as string,
    defaultRepo: CONFIG.defaultRepo as string,
  };
}

function safeJsonParse(body: string | null): GitHubPullRequestEvent | null {
  if (!body) return null;

  try {
    return JSON.parse(body) as GitHubPullRequestEvent;
  } catch {
    return null;
  }
}

async function recordOutcome(
  actor: string,
  status: MutationStatus,
  message: string,
  payload: Record<string, unknown>,
  response?: Record<string, unknown>,
) {
  await logMutation({
    actor,
    ritual: 'reviewer-summoner',
    status,
    message,
    payload,
    response,
  });
}

export const handler: Handler = async (event) => {
  const actor = event.headers['x-codex-actor'] ?? 'GitHub Webhook';
  const jobId = event.headers['x-codex-job-id'] ?? event.headers['x-nf-request-id'] ?? null;

  const configResult = ensureConfig();
  if (!configResult.ok) {
    const message = `Reviewer summoner misconfigured: missing ${configResult.missing.join(', ')}`;
    await recordOutcome(actor, 'failure', message, {
      jobId,
      missing: configResult.missing,
    });

    return {
      statusCode: 500,
      body: 'Reviewer summoner misconfigured.',
    };
  }

  const { capabilityKey, githubToken, defaultRepo } = configResult;

  if (event.headers['x-codex-capability'] !== capabilityKey) {
    await recordOutcome(actor, 'failure', 'Rejected invocation with invalid capability key.', {
      jobId,
      reason: 'capability-mismatch',
    });

    return { statusCode: 401, body: 'Unauthorized' };
  }

  const payload = safeJsonParse(event.body ?? null);
  if (!payload) {
    const message = 'Invalid JSON payload received by reviewer-summoner.';
    await recordOutcome(actor, 'failure', message, { jobId, body: event.body });
    return { statusCode: 400, body: 'Invalid JSON body.' };
  }

  const { action, pull_request: pullRequest, repository } = payload;

  if (action !== 'opened' || !pullRequest) {
    return { statusCode: 200, body: 'Ignoring event: not an opened PR.' };
  }

  if (pullRequest.draft) {
    await recordOutcome(actor, 'success', 'Skipped reviewer summon for draft pull request.', {
      jobId,
      prNumber: pullRequest.number,
      reason: 'draft',
    });

    return {
      statusCode: 202,
      body: JSON.stringify({ reviewers: [], reason: 'draft' }),
      headers: { 'content-type': 'application/json; charset=utf-8' },
    };
  }

  const prNumber = toNumber(pullRequest.number);
  if (prNumber === null) {
    await recordOutcome(actor, 'failure', 'Pull request number missing from payload.', {
      jobId,
      pullRequest,
    });

    return { statusCode: 400, body: 'Missing pull request number.' };
  }

  const repoFullName = repository?.full_name ?? defaultRepo;

  let files: GitHubPullRequestFile[] = [];
  let rateLimitFromFiles: RateLimitSnapshot | undefined;

  try {
    const result = await fetchChangedFiles(repoFullName, prNumber, githubToken);
    files = result.files;
    rateLimitFromFiles = result.rateLimit;
  } catch (error) {
    const details =
      error instanceof GitHubError ? error.details : (error as Error).message ?? 'unknown error';
    const statusCode = error instanceof GitHubError ? error.status : 502;

    await recordOutcome(actor, 'failure', `Failed to fetch PR files for #${prNumber}: ${details}`, {
      jobId,
      repo: repoFullName,
      prNumber,
      rateLimit: { files: rateLimitFromFiles },
      failure: details,
    }, { status: statusCode });

    return { statusCode, body: 'Unable to inspect PR files.' };
  }

  const filenames = files.map((file) => file.filename);
  const { reviewers, matched, unmatched } = summonReviewers(filenames);

  if (reviewers.length === 0) {
    await recordOutcome(actor, 'failure', `No reviewers available for PR #${prNumber}.`, {
      jobId,
      repo: repoFullName,
      prNumber,
      files: filenames,
      matched,
      unmatched,
    });

    return {
      statusCode: 422,
      body: JSON.stringify({ reviewers: [], reason: 'no-reviewers' }),
      headers: { 'content-type': 'application/json; charset=utf-8' },
    };
  }

  const totals = files.reduce(
    (acc, file) => {
      acc.additions += file.additions;
      acc.deletions += file.deletions;
      acc.changes += file.changes;
      return acc;
    },
    { additions: 0, deletions: 0, changes: 0 },
  );

  const assignResponse = await fetch(
    `https://api.github.com/repos/${repoFullName}/pulls/${prNumber}/requested_reviewers`,
    {
      method: 'POST',
      headers: {
        ...GITHUB_HEADERS(githubToken),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reviewers }),
    },
  );

  const status: MutationStatus = assignResponse.ok ? 'success' : 'failure';
  const statusMessage = assignResponse.ok
    ? `Summoned reviewers for PR #${prNumber}: ${reviewers.join(', ')}`
    : `Failed to summon reviewers for PR #${prNumber}`;

  const responseBody = assignResponse.ok
    ? undefined
    : await assignResponse.text().catch(() => assignResponse.statusText);

  const rateLimitFromAssign = parseRateLimit(assignResponse.headers);

  await recordOutcome(actor, status, statusMessage, {
    jobId,
    repo: repoFullName,
    prNumber,
    reviewers,
    files: filenames,
    filesCount: filenames.length,
    matched,
    unmatched,
    totals,
    rateLimit: {
      files: rateLimitFromFiles,
      request: rateLimitFromAssign,
    },
    failure: assignResponse.ok ? undefined : responseBody,
  }, {
    status: assignResponse.status,
  });

  return {
    statusCode: assignResponse.status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      reviewers,
      matched,
      unmatched,
      filesCount: filenames.length,
      totals,
    }),
  };
};
