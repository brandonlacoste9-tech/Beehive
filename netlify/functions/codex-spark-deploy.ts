import type { Handler } from "@netlify/functions";
import {
  appendCodexDeploy,
  CodexDeployRecord,
  CodexDeployStatus,
  isCodexFailureStatus,
  isCodexPendingStatus,
  isCodexSuccessStatus,
} from "../../src/lib/codex_history";

interface TriggerResult {
  target: string;
  ok: boolean;
  status?: number;
  responseSnippet?: string;
  error?: string;
}

type StringMap = Record<string, string>;

function parseMap(raw: string | undefined | null): StringMap {
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (parsed && typeof parsed === "object") {
      const entries = Object.entries(parsed).filter(
        (entry): entry is [string, string] => typeof entry[1] === "string",
      );
      return Object.fromEntries(entries);
    }
  } catch {
    // ignore fall through to text parsing
  }

  const map: StringMap = {};
  const chunks = raw.split(/[\n,;]+/);
  for (const chunk of chunks) {
    const [key, ...rest] = chunk.split("=");
    if (!key || rest.length === 0) {
      continue;
    }
    const value = rest.join("=").trim();
    if (value) {
      map[key.trim()] = value;
    }
  }
  return map;
}

function pickString(source: Record<string, unknown>, key: string): string | undefined {
  const value = source[key];
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }
  return undefined;
}

function pickNumber(source: Record<string, unknown>, key: string): number | undefined {
  const value = source[key];
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return undefined;
}

function pickBoolean(source: Record<string, unknown>, key: string): boolean | undefined {
  const value = source[key];
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["1", "true", "yes", "y"].includes(normalized)) {
      return true;
    }
    if (["0", "false", "no", "n"].includes(normalized)) {
      return false;
    }
  }
  return undefined;
}

function parseTargets(source: Record<string, unknown>, fallback?: string): string[] {
  const rawTargets = source.targets ?? source.repos ?? source.repo ?? fallback;
  if (Array.isArray(rawTargets)) {
    return rawTargets
      .map((value) => (typeof value === "string" ? value.trim() : ""))
      .filter(Boolean);
  }
  if (typeof rawTargets === "string") {
    return rawTargets
      .split(/[\s,]+/)
      .map((value) => value.trim())
      .filter(Boolean);
  }
  return fallback ? [fallback] : [];
}

async function postWithRetry(
  url: string,
  body: Record<string, unknown> | null,
  tries = 3,
): Promise<{ status: number; snippet: string }> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < tries; attempt++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      if (res.ok) {
        const text = await res.text().catch(() => "");
        return { status: res.status, snippet: text.slice(0, 200) };
      }
      lastErr = `HTTP ${res.status}`;
    } catch (error) {
      lastErr = error;
    }

    const delayMs = 250 * 2 ** attempt;
    await new Promise<void>((resolve) => setTimeout(resolve, delayMs));
  }

  throw new Error(`Build hook failed after ${tries} attempts: ${String(lastErr)}`);
}

function isLocalContext(): boolean {
  const ctx = (process.env.CONTEXT ?? "").toLowerCase();
  if (ctx === "local" || ctx === "dev" || ctx === "development") {
    return true;
  }
  if (process.env.NETLIFY_DEV === "true") {
    return true;
  }
  return false;
}

function collectAllowedTokens(targets: string[], map: StringMap, fallback?: string): string[] {
  const tokens = new Set<string>();
  for (const target of targets) {
    const token = map[target] ?? map["*"];
    if (token) {
      tokens.add(token);
    }
  }
  if (fallback) {
    tokens.add(fallback);
  }
  return [...tokens];
}

