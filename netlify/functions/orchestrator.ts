import type { Handler } from "@netlify/functions";
import { logMutation } from "./_logger";
import { invokeRitual } from "./_ritual_invocation_helper";

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

const INTERESTING_ACTIONS = new Set(["opened", "synchronize"]);

function assertEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
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

  const filesResponse = await fetch(`${prApiUrl}/files`, {
    headers: {
      Authorization: `Bearer ${githubToken}`,
      Accept: "application/vnd.github.v3+json",
    },
  });

  if (!filesResponse.ok) {
    const detail = await filesResponse.text().catch(() => filesResponse.statusText);
    throw new Error(`Failed to retrieve PR files: ${filesResponse.status} ${detail}`);
  }

  const filesData = (await filesResponse.json()) as GitHubFile[];

  const prNumber = pullRequest.number as number | undefined;
  const prAuthor = pullRequest.user?.login ?? "Unknown Steward";
  const headSha = pullRequest.head?.sha as string | undefined;
  const actor = `Worker Bee for @${prAuthor}`;

  const context = {
    pr_number: prNumber,
    pr_author: prAuthor,
    head_sha: headSha,
    diffs: filesData.map((file) => ({
      filename: file.filename,
      patch: file.patch ?? "",
      additions: file.additions ?? 0,
      deletions: file.deletions ?? 0,
    })),
    files: filesData.map((file) => file.filename),
  };

  const ritualOutputs: Record<string, unknown> = { current_phase: "initial" };
  let locusResults: SovereigntyCheck | undefined;

  const setPhase = (phase: string) => {
    ritualOutputs.current_phase = phase;
    console.log(`Lifecycle Phase: ${phase}`);
  };

  try {
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
      },
      actor,
    );

    await logMutation({
      actor,
      ritual: "orchestrator",
      status: "success",
      message: `Worker lifecycle completed for PR #${context.pr_number}. Locus PASS.`,
      payload: {
        pr_number: context.pr_number,
        locus: locusResults,
        risk: ritualOutputs.risk,
      },
    });

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
        pr_number: context.pr_number,
        current_phase: ritualOutputs.current_phase,
        locus: locusResults,
      },
    });

    return {
      statusCode: 500,
      body: `Orchestration failed during the ${ritualOutputs.current_phase ?? "initial"} phase: ${message}`,
    };
  }
};
