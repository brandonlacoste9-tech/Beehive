import { Buffer } from "node:buffer";
import { randomUUID } from "crypto";
import type { Handler } from "@netlify/functions";
import { logMutation } from "./_logger";
import { invokeRitual, type RitualInvocationOptions } from "./_ritual_invocation_helper";

type GitHubFile = {
  filename: string;
  patch?: string;
  additions?: number;
  deletions?: number;
};

type SovereigntyCheck = {
  status: string;
  reason?: string;
  [key: string]: unknown;
};

type RiskScore = {
  level?: string;
  [key: string]: unknown;
};

type DiffArtifact = {
  filename: string;
  patch: string;
  additions: number;
  deletions: number;
};

type WorkerContext = {
  pr_number?: number;
  pr_author: string;
  head_sha?: string;
  diffs: DiffArtifact[];
  files: string[];
  job_id: string;
};

type OverlayMetadata = {
  job_id: string;
  pr_number: number | null;
  head_sha: string | null;
  file_count: number;
  additions: number;
  deletions: number;
  patch_bytes: number;
};

const INTERESTING_ACTIONS = new Set(["opened", "synchronize"]);

function assertEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function createFilesEndpoint(prApiUrl: string): URL {
  const sanitized = prApiUrl.endsWith("/") ? prApiUrl : `${prApiUrl}/`;
  return new URL(`${sanitized}files`);
}

async function fetchPullRequestFiles(prApiUrl: string, token: string): Promise<GitHubFile[]> {
  const perPage = 100;
  const collected: GitHubFile[] = [];
  let page = 1;

  const base = createFilesEndpoint(prApiUrl);

  while (true) {
    const url = new URL(base.toString());
    url.searchParams.set("per_page", String(perPage));
    url.searchParams.set("page", String(page));

    const response = await fetch(url, {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => response.statusText);
      throw new Error(`Failed to retrieve PR files (page ${page}): ${response.status} ${detail}`);
    }

    const pageData = (await response.json()) as GitHubFile[];
    collected.push(...pageData);

    if (pageData.length < perPage) {
      break;
    }

    page += 1;
  }

  return collected;
}

function buildWorkerContext(
  files: GitHubFile[],
  prNumber: number | undefined,
  prAuthor: string,
  headSha: string | undefined,
  jobId: string,
): { context: WorkerContext; metadata: OverlayMetadata } {
  const diffs: DiffArtifact[] = files.map((file) => ({
    filename: file.filename,
    patch: file.patch ?? "",
    additions: file.additions ?? 0,
    deletions: file.deletions ?? 0,
  }));

  const totals = diffs.reduce(
    (acc, diff) => {
      acc.additions += diff.additions;
      acc.deletions += diff.deletions;
      return acc;
    },
    { additions: 0, deletions: 0 },
  );

  const patchBytes = files.reduce((acc, file) => acc + Buffer.byteLength(file.patch ?? "", "utf8"), 0);

  const metadata: OverlayMetadata = {
    job_id: jobId,
    pr_number: prNumber ?? null,
    head_sha: headSha ?? null,
    file_count: files.length,
    additions: totals.additions,
    deletions: totals.deletions,
    patch_bytes: patchBytes,
  };

  const context: WorkerContext = {
    pr_number: prNumber,
    pr_author: prAuthor,
    head_sha: headSha,
    diffs,
    files: files.map((file) => file.filename),
    job_id: jobId,
  };

  return { context, metadata };
}

function parseEventBody(body?: string | null): Record<string, unknown> {
  if (!body) return {};
  try {
    const parsed = JSON.parse(body);
    return typeof parsed === "object" && parsed ? (parsed as Record<string, unknown>) : {};
  } catch (error) {
    throw new Error(`Invalid JSON payload received by orchestrator: ${String(error)}`);
  }
}

