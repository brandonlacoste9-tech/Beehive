/**
 * @file codex_spark_mutation.ts
 * @description Server utilities for orchestrating Codex Spark mutation runs through the Netlify GPT-5
 * gateway. These helpers wrap the gateway invocation, persist queue state to Supabase, and expose
 * patch sets that can be replayed inside CodexReplay overlays. Each mutation is stored as a Supabase
 * record keyed by `job_id`, with `status`, `size_bytes`, and the gateway payload for forensic review.
 *
 * ## Usage
 * ```ts
 * import { queueSparkMutation, applySparkMutations } from '@/lib/codex/codex_spark_mutation';
 *
 * const job = await queueSparkMutation({
 *   prompt: 'Tighten the onboarding microcopy.',
 *   contextPacks: [
 *     { filePath: 'pages/landing.tsx', content: landingSource },
 *   ],
 *   metadata: { ritual: 'spark-scroll' },
 * });
 *
 * const replay = await applySparkMutations(job.jobId, { 'pages/landing.tsx': landingSource });
 * console.log(replay.job.status, replay.job.sizeBytes, Object.keys(replay.files));
 * ```
 *
 * The Supabase schema expects a `codex_spark_mutations` table with columns:
 * - `job_id` (uuid / primary key)
 * - `status` (text)
 * - `size_bytes` (int)
 * - `retries` (int)
 * - `request_payload` (jsonb)
 * - `response_payload` (jsonb)
 * - `metadata` (jsonb)
 * - `message` (text)
 * - `created_at` / `updated_at` / `applied_at` (timestamps)
 */

'use server';

import { randomUUID } from 'node:crypto';

import { assertServerEnv } from '../envGuard';
import { supabaseAdmin } from '../supabaseAdmin';

const DEFAULT_GATEWAY_URL =
  process.env.NETLIFY_GPT5_GATEWAY_URL ?? 'https://gateway.netlify.app/.netlify/functions/gpt5';
const GATEWAY_TOKEN = process.env.NETLIFY_GPT5_GATEWAY_TOKEN;

export type SparkMutationStatus = 'queued' | 'running' | 'succeeded' | 'failed' | 'applied';

export interface AcePoint {
  row: number;
  column: number;
}

export interface AceRange {
  start: AcePoint;
  end: AcePoint;
}

export interface AceContextPack {
  filePath: string;
  content: string;
  selection?: AceRange;
  language?: string;
}

export interface AcePatch {
  /** ACE range where the patch should be applied */
  range: AceRange;
  /** Replacement text */
  text: string;
}

export interface AcePatchSet {
  filePath: string;
  patches: AcePatch[];
}

export interface SparkMutationRequest {
  prompt: string;
  contextPacks: AceContextPack[];
  metadata?: Record<string, unknown>;
  model?: string;
}

export interface SparkMutationJob {
  jobId: string;
  status: SparkMutationStatus;
  sizeBytes: number;
  retries: number;
  patchSets: AcePatchSet[];
  message?: string;
}

export interface QueueSparkMutationOptions {
  retries?: number;
  backoffMs?: number;
  signal?: AbortSignal;
  gatewayUrl?: string;
}

export interface ApplySparkMutationsOptions {
  signal?: AbortSignal;
  refresh?: boolean;
}

export interface ApplySparkMutationsResult {
  job: SparkMutationJob;
  files: Record<string, string>;
  patchSets: AcePatchSet[];
}

interface SparkGatewayResponse {
  jobId: string;
  status: SparkMutationStatus;
  patchSets?: AcePatchSet[];
  message?: string;
  metadata?: Record<string, unknown>;
}

interface SupabaseSparkRecord {
  job_id: string;
  status: SparkMutationStatus;
  size_bytes: number;
  retries: number;
  request_payload: Record<string, unknown>;
  response_payload: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  message: string | null;
  updated_at: string;
  applied_at?: string | null;
}

const MUTATION_ENDPOINT = '/spark/mutations';
const JOB_ENDPOINT = '/spark/jobs';

function assertCodexGatewayEnv(): asserts GATEWAY_TOKEN is string {
  if (!GATEWAY_TOKEN) {
    throw new Error('Missing NETLIFY_GPT5_GATEWAY_TOKEN');
  }
}

function normalizeContextPack(pack: AceContextPack): AceContextPack {
  const safeSelection = pack.selection ?? {
    start: { row: 0, column: 0 },
    end: { row: 0, column: 0 },
  };
  return {
    ...pack,
    selection: {
      start: { row: Math.max(0, safeSelection.start.row), column: Math.max(0, safeSelection.start.column) },
      end: { row: Math.max(0, safeSelection.end.row), column: Math.max(0, safeSelection.end.column) },
    },
  };
}

