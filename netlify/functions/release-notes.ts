import type { Handler } from "@netlify/functions";
import { Buffer } from "node:buffer";
import { randomUUID } from "node:crypto";

const json = (statusCode: number, payload: Record<string, unknown>) => ({
  statusCode,
  headers: { "content-type": "application/json; charset=utf-8" },
  body: JSON.stringify(payload),
});

type GitHubLabel = { name?: string | null };
type GitHubUser = { login?: string | null };
type GitHubRef = { ref?: string | null };

type GitHubPullRequest = {
  number?: number;
  title?: string | null;
  body?: string | null;
  merged?: boolean;
  merged_at?: string | null;
  html_url?: string | null;
  labels?: Array<GitHubLabel> | null;
  user?: GitHubUser | null;
  head?: GitHubRef | null;
  base?: GitHubRef | null;
  merge_commit_sha?: string | null;
};

type ReleaseNotesPayload = {
  action?: string;
  pull_request?: GitHubPullRequest;
  repository?: { full_name?: string | null };
  jobId?: string;
  pr?: GitHubPullRequest;
  repo?: string;
};

type EnvConfig = {
  githubToken: string;
  supabaseUrl: string;
  supabaseKey: string;
  changelogPath: string;
};

type NormalizedPullRequest = GitHubPullRequest & {
  number: number;
  title: string;
  html_url: string;
};

type ChangelogResult = {
  updated: boolean;
  commitSha?: string;
  sizeBytes: number;
};

type LedgerRow = {
  id: string;
  status?: string;
  metadata?: Record<string, unknown> | null;
};

type LedgerEnsureResult = {
  row: LedgerRow;
  previousStatus?: string;
  hadComment: boolean;
};

type ReleaseNoteRecord = {
  jobId: string;
  repo: string;
  prNumber: number;
  title: string;
  summary: string;
  labels: string[];
  mergedAt: string | null;
  prUrl: string;
  author: string | null;
  mergeCommitSha: string | null;
  changelogEntry: string;
  changelogCommitSha?: string;
  status: "recorded";
  metadata: Record<string, unknown>;
};

type PayloadOutcome =
  | { kind: "ok"; data: { pr: NormalizedPullRequest; repoFullName: string; jobId: string } }
  | { kind: "error"; status: number; body: Record<string, unknown> };

type EnvOutcome =
  | { ok: true; value: EnvConfig }
  | { ok: false; missing: string[] };