export const handler: Handler = async (event) => {
  if (event.httpMethod && event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { Allow: "POST" },
      body: "Method not allowed.",
    };
  }

  const payload = parseEventBody(event.body);
  const action = payload.action as string | undefined;
  const pullRequest = payload.pull_request as Record<string, any> | undefined;

  if (!pullRequest || !action || !INTERESTING_ACTIONS.has(action)) {
    return {
      statusCode: 200,
      body: "Ignoring event: Not a PR creation or update.",
    };
  }

  const githubToken = assertEnv("GITHUB_PAT");
  const prApiUrl = typeof pullRequest.url === "string" ? pullRequest.url : undefined;
  if (!prApiUrl) {
    return {
      statusCode: 400,
      body: "Pull request payload missing API URL.",
    };
  }

  const prNumber = pullRequest.number as number | undefined;
  const prAuthor = pullRequest.user?.login ?? "Unknown Steward";
  const headSha = pullRequest.head?.sha as string | undefined;
  const actor = `Worker Bee for @${prAuthor}`;
  const jobId = randomUUID();

  const ritualOutputs: Record<string, unknown> = { current_phase: "initial", job_id: jobId };
  let locusResults: SovereigntyCheck | undefined;
  let context: WorkerContext | undefined;
  let overlayMetadata: OverlayMetadata = {
    job_id: jobId,
    pr_number: prNumber ?? null,
    head_sha: headSha ?? null,
    file_count: 0,
    additions: 0,
    deletions: 0,
    patch_bytes: 0,
  };

  const beaconToken = process.env.BEACON_TOKEN;
  const pingOptions: RitualInvocationOptions | undefined = beaconToken
    ? { headers: { "x-beehive-token": beaconToken } }
    : undefined;

  const setPhase = (phase: string) => {
    ritualOutputs.current_phase = phase;
    console.log(`Lifecycle Phase: ${phase}`);
  };

  const pingRitual = async (status: "ok" | "fail") => {
    try {
      await invokeRitual(
        "ritual-ping",
        { actor, status, job_id: jobId, metadata: overlayMetadata },
        actor,
        pingOptions,
      );
    } catch (pingError) {
      console.warn("ritual-ping-failed", pingError);
    }
  };

  try {
    const filesData = await fetchPullRequestFiles(prApiUrl, githubToken);
    const built = buildWorkerContext(filesData, prNumber, prAuthor, headSha, jobId);
    context = built.context;
    overlayMetadata = built.metadata;
    ritualOutputs.metadata = overlayMetadata;

    if (!context) {
      throw new Error("Unable to compose worker context from PR payload.");
    }

    // --- Housekeeping & Nursing ---
    setPhase("Housekeeping & Nursing initiated.");

    // --- Building Phase: Forging Sovereignty (ᚡ Locus ᚡ) ---
    setPhase("Building initiated: Forging Sovereignty.");
    const todosResult = await invokeRitual<{ todos?: unknown }>(
      "predict-todos",
      { diffs: context.diffs },
      actor,
    );
    ritualOutputs.todos =
      typeof todosResult === "object" && todosResult ? (todosResult as any).todos ?? todosResult : todosResult;

    await invokeRitual(
      "label-pr",
      { pr_number: context.pr_number, files: context.files },
      actor,
    );

    setPhase("Building: forge-edge (Model Liberation).");
    await invokeRitual("forge-edge", context, actor);

    setPhase("Building: sovereignty-check (Law of Coherence Test).");
    locusResults = await invokeRitual<SovereigntyCheck>("sovereignty-check", context, actor);
    ritualOutputs.locus = locusResults;

    if (locusResults && typeof locusResults.status === "string") {
      const status = locusResults.status.toUpperCase();
      if (status === "FAIL") {
        throw new Error(
          `Deployment failed the Sovereignty Test. Reason: ${locusResults.reason ?? "Unknown cause"}`,
        );
      }
    }

    // --- Guarding Phase: Enforcing the Covenant ---
    setPhase("Guarding initiated.");
    const riskResult = await invokeRitual<RiskScore>(
      "risk-score",
      { diffs: context.diffs },
      actor,
    );
    ritualOutputs.risk = riskResult;

    await invokeRitual(
      "reviewer-summoner",
      { pr_number: context.pr_number, files: context.files },
      actor,
    );

    const riskLevel = riskResult?.level?.toLowerCase();
    if (riskLevel === "high") {
      await invokeRitual(
        "pr-gate",
        { pr_number: context.pr_number, risk_level: riskResult.level, head_sha: context.head_sha },
        actor,
      );
    }

    // --- Preservation Ritual (ᚡ Foedus ᚡ) ---
    setPhase("Preservation initiated.");
    await invokeRitual(
      "mutation-map",
      {
        pr_number: context.pr_number,
        head_sha: context.head_sha,
        changed_files: context.files,
        pr_author: context.pr_author,
        ritual_outputs: ritualOutputs,
        job_id: jobId,
        metrics: overlayMetadata,
      },
      actor,
    );

    await logMutation({
      actor,
      ritual: "orchestrator",
      status: "success",
      message: `Worker lifecycle completed for PR #${context.pr_number}. Locus PASS. Job ${jobId}.`,
      payload: {
        pr_number: context.pr_number,
        locus: locusResults,
        risk: ritualOutputs.risk,
      },
      metadata: overlayMetadata,
    });

    await pingRitual("ok");

    console.log("Mutation loop complete. Broadcasting to hive mirrors.");
    return { statusCode: 200, body: "Hive mutation loop completed successfully." };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("The Hive mutation loop failed:", error);

    await logMutation({
      actor,
      ritual: "orchestrator",
      status: "failure",
      message,
      payload: {
        pr_number: context?.pr_number,
        current_phase: ritualOutputs.current_phase,
        locus: locusResults,
      },
      metadata: overlayMetadata,
    });

    await pingRitual("fail");

    return {
      statusCode: 500,
      body: `Orchestration failed during the ${ritualOutputs.current_phase ?? "initial"} phase: ${message}`,
    };
  }
};
