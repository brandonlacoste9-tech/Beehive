import type { Handler } from '@netlify/functions';

const GITHUB_API = 'https://api.github.com';
const COMMENT_MARKER = 'codex:release-note';
const DEFAULT_CHANGELOG_PATH = 'CHANGELOG.md';
const DEFAULT_COMMITTER = { name: 'Codex Automaton', email: 'codex@beehive.local' };

type HeadersInput = ConstructorParameters<typeof Headers>[0];

function mergeHeaders(base: Record<string, string>, extra?: HeadersInput): Record<string, string> {
  if (!extra) return base;

  const merged: Record<string, string> = { ...base };
  const headers = new Headers(extra);
  headers.forEach((value, key) => {
    merged[key] = value;
  });
  return merged;
}

interface ReleaseNotesPayload {
  repository?: string;
  repo?: string;
  owner?: string;
  pr?: number | string;
  prNumber?: number | string;
  changelogPath?: string;
  targetBranch?: string;
  summaryOverride?: string;
  dryRun?: boolean;
}

interface GitHubLabel {
  name?: string;
}

interface GitHubUser {
  login?: string;
}

interface GitHubPullRequest {
  number: number;
  title: string;
  body?: string | null;
  html_url: string;
  merged_at?: string | null;
  user?: GitHubUser | null;
  labels?: GitHubLabel[] | null;
  base?: { ref?: string | null } | null;
}

interface GitHubRepo {
  default_branch?: string;
}

interface GitHubContentFile {
  content?: string;
  encoding?: string;
  sha?: string;
}

function json(statusCode: number, payload: Record<string, unknown>) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload, null, 2),
  };
}

function ensureGitHubToken(): string {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (!token) {
    throw new Error('Missing GITHUB_TOKEN environment variable.');
  }
  return token;
}

function repoParts(payload: ReleaseNotesPayload): { owner: string; repo: string } {
  const repoInput = payload.repository || payload.repo;
  if (!repoInput) {
    throw new Error('Missing `repository`/`repo` in payload. Expected `owner/name`.');
  }

  const [rawOwner, rawRepo] = repoInput.split('/');
  const owner = payload.owner || rawOwner;
  const repo = rawRepo || repoInput;

  if (!owner || !repo) {
    throw new Error(`Invalid repository identifier: ${repoInput}`);
  }

  return { owner, repo };
}

function parsePrNumber(payload: ReleaseNotesPayload): number {
  const value = payload.prNumber ?? payload.pr;
  const num = typeof value === 'string' ? Number.parseInt(value, 10) : Number(value);
  if (!Number.isFinite(num) || num <= 0) {
    throw new Error('Missing or invalid pull request number.');
  }
  return num;
}

async function githubRequest<T>(
  token: string,
  url: string,
  init: RequestInit = {},
  options: { allow404?: boolean } = {}
): Promise<{ status: number; data: T }> {
  const baseHeaders: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'beehive-release-notes/1.0',
    Authorization: `Bearer ${token}`,
  };

  const headers = mergeHeaders(baseHeaders, init.headers as HeadersInput | undefined);
  const response = await fetch(url, { ...init, headers });
  const text = await response.text();
  let data: T;
  try {
    data = text ? (JSON.parse(text) as T) : ({} as T);
  } catch (error) {
    throw new Error(`GitHub response was not valid JSON for ${url}: ${String(error)}`);
  }

  if (!response.ok && !(options.allow404 && response.status === 404)) {
    const message = (data as any)?.message || text || 'Unknown GitHub error';
    throw new Error(`GitHub request failed (${response.status}): ${message}`);
  }

  return { status: response.status, data };
}