const gatherEnv = (): EnvOutcome => {
  const githubToken = (process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN ?? "").trim();
  const supabaseUrl = (process.env.SUPABASE_URL ?? "").trim();
  const supabaseKey = (
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET ?? ""
  ).trim();
  const changelogPath = (
    process.env.RELEASE_NOTES_CHANGELOG_PATH ?? "CHANGELOG.md"
  ).trim();

  const missing: string[] = [];
  if (!githubToken) missing.push("GITHUB_TOKEN");
  if (!supabaseUrl) missing.push("SUPABASE_URL");
  if (!supabaseKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");

  if (missing.length > 0) {
    return { ok: false, missing };
  }

  return {
    ok: true,
    value: {
      githubToken,
      supabaseUrl,
      supabaseKey,
      changelogPath: changelogPath || "CHANGELOG.md",
    },
  };
};

const parsePayload = (raw: string): PayloadOutcome => {
  let payload: ReleaseNotesPayload;
  try {
    payload = JSON.parse(raw) as ReleaseNotesPayload;
  } catch (error) {
    return {
      kind: "error",
      status: 400,
      body: { error: "Invalid JSON payload", detail: (error as Error).message },
    };
  }

  const jobId =
    typeof payload.jobId === "string" && payload.jobId.trim()
      ? payload.jobId.trim()
      : `release-${randomUUID()}`;

  const pr = (payload.pull_request ?? payload.pr) as NormalizedPullRequest | undefined;
  if (!pr || typeof pr.number !== "number") {
    return { kind: "error", status: 400, body: { error: "Missing pull_request.number", jobId } };
  }

  const repoFullName =
    payload.repository?.full_name ?? payload.repo ?? process.env.GITHUB_REPOSITORY ?? "";
  if (!repoFullName) {
    return {
      kind: "error",
      status: 400,
      body: { error: "Missing repository.full_name", jobId, pr: pr.number },
    };
  }

  if (payload.action && payload.action !== "closed" && payload.action !== "merged") {
    return {
      kind: "error",
      status: 202,
      body: { ok: false, reason: `action ${payload.action} ignored`, jobId, pr: pr.number, repo: repoFullName },
    };
  }

  if (!pr.merged) {
    return {
      kind: "error",
      status: 202,
      body: { ok: false, reason: "Pull request not merged", jobId, pr: pr.number, repo: repoFullName },
    };
  }

  if (!pr.html_url || typeof pr.html_url !== "string" || !pr.title || typeof pr.title !== "string") {
    return {
      kind: "error",
      status: 400,
      body: {
        error: "PR payload missing html_url or title",
        jobId,
        pr: pr.number,
        repo: repoFullName,
      },
    };
  }

  return {
    kind: "ok",
    data: {
      pr: {
        ...pr,
        number: pr.number,
        title: pr.title,
        html_url: pr.html_url,
      },
      repoFullName,
      jobId,
    },
  };
};

const trimAndEllipsize = (value: string, max = 180) => {
  const clean = value.replace(/\s+/g, " ").trim();
  if (!clean) return "";
  return clean.length > max ? `${clean.slice(0, max - 1)}…` : clean;
};

const extractSummary = (body: string | null | undefined) => {
  if (!body) return "";
  const withoutCode = body.replace(/```[\s\S]*?```/g, "");
  const withoutImages = withoutCode.replace(/!\[[^\]]*\]\([^\)]+\)/g, "");
  const withoutLinks = withoutImages.replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1");
  const stripped = withoutLinks
    .replace(/^>+\s?/gm, "")
    .replace(/^#+\s*/gm, "")
    .replace(/[\*_`~]/g, "");
  const paragraphs = stripped
    .split(/\n\s*\n/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);
  if (paragraphs.length === 0) {
    const single = stripped.replace(/\s+/g, " ").trim();
    return trimAndEllipsize(single);
  }
  return trimAndEllipsize(paragraphs[0]);
};

const collectLabels = (labels: Array<GitHubLabel> | null | undefined) =>
  (labels ?? [])
    .map((label) => (label?.name ?? "").trim())
    .filter(Boolean);

const formatEntryLine = (
  pr: Pick<NormalizedPullRequest, "number" | "title" | "html_url">,
  summary: string,
  labels: string[],
  mergedAt: string | null,
  author: string | null,
) => {
  const segments: string[] = [];
  segments.push(`[#${pr.number}](${pr.html_url}) — ${pr.title}`);
  if (author) {
    segments.push(`scribe: @${author}`);
  }
  if (summary) {
    segments.push(summary);
  }
  if (mergedAt) {
    const iso = new Date(mergedAt);
    if (!Number.isNaN(iso.getTime())) {
      segments.push(`merged ${iso.toISOString().slice(0, 10)}`);
    }
  }
  if (labels.length > 0) {
    segments.push(`labels: ${labels.join(", ")}`);
  }
  return segments.join(" · ");
};

const fetchChangelog = async (env: EnvConfig, repoFullName: string) => {
  const url = `https://api.github.com/repos/${repoFullName}/contents/${encodeURIComponent(env.changelogPath)}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${env.githubToken}`,
      Accept: "application/vnd.github+json",
    },
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(`Unable to load changelog: ${res.status} ${message}`);
  }

  const payload = (await res.json()) as {
    content?: string;
    sha?: string;
    encoding?: string;
  };

  if (!payload.content) {
    throw new Error("Changelog content missing");
  }

  const decoded = Buffer.from(
    payload.content,
    payload.encoding === "base64" ? "base64" : "utf8",
  ).toString("utf8");

  return { sha: payload.sha, content: decoded };
};

const applyReleaseEntry = (content: string, entry: string) => {
  const releaseHeading = "### Release Notes";
  const bulletLine = `- ${entry}`;
  const releaseSectionRegex = /(### Release Notes\s*)([\s\S]*?)(?=\n### |\n## |$)/;

  const releaseMatch = releaseSectionRegex.exec(content);
  if (releaseMatch) {
    const prefix = releaseMatch[1];
    const body = releaseMatch[2]?.trimEnd();
    const newBody = body ? `${body}\n${bulletLine}` : bulletLine;
    const replacement = `${prefix}${newBody}\n`;
    return content.replace(releaseMatch[0], `${replacement}\n`);
  }

  const draftHeading = "## [DRAFT]";
  const draftIndex = content.indexOf(draftHeading);
  const insertion = `\n${releaseHeading}\n${bulletLine}\n\n`;
  if (draftIndex === -1) {
    return `${releaseHeading}\n${bulletLine}\n\n${content}`;
  }

  const draftEnd = content.indexOf("\n", draftIndex + draftHeading.length);
  const insertPos = draftEnd === -1 ? content.length : draftEnd + 1;
  const prefix = content.slice(0, insertPos);
  const joiner = prefix.endsWith("\n") ? "" : "\n";
  return `${prefix}${joiner}${insertion}${content.slice(insertPos)}`;
};

const pushChangelog = async (
  env: EnvConfig,
  repoFullName: string,
  sha: string | undefined,
  updatedContent: string,
  prNumber: number,
) => {
  const url = `https://api.github.com/repos/${repoFullName}/contents/${encodeURIComponent(env.changelogPath)}`;
  const putRes = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${env.githubToken}`,
      Accept: "application/vnd.github+json",
    },
    body: JSON.stringify({
      message: `docs: inscribe release notes for #${prNumber}`,
      content: Buffer.from(updatedContent, "utf8").toString("base64"),
      sha,
      committer: {
        name: "Codex Release Scribe",
        email: "codex@beehive.ai",
      },
    }),
  });

  if (!putRes.ok) {
    const message = await putRes.text();
    throw new Error(`Unable to update changelog: ${putRes.status} ${message}`);
  }

  const result = (await putRes.json()) as { commit?: { sha?: string } };
  return result.commit?.sha;
};