function computeLineOffsets(text: string): number[] {
  const offsets = [0];
  for (let index = 0; index < text.length; index += 1) {
    if (text[index] === '\n') {
      offsets.push(index + 1);
    }
  }
  return offsets;
}

function toIndex(text: string, offsets: number[], point: AcePoint): number {
  if (offsets.length === 0) {
    return Math.min(point.column, text.length);
  }
  const clampedRow = Math.max(0, Math.min(point.row, offsets.length - 1));
  const baseOffset = offsets[clampedRow] ?? text.length;
  return Math.min(baseOffset + Math.max(0, point.column), text.length);
}

function applyPatchesToText(text: string, patches: AcePatch[]): string {
  if (!patches.length) return text;
  const offsets = computeLineOffsets(text);
  const normalized = patches
    .map((patch) => ({
      start: toIndex(text, offsets, patch.range.start),
      end: toIndex(text, offsets, patch.range.end),
      text: patch.text,
    }))
    .sort((a, b) => b.start - a.start);

  let result = text;
  for (const patch of normalized) {
    result = `${result.slice(0, patch.start)}${patch.text}${result.slice(Math.max(patch.start, patch.end))}`;
  }
  return result;
}

function applyPatchSets(baseFiles: Record<string, string>, patchSets: AcePatchSet[]): Record<string, string> {
  const next: Record<string, string> = { ...baseFiles };
  for (const set of patchSets) {
    const original = next[set.filePath] ?? '';
    next[set.filePath] = applyPatchesToText(original, set.patches);
  }
  return next;
}

async function withRetry<T>(
  task: () => Promise<T>,
  options: { retries: number; backoffMs: number; signal?: AbortSignal },
): Promise<{ result: T; attempts: number }> {
  let attempt = 0;
  let lastError: unknown;
  while (attempt <= options.retries) {
    if (options.signal?.aborted) {
      throw new Error('Spark mutation aborted');
    }
    try {
      const result = await task();
      return { result, attempts: attempt + 1 };
    } catch (error) {
      lastError = error;
      if (attempt === options.retries) break;
      await sleep(options.backoffMs * Math.max(1, attempt + 1), options.signal);
    }
    attempt += 1;
  }
  throw lastError instanceof Error ? lastError : new Error('Spark mutation failed with unknown error');
}

async function sleep(durationMs: number, signal?: AbortSignal) {
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => resolve(), durationMs);
    if (signal) {
      signal.addEventListener(
        'abort',
        () => {
          clearTimeout(timeout);
          reject(new Error('Spark mutation aborted'));
        },
        { once: true },
      );
    }
  });
}

