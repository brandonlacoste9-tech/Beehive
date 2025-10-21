import { getStore } from "@netlify/blobs";

const STORE_NAME = process.env.CODEX_HISTORY_STORE ?? "beehive_codex";
const HISTORY_KEY = "spark_history";
const STATUS_KEY = "spark_status";
const MAX_HISTORY = 500;

export type CodexDeployStatus =
  | "queued"
  | "building"
  | "success"
  | "failed"
  | "canceled"
  | "unknown";

export interface CodexDeployRecord {
  timestamp: string;
  jobId: string;
  status: CodexDeployStatus;
  deployPrimeUrl?: string | null;
  artifactSizeBytes?: number | null;
  repo?: string | null;
  meta?: Record<string, unknown> | null;
}

export interface CodexDeploySnapshot {
  status: CodexDeployStatus;
  updatedAt: string;
  jobId?: string;
  deployPrimeUrl?: string | null;
  artifactSizeBytes?: number | null;
  repo?: string | null;
}

export interface AppendCodexDeployInput {
  jobId: string;
  status: string;
  deployPrimeUrl?: string | null;
  artifactSizeBytes?: number | null;
  repo?: string | null;
  timestamp?: string;
  meta?: Record<string, unknown> | null;
}

function normalizeStatus(raw: string | null | undefined): CodexDeployStatus {
  const value = (raw ?? "").toLowerCase().trim();
  switch (value) {
    case "queued":
    case "pending":
      return "queued";
    case "building":
    case "running":
    case "in_progress":
      return "building";
    case "success":
    case "succeeded":
    case "ok":
    case "completed":
      return "success";
    case "failed":
    case "error":
    case "failure":
      return "failed";
    case "canceled":
    case "cancelled":
      return "canceled";
    default:
      return "unknown";
  }
}

function coerceNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return null;
}

function sanitizeRecord(input: AppendCodexDeployInput): CodexDeployRecord {
  const timestamp = input.timestamp ?? new Date().toISOString();
  const artifactSizeBytes = coerceNumber(input.artifactSizeBytes);
  return {
    timestamp,
    jobId: String(input.jobId ?? ""),
    status: normalizeStatus(input.status),
    deployPrimeUrl: input.deployPrimeUrl ?? null,
    artifactSizeBytes,
    repo: input.repo ?? null,
    meta: input.meta ?? null,
  };
}

async function readHistory(): Promise<CodexDeployRecord[]> {
  const store = getStore(STORE_NAME);
  const existing = (await store.get(HISTORY_KEY, { type: "json" })) as
    | CodexDeployRecord[]
    | null;
  if (!Array.isArray(existing)) {
    return [];
  }
  return existing.filter((entry) =>
    entry && typeof entry === "object" && typeof entry.timestamp === "string",
  );
}

export async function appendCodexDeploy(
  input: AppendCodexDeployInput,
): Promise<CodexDeployRecord> {
  const record = sanitizeRecord(input);
  const store = getStore(STORE_NAME);
  const history = await readHistory();
  const nextHistory = [...history, record].slice(-MAX_HISTORY);
  await store.set(HISTORY_KEY, nextHistory);

  const snapshot: CodexDeploySnapshot = {
    status: record.status,
    updatedAt: record.timestamp,
    jobId: record.jobId,
    deployPrimeUrl: record.deployPrimeUrl ?? null,
    artifactSizeBytes: record.artifactSizeBytes ?? null,
    repo: record.repo ?? null,
  };
  await store.set(STATUS_KEY, snapshot);

  return record;
}

export async function getCodexHistory(limit = 50): Promise<CodexDeployRecord[]> {
  const history = await readHistory();
  if (limit <= 0) {
    return [];
  }
  const start = Math.max(history.length - limit, 0);
  return history.slice(start);
}

export async function getCodexCurrent(): Promise<CodexDeploySnapshot | null> {
  const store = getStore(STORE_NAME);
  const snapshot = (await store.get(STATUS_KEY, { type: "json" })) as
    | CodexDeploySnapshot
    | null;
  if (!snapshot) {
    return null;
  }
  return {
    status: normalizeStatus(snapshot.status),
    updatedAt: snapshot.updatedAt,
    jobId: snapshot.jobId,
    deployPrimeUrl: snapshot.deployPrimeUrl ?? null,
    artifactSizeBytes: coerceNumber(snapshot.artifactSizeBytes),
    repo: snapshot.repo ?? null,
  };
}

export function isCodexSuccessStatus(status: CodexDeployStatus): boolean {
  return status === "success";
}

export function isCodexFailureStatus(status: CodexDeployStatus): boolean {
  return status === "failed";
}

export function isCodexPendingStatus(status: CodexDeployStatus): boolean {
  return status === "queued" || status === "building";
}