const ensureChangelogEntry = async (
  env: EnvConfig,
  repoFullName: string,
  entry: string,
  prNumber: number,
): Promise<ChangelogResult> => {
  const current = await fetchChangelog(env, repoFullName);
  if (current.content.includes(`[#${prNumber}]`)) {
    return {
      updated: false,
      commitSha: undefined,
      sizeBytes: Buffer.byteLength(current.content, "utf8"),
    };
  }

  const updatedContent = applyReleaseEntry(current.content, entry);
  const commitSha = await pushChangelog(env, repoFullName, current.sha, updatedContent, prNumber);
  return {
    updated: true,
    commitSha,
    sizeBytes: Buffer.byteLength(updatedContent, "utf8"),
  };
};

const buildLedgerPayload = (record: ReleaseNoteRecord, metadata: Record<string, unknown>) => ({
  job_id: record.jobId,
  repo: record.repo,
  pr_number: record.prNumber,
  title: record.title,
  summary: record.summary || null,
  labels: record.labels,
  merged_at: record.mergedAt,
  pr_url: record.prUrl,
  author: record.author,
  merge_commit_sha: record.mergeCommitSha,
  changelog_entry: record.changelogEntry,
  changelog_commit_sha: record.changelogCommitSha ?? null,
  status: record.status,
  metadata,
});