function extractSummary(body?: string | null): string | null {
  if (!body) return null;

  const lines = body.split(/\r?\n/).map((line) => line.trim());
  for (const line of lines) {
    if (!line) continue;
    if (/^#{1,6}\s+/.test(line)) continue; // skip headings
    if (/^>/.test(line)) continue; // skip quotes
    if (/^\*\*/.test(line) && line.endsWith('**')) continue; // skip bold titles
    const bulletMatch = line.match(/^(?:[-*+]\s+)(.+)/);
    if (bulletMatch) {
      return bulletMatch[1].trim();
    }
    return line;
  }
  return null;
}

function truncate(text: string, max = 400): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trim()}…`;
}

function buildEntry(
  pr: GitHubPullRequest,
  summary: string
): { entry: string; marker: string; labels: string[]; summaryIncluded: boolean; normalizedSummary: string | null } {
  const marker = `<!-- ${COMMENT_MARKER} pr:${pr.number} -->`;
  const mergedAt = pr.merged_at ? new Date(pr.merged_at).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);
  const author = pr.user?.login ? `@${pr.user.login}` : 'unknown';
  const labels = (pr.labels || [])
    .map((label) => (label?.name || '').trim())
    .filter(Boolean);
  const labelsText = labels.length ? labels.join(', ') : 'none';
  const title = pr.title.trim();
  const normalizedSummary = summary ? summary.trim() : '';
  const includeSummary = Boolean(normalizedSummary) && normalizedSummary.toLowerCase() !== title.toLowerCase();

  const bodyLines = [
    marker,
    `### #${pr.number} — ${title}`,
    `- **Merged:** ${mergedAt}`,
    `- **Author:** ${author}`,
    `- **Labels:** ${labelsText}`,
    includeSummary ? `- **Summary:** ${truncate(normalizedSummary)}` : null,
    `- **Link:** ${pr.html_url}`,
  ].filter(Boolean) as string[];

  return {
    entry: bodyLines.join('\n'),
    marker,
    labels,
    summaryIncluded: includeSummary,
    normalizedSummary: includeSummary ? normalizedSummary : null,
  };
}

function insertEntry(currentContent: string, entry: string, marker: string): { content: string; inserted: boolean } {
  if (!currentContent) {
    return { content: `${entry}\n`, inserted: true };
  }

  if (currentContent.includes(marker)) {
    return { content: currentContent, inserted: false };
  }

  const lines = currentContent.split(/\r?\n/);
  const draftIndex = lines.findIndex((line) => /^##\s*\[DRAFT]/i.test(line));

  if (draftIndex === -1) {
    const combined = `${entry}\n\n${currentContent}`.replace(/\n{3,}/g, '\n\n');
    return { content: combined.endsWith('\n') ? combined : `${combined}\n`, inserted: true };
  }

  let insertIndex = lines.length;
  for (let i = draftIndex + 1; i < lines.length; i++) {
    if (/^###\s+/.test(lines[i])) {
      insertIndex = i;
      break;
    }
  }

  const before = lines.slice(0, insertIndex).join('\n').replace(/\n{3,}/g, '\n\n').replace(/\n+$/, '');
  const after = lines.slice(insertIndex).join('\n').replace(/^\n+/, '');

  let combined = before ? `${before}\n\n${entry}` : entry;
  if (after) {
    combined = `${combined}\n\n${after}`;
  }

  combined = combined.replace(/\n{3,}/g, '\n\n');
  if (!combined.endsWith('\n')) combined += '\n';

  return { content: combined, inserted: true };
}

async function loadSupabaseClient() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }
  try {
    const mod = await import('../../src/lib/supabaseAdmin');
    return mod.supabaseAdmin;
  } catch (error) {
    console.error('Failed to load Supabase admin client:', error);
    return null;
  }
}

async function logReleaseNote(
  supabase: any,
  repo: string,
  pr: GitHubPullRequest,
  entry: string,
  summary: string | null,
  labels: string[]
) {
  if (!supabase) {
    return { ok: false, skipped: true, reason: 'no-supabase-client' };
  }

  try {
    const { error } = await supabase.from('release_notes').insert({
      repo,
      pr_number: pr.number,
      merged_at: pr.merged_at,
      entry,
      summary,
      labels,
      url: pr.html_url,
    });

    if (error) {
      return { ok: false, skipped: false, error: error.message };
    }
    return { ok: true, skipped: false };
  } catch (error: any) {
    return { ok: false, skipped: false, error: error?.message || String(error) };
  }
}

async function ensureComment(
  token: string,
  owner: string,
  repo: string,
  prNumber: number,
  body: string,
  marker: string,
  dryRun: boolean
) {
  const commentsUrl = `${GITHUB_API}/repos/${owner}/${repo}/issues/${prNumber}/comments?per_page=100`;
  const { data: comments } = await githubRequest<Array<{ id: number; body?: string }>>(token, commentsUrl);
  const existing = comments.find((comment) => typeof comment.body === 'string' && comment.body.includes(marker));

  if (dryRun) {
    return existing ? 'skipped' : 'would-create';
  }

  if (existing) {
    if (existing.body === body) {
      return 'unchanged';
    }
    await githubRequest(token, `${GITHUB_API}/repos/${owner}/${repo}/issues/comments/${existing.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ body }),
    });
    return 'updated';
  }

  await githubRequest(token, `${GITHUB_API}/repos/${owner}/${repo}/issues/${prNumber}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ body }),
  });
  return 'created';
}