async function callGateway<T>(
  method: 'GET' | 'POST',
  url: string,
  token: string,
  signal?: AbortSignal,
  body?: unknown,
): Promise<T> {
  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
    signal,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`Gateway ${method} ${url} failed: ${response.status} ${text}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  try {
    return (await response.json()) as T;
  } catch (error) {
    throw new Error(`Failed to parse gateway response: ${(error as Error).message}`);
  }
}

async function persistSparkRecord(record: SupabaseSparkRecord) {
  const { error } = await supabaseAdmin
    .from('codex_spark_mutations')
    .upsert(record as never, { onConflict: 'job_id' });
  if (error) {
    throw new Error(`Failed to persist spark mutation record: ${error.message}`);
  }
}

async function loadSparkRecord(jobId: string) {
  const { data, error } = await supabaseAdmin
    .from('codex_spark_mutations')
    .select('*')
    .eq('job_id', jobId)
    .maybeSingle();
  if (error) {
    throw new Error(`Failed to load spark mutation record: ${error.message}`);
  }
  return data as (SupabaseSparkRecord & { response_payload?: SparkGatewayResponse | null }) | null;
}

function buildSupabaseRecord(params: {
  jobId: string;
  status: SparkMutationStatus;
  sizeBytes: number;
  retries: number;
  requestPayload: Record<string, unknown>;
  responsePayload: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  message: string | null;
  appliedAt?: string | null;
}): SupabaseSparkRecord {
  const { jobId, status, sizeBytes, retries, requestPayload, responsePayload, metadata, message, appliedAt } = params;
  return {
    job_id: jobId,
    status,
    size_bytes: sizeBytes,
    retries,
    request_payload: requestPayload,
    response_payload: responsePayload,
    metadata,
    message,
    updated_at: new Date().toISOString(),
    applied_at: appliedAt ?? null,
  };
}

/**
 * Queue a spark mutation with the GPT-5 Netlify gateway and persist the run to Supabase.
 */
export async function queueSparkMutation(
  request: SparkMutationRequest,
  options: QueueSparkMutationOptions = {},
): Promise<SparkMutationJob> {
  assertServerEnv();
  assertCodexGatewayEnv();

  const normalizedPacks = request.contextPacks.map(normalizeContextPack);
  const requestPayload: Record<string, unknown> = {
    jobId: randomUUID(),
    prompt: request.prompt,
    contextPacks: normalizedPacks,
    metadata: request.metadata ?? null,
    model: request.model ?? 'gpt-5.0-pro',
  };

  const gatewayUrl = `${options.gatewayUrl ?? DEFAULT_GATEWAY_URL}${MUTATION_ENDPOINT}`;
  const sizeBytes = Buffer.byteLength(JSON.stringify(requestPayload), 'utf8');
  const retryBudget = Math.max(0, options.retries ?? 2);
  const backoffMs = Math.max(100, options.backoffMs ?? 750);

  try {
    const { result: response, attempts } = await withRetry(
      () => callGateway<SparkGatewayResponse>('POST', gatewayUrl, GATEWAY_TOKEN!, options.signal, requestPayload),
      { retries: retryBudget, backoffMs, signal: options.signal },
    );

    const patchSets = response.patchSets ?? [];
    const job: SparkMutationJob = {
      jobId: response.jobId ?? (requestPayload.jobId as string),
      status: response.status ?? 'queued',
      sizeBytes,
      retries: attempts - 1,
      patchSets,
      message: response.message,
    };

    await persistSparkRecord(
      buildSupabaseRecord({
        jobId: job.jobId,
        status: job.status,
        sizeBytes,
        retries: job.retries,
        requestPayload,
        responsePayload: response as unknown as Record<string, unknown>,
        metadata: request.metadata ?? null,
        message: response.message ?? null,
      }),
    );

    return job;
  } catch (error) {
    await persistSparkRecord(
      buildSupabaseRecord({
        jobId: requestPayload.jobId as string,
        status: 'failed',
        sizeBytes,
        retries: retryBudget + 1,
        requestPayload,
        responsePayload: null,
        metadata: request.metadata ?? null,
        message: error instanceof Error ? error.message : 'Unknown spark mutation error',
      }),
    );
    throw error;
  }
}

/**
 * Fetch the latest mutation patches and apply them to the provided file map, updating Supabase state.
 */
export async function applySparkMutations(
  jobId: string,
  baseFiles: Record<string, string>,
  options: ApplySparkMutationsOptions = {},
): Promise<ApplySparkMutationsResult> {
  assertServerEnv();
  assertCodexGatewayEnv();

  const record = await loadSparkRecord(jobId);
  if (!record) {
    throw new Error(`Spark mutation ${jobId} not found`);
  }

  let responsePayload = (record.response_payload as unknown as SparkGatewayResponse | null) ?? null;

  if (!responsePayload || options.refresh) {
    const gatewayUrl = `${DEFAULT_GATEWAY_URL}${JOB_ENDPOINT}/${jobId}`;
    responsePayload = await callGateway<SparkGatewayResponse>('GET', gatewayUrl, GATEWAY_TOKEN!, options.signal);

    await persistSparkRecord(
      buildSupabaseRecord({
        jobId,
        status: responsePayload.status ?? record.status,
        sizeBytes: record.size_bytes,
        retries: record.retries,
        requestPayload: record.request_payload,
        responsePayload: responsePayload as unknown as Record<string, unknown>,
        metadata: record.metadata,
        message: responsePayload.message ?? record.message ?? null,
      }),
    );
  }

  const patchSets = responsePayload.patchSets ?? [];
  const files = applyPatchSets(baseFiles, patchSets);

  const job: SparkMutationJob = {
    jobId,
    status: 'applied',
    sizeBytes: record.size_bytes,
    retries: record.retries,
    patchSets,
    message: responsePayload.message ?? record.message ?? undefined,
  };

  await persistSparkRecord(
    buildSupabaseRecord({
      jobId,
      status: job.status,
      sizeBytes: job.sizeBytes,
      retries: job.retries,
      requestPayload: record.request_payload,
      responsePayload: responsePayload as unknown as Record<string, unknown>,
      metadata: record.metadata,
      message: job.message ?? null,
      appliedAt: new Date().toISOString(),
    }),
  );

  return {
    job,
    files,
    patchSets,
  };
}