const fetchExistingLedgerRow = async (
  env: EnvConfig,
  repo: string,
  prNumber: number,
): Promise<LedgerRow | null> => {
  const params = new URLSearchParams({
    select: "id,status,metadata",
    repo: `eq.${repo}`,
    pr_number: `eq.${prNumber}`,
    limit: "1",
  });
  const response = await fetch(`${env.supabaseUrl}/rest/v1/release_notes?${params.toString()}`, {
    headers: {
      apikey: env.supabaseKey,
      Authorization: `Bearer ${env.supabaseKey}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Supabase lookup failed: ${response.status} ${message}`);
  }

  const data = (await response.json()) as LedgerRow[];
  return data[0] ?? null;
};

const upsertLedgerRow = async (
  env: EnvConfig,
  record: ReleaseNoteRecord,
): Promise<LedgerEnsureResult> => {
  const existing = await fetchExistingLedgerRow(env, record.repo, record.prNumber);
  const previousMetadata = (existing?.metadata ?? {}) as Record<string, unknown>;
  const mergedMetadata = { ...previousMetadata, ...record.metadata };
  const payload = buildLedgerPayload(record, mergedMetadata);

  const endpoint = existing
    ? `${env.supabaseUrl}/rest/v1/release_notes?id=eq.${existing.id}`
    : `${env.supabaseUrl}/rest/v1/release_notes`;

  const method = existing ? "PATCH" : "POST";

  const response = await fetch(endpoint, {
    method,
    headers: {
      "Content-Type": "application/json",
      apikey: env.supabaseKey,
      Authorization: `Bearer ${env.supabaseKey}`,
      Prefer: "return=representation",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Supabase ${existing ? "update" : "insert"} failed: ${response.status} ${message}`);
  }

  const rows = (await response.json()) as LedgerRow[];
  const row = rows[0];
  if (!row?.id) {
    throw new Error("Supabase did not return a record id");
  }

  const hadComment = typeof previousMetadata.commentUrl === "string" && previousMetadata.commentUrl.length > 0;

  return {
    row,
    previousStatus: existing?.status,
    hadComment,
  };
};

const finalizeLedgerRow = async (
  env: EnvConfig,
  id: string,
  status: string,
  metadata: Record<string, unknown>,
) => {
  const response = await fetch(`${env.supabaseUrl}/rest/v1/release_notes?id=eq.${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      apikey: env.supabaseKey,
      Authorization: `Bearer ${env.supabaseKey}`,
      Prefer: "return=minimal",
    },
    body: JSON.stringify({ status, metadata }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Supabase finalize failed: ${response.status} ${message}`);
  }
};

const postReleaseComment = async (
  env: EnvConfig,
  repoFullName: string,
  prNumber: number,
  body: string,
) => {
  const url = `https://api.github.com/repos/${repoFullName}/issues/${prNumber}/comments`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.githubToken}`,
      Accept: "application/vnd.github+json",
    },
    body: JSON.stringify({ body }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Unable to post PR comment: ${response.status} ${message}`);
  }

  const payload = (await response.json()) as { html_url?: string };
  return payload.html_url ?? null;
};

const composeComment = (
  details: {
    repoFullName: string;
    prNumber: number;
    prTitle: string;
    prUrl: string;
    author: string | null;
    summary: string;
    labels: string[];
    mergedAt: string | null;
    jobId: string;
    supabaseId: string;
    status: "sealed" | "recorded";
    changelog: ChangelogResult;
    entryBytes: number;
  },
) => {
  const shortSha = details.changelog.commitSha?.slice(0, 7);
  const changelogLink = shortSha
    ? `[${shortSha}](https://github.com/${details.repoFullName}/commit/${details.changelog.commitSha})`
    : details.changelog.updated
    ? "_pending commit id_"
    : "unchanged";

  const summaryLine = details.summary
    ? `- Summary: ${details.summary}`
    : "- Summary: _No summary offered; the scroll remains terse._";

  const labelLine =
    details.labels.length > 0 ? `- Labels: ${details.labels.join(", ")}` : "- Labels: _None_";

  return [
    "### 🪶 Codex Release Scroll",
    "",
    `The ledger has absorbed [#${details.prNumber}](${details.prUrl}) — _${details.prTitle}_${
      details.author ? ` by @${details.author}` : ""
    }.`,
    `- Changelog: ${changelogLink}`,
    `- Supabase ledger: \`${details.supabaseId}\``,
    summaryLine,
    labelLine,
    "",
    "```json",
    JSON.stringify(
      {
        jobId: details.jobId,
        repo: details.repoFullName,
        pr: details.prNumber,
        status: details.status,
        entryBytes: details.entryBytes,
        changelogBytes: details.changelog.sizeBytes,
      },
      null,
      2,
    ),
    "```",
    "",
    "May this release ripple through the hive.",
  ].join("\n");
};

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  const env = gatherEnv();
  if (!env.ok) {
    return json(500, { error: "Missing environment configuration", missing: env.missing });
  }

  if (!event.body) {
    return json(400, { error: "Missing request body" });
  }

  const payloadOutcome = parsePayload(event.body);
  if (payloadOutcome.kind === "error") {
    return json(payloadOutcome.status, payloadOutcome.body);
  }

  const { pr, repoFullName, jobId } = payloadOutcome.data;

  const summary = extractSummary(pr.body ?? "");
  const labels = collectLabels(pr.labels);
  const author = pr.user?.login ?? null;
  const mergedAt = pr.merged_at ?? null;
  const entry = formatEntryLine(
    { number: pr.number, title: pr.title, html_url: pr.html_url },
    summary,
    labels,
    mergedAt,
    author,
  );
  const entryBytes = Buffer.byteLength(entry, "utf8");

  const envConfig = env.value;

  let ledgerResult: LedgerEnsureResult | null = null;
  let baseMetadata: Record<string, unknown> = {};

  try {
    const changelogResult = await ensureChangelogEntry(envConfig, repoFullName, entry, pr.number);

    baseMetadata = {
      jobId,
      headRef: pr.head?.ref ?? null,
      baseRef: pr.base?.ref ?? null,
      mergeCommitSha: pr.merge_commit_sha ?? null,
      mergedAt,
      entryBytes,
      changelogUpdated: changelogResult.updated,
      changelogCommitSha: changelogResult.commitSha ?? null,
      changelogSizeBytes: changelogResult.sizeBytes,
    };

    ledgerResult = await upsertLedgerRow(envConfig, {
      jobId,
      repo: repoFullName,
      prNumber: pr.number,
      title: pr.title,
      summary,
      labels,
      mergedAt,
      prUrl: pr.html_url,
      author,
      mergeCommitSha: pr.merge_commit_sha ?? null,
      changelogEntry: entry,
      changelogCommitSha: changelogResult.commitSha,
      status: "recorded",
      metadata: baseMetadata,
    });

    const ledgerRow = ledgerResult.row;
    const previousStatus = ledgerResult.previousStatus;
    const alreadySealed =
      previousStatus === "sealed" &&
      ledgerResult.hadComment &&
      typeof ledgerRow.metadata?.commentUrl === "string" &&
      (ledgerRow.metadata.commentUrl as string).length > 0;

    let commentUrl =
      typeof ledgerRow.metadata?.commentUrl === "string"
        ? (ledgerRow.metadata.commentUrl as string)
        : null;

    if (!alreadySealed) {
      const commentBody = composeComment({
        repoFullName,
        prNumber: pr.number,
        prTitle: pr.title,
        prUrl: pr.html_url,
        author,
        summary,
        labels,
        mergedAt,
        jobId,
        supabaseId: ledgerRow.id,
        status: changelogResult.updated ? "sealed" : "recorded",
        changelog: changelogResult,
        entryBytes,
      });
      commentUrl = await postReleaseComment(envConfig, repoFullName, pr.number, commentBody);
    }

    const nextStatus = changelogResult.updated || alreadySealed ? "sealed" : "recorded";
    const finalizeMetadata = {
      ...(ledgerRow.metadata ?? {}),
      ...baseMetadata,
      commentUrl,
      changelogUpdated: changelogResult.updated,
      changelogCommitSha: changelogResult.commitSha ?? null,
      changelogSizeBytes: changelogResult.sizeBytes,
      lastCompletedAt: new Date().toISOString(),
    };

    await finalizeLedgerRow(envConfig, ledgerRow.id, nextStatus, finalizeMetadata);

    return json(200, {
      ok: true,
      jobId,
      status: nextStatus,
      changelog: {
        updated: changelogResult.updated,
        commitSha: changelogResult.commitSha,
        sizeBytes: changelogResult.sizeBytes,
      },
      supabaseId: ledgerRow.id,
      commentUrl,
    });
  } catch (error) {
    if (ledgerResult) {
      const failureMetadata = {
        ...(ledgerResult.row.metadata ?? {}),
        ...baseMetadata,
        error: (error as Error).message,
        lastAttemptAt: new Date().toISOString(),
      };
      try {
        await finalizeLedgerRow(env.value, ledgerResult.row.id, "failed", failureMetadata);
      } catch {
        // Ignore finalize errors during failure reporting
      }
    }

    return json(500, {
      error: (error as Error).message,
      jobId,
    });
  }
};