function buildComment(entry: string, changelogPath: string, prNumber: number): string {
  return [
    `<!-- ${COMMENT_MARKER} comment pr:${prNumber} -->`,
    '## 🐝 Codex Release Note',
    '',
    entry,
    '',
    `Logged to \`${changelogPath}\` by Codex.`,
  ].join('\n');
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return json(405, { ok: false, error: 'Method not allowed', allow: 'POST' });
  }

  let payload: ReleaseNotesPayload;
  try {
    payload = event.body ? (JSON.parse(event.body) as ReleaseNotesPayload) : ({} as ReleaseNotesPayload);
  } catch (error) {
    return json(400, { ok: false, error: 'Invalid JSON body', details: String(error) });
  }

  try {
    const token = ensureGitHubToken();
    const { owner, repo } = repoParts(payload);
    const prNumber = parsePrNumber(payload);
    const dryRun = Boolean(payload.dryRun);
    const changelogPath = payload.changelogPath || DEFAULT_CHANGELOG_PATH;

    const prUrl = `${GITHUB_API}/repos/${owner}/${repo}/pulls/${prNumber}`;
    const { data: pr } = await githubRequest<GitHubPullRequest>(token, prUrl);

    if (!pr.merged_at) {
      return json(409, { ok: false, error: 'Pull request is not merged', pr: prNumber });
    }

    const summaryOverride = payload.summaryOverride?.trim();
    const extractedSummary = extractSummary(pr.body);
    const summaryCandidate = summaryOverride || extractedSummary || '';
    const fallbackSummary = summaryCandidate || pr.title.trim();
    const { entry, marker, labels, summaryIncluded, normalizedSummary } = buildEntry(pr, fallbackSummary);

    const branch = payload.targetBranch || pr.base?.ref;
    let targetBranch = branch;

    if (!targetBranch) {
      const repoUrl = `${GITHUB_API}/repos/${owner}/${repo}`;
      const { data: repoData } = await githubRequest<GitHubRepo>(token, repoUrl);
      targetBranch = repoData.default_branch || 'main';
    }

    const safeTargetBranch = targetBranch || 'main';
    const changelogUrl = `${GITHUB_API}/repos/${owner}/${repo}/contents/${encodeURIComponent(
      changelogPath
    )}?ref=${encodeURIComponent(safeTargetBranch)}`;

    const changelogResp = await githubRequest<GitHubContentFile>(token, changelogUrl, {}, { allow404: true });
    const hasChangelog =
      changelogResp.status !== 404 && typeof changelogResp.data?.content === 'string';

    const currentContent = hasChangelog
      ? Buffer.from(String(changelogResp.data.content), changelogResp.data.encoding === 'base64' ? 'base64' : 'utf8').toString('utf8')
      : '';

    const { content: updatedContent, inserted } = insertEntry(currentContent, entry, marker);
    let changelogUpdate: 'created' | 'updated' | 'skipped' | 'dry-run' = 'skipped';

    if (!inserted) {
      changelogUpdate = 'skipped';
    } else if (dryRun) {
      changelogUpdate = 'dry-run';
    } else {
      const putBody = {
        message: `docs: record #${pr.number} in changelog`,
        content: Buffer.from(updatedContent, 'utf8').toString('base64'),
        committer: DEFAULT_COMMITTER,
        branch: safeTargetBranch,
        sha: hasChangelog ? changelogResp.data.sha : undefined,
      };

      await githubRequest(token, `${GITHUB_API}/repos/${owner}/${repo}/contents/${encodeURIComponent(changelogPath)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(putBody),
      });
      changelogUpdate = hasChangelog ? 'updated' : 'created';
    }

    const commentBody = buildComment(entry, changelogPath, pr.number);
    const commentStatus = await ensureComment(token, owner, repo, pr.number, commentBody, COMMENT_MARKER, dryRun);

    const supabase = dryRun ? null : await loadSupabaseClient();
    const supabaseStatus = dryRun
      ? { ok: false, skipped: true, reason: 'dry-run' }
      : await logReleaseNote(
          supabase,
          `${owner}/${repo}`,
          pr,
          entry,
          summaryIncluded ? normalizedSummary : summaryCandidate || null,
          labels
        );

    return json(200, {
      ok: true,
      dryRun,
      repository: `${owner}/${repo}`,
      pr: pr.number,
      changelog: changelogUpdate,
      comment: commentStatus,
      supabase: supabaseStatus,
    });
  } catch (error: any) {
    return json(500, { ok: false, error: error?.message || String(error) });
  }
};