function resolveHook(target: string, map: StringMap, fallback?: string): string | undefined {
  return map[target] ?? map["*"] ?? fallback;
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { Allow: "POST" },
      body: "method not allowed",
    };
  }

  const isLocal = isLocalContext();

  let payload: Record<string, unknown> = {};
  if (event.body) {
    try {
      const parsed = JSON.parse(event.body) as unknown;
      if (typeof parsed === "object" && parsed) {
        payload = parsed as Record<string, unknown>;
      }
    } catch {
      // ignore malformed payloads
    }
  }

  const envelope =
    (typeof payload.payload === "object" && payload.payload
      ? (payload.payload as Record<string, unknown>)
      : payload) ?? {};

  const repo =
    pickString(envelope, "repo") ??
    pickString(envelope, "sparkRepo") ??
    pickString(envelope, "project") ??
    undefined;

  const targets = parseTargets(envelope, repo);
  if (targets.length === 0) {
    return { statusCode: 400, body: "missing repo target" };
  }

  const swarmTokens = parseMap(process.env.SPARK_SWARM_TOKENS ?? process.env.SWARM_TOKENS);
  const fallbackSwarmToken = process.env.SPARK_SWARM_TOKEN ?? process.env.SWARM_TOKEN;
  const allowedTokens = collectAllowedTokens(targets, swarmTokens, fallbackSwarmToken);

  const headerToken =
    (event.headers?.["x-swarm-token"] as string | undefined) ??
    (event.headers?.["X-Swarm-Token"] as string | undefined) ??
    (event.headers?.["authorization"] as string | undefined);
  const bearerToken =
    headerToken && headerToken.toLowerCase().startsWith("bearer ")
      ? headerToken.slice(7)
      : headerToken;
  const bodyToken = pickString(envelope, "swarmToken") ?? pickString(payload, "swarmToken");
  const incomingToken = (bodyToken ?? bearerToken ?? "").trim();

  if (!isLocal) {
    if (allowedTokens.length === 0) {
      return { statusCode: 500, body: "missing swarm token configuration" };
    }
    if (!incomingToken || !allowedTokens.includes(incomingToken)) {
      return { statusCode: 401, body: "unauthorized" };
    }
  }

  const jobId =
    pickString(envelope, "jobId") ?? pickString(envelope, "job_id") ?? pickString(payload, "jobId");
  if (!jobId) {
    return { statusCode: 400, body: "missing jobId" };
  }

  const status =
    pickString(envelope, "status") ?? pickString(payload, "status") ?? "unknown";
  const deployPrimeUrl =
    pickString(envelope, "deployPrimeUrl") ??
    pickString(envelope, "deploy_prime_url") ??
    pickString(payload, "deployPrimeUrl") ??
    undefined;
  const artifactSizeBytes =
    pickNumber(envelope, "artifactSizeBytes") ?? pickNumber(envelope, "artifact_size_bytes");

  const triggerFlag = pickBoolean(envelope, "trigger") ?? pickBoolean(payload, "trigger");
  const triggerBuildFlag =
    pickBoolean(envelope, "triggerBuild") ?? pickBoolean(payload, "triggerBuild");

  const buildHooks = parseMap(process.env.SPARK_BUILD_HOOKS ?? process.env.SPARK_BUILD_WEBHOOKS);
  const fallbackBuildHook =
    pickString(envelope, "buildHook") ??
    pickString(payload, "buildHook") ??
    process.env.SPARK_BUILD_HOOK_URL;

  let record: CodexDeployRecord | null = null;
  try {
    record = await appendCodexDeploy({
      jobId,
      status,
      deployPrimeUrl,
      artifactSizeBytes,
      repo: targets[0],
      meta: { targets },
    });
  } catch (error) {
    console.error("failed to append codex history", error);
  }

  const normalizedStatus: CodexDeployStatus | undefined = record?.status;
  const shouldTrigger =
    triggerBuildFlag ??
    triggerFlag ??
    (normalizedStatus
      ? isCodexSuccessStatus(normalizedStatus) || isCodexPendingStatus(normalizedStatus)
      : status.toLowerCase() === "success");

  const triggered: TriggerResult[] = [];
  if (shouldTrigger) {
    for (const target of targets) {
      const hook = resolveHook(target, buildHooks, fallbackBuildHook);
      if (!hook) {
        triggered.push({ target, ok: false, error: "missing build hook" });
        continue;
      }
      try {
        const response = await postWithRetry(hook, {
          source: "codex-spark-deploy",
          jobId,
          repo: target,
          status,
          deployPrimeUrl,
          artifactSizeBytes: artifactSizeBytes ?? null,
        });
        triggered.push({
          target,
          ok: true,
          status: response.status,
          responseSnippet: response.snippet,
        });
      } catch (error) {
        triggered.push({
          target,
          ok: false,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  const failure = normalizedStatus ? isCodexFailureStatus(normalizedStatus) : false;

  return {
    statusCode: failure ? 202 : 200,
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      ok: !failure,
      jobId,
      status: normalizedStatus ?? status,
      deployPrimeUrl: deployPrimeUrl ?? null,
      artifactSizeBytes: artifactSizeBytes ?? null,
      targets,
      triggered,
    }),
  };
};
