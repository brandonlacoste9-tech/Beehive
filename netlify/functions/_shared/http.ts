import type { HandlerEvent, HandlerResponse } from '@netlify/functions';
import { Buffer } from 'node:buffer';

type JsonResult<T> = { ok: true; data: T } | { ok: false; error: HandlerResponse };

function capabilityHeader(event: HandlerEvent) {
  const headers = event.headers || {};
  return (
    (headers['x-codex-capability'] as string | undefined) ??
    (headers['X-Codex-Capability'] as string | undefined)
  );
}

export function methodNotAllowed(allowed: string | string[]): HandlerResponse {
  const value = Array.isArray(allowed) ? allowed.join(', ') : allowed;
  return {
    statusCode: 405,
    headers: { Allow: value },
    body: 'Method not allowed',
  };
}

export function jsonResponse(statusCode: number, body: unknown): HandlerResponse {
  return {
    statusCode,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  };
}

export function missingConfig(name: string): HandlerResponse {
  return jsonResponse(500, {
    ok: false,
    error: `Missing configuration: ${name}`,
  });
}

export function requireCapability(
  event: HandlerEvent,
  key: string | undefined
): HandlerResponse | null {
  if (!key) {
    return missingConfig('CODEX_CAPABILITY_KEY');
  }

  const provided = capabilityHeader(event);
  if (provided !== key) {
    return jsonResponse(401, { ok: false, error: 'Unauthorized' });
  }
  return null;
}

function decodeBody(event: HandlerEvent): string {
  if (!event.body) return '';
  return event.isBase64Encoded
    ? Buffer.from(event.body, 'base64').toString('utf8')
    : event.body;
}

export function parseJsonBody<T = Record<string, unknown>>(
  event: HandlerEvent
): JsonResult<T> {
  const raw = decodeBody(event);
  if (!raw) {
    return { ok: true, data: {} as T };
  }

  try {
    return { ok: true, data: JSON.parse(raw) as T };
  } catch {
    return {
      ok: false,
      error: jsonResponse(400, { ok: false, error: 'Invalid JSON body' }),
    };
  }
}

type FetchResponse = globalThis.Response;

type ExtractedResponse = {
  ok: boolean;
  status: number;
  sizeBytes: number;
  requestId: string | null;
  data: unknown;
  raw: string;
};

export async function extractResponse(res: FetchResponse): Promise<ExtractedResponse> {
  const raw = await res.text();
  let data: unknown = null;
  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch {
      data = raw;
    }
  }

  const requestId =
    res.headers.get('x-request-id') ??
    res.headers.get('x-github-request-id') ??
    res.headers.get('x-nf-request-id') ??
    res.headers.get('x-amzn-requestid') ??
    res.headers.get('x-amzn-trace-id');

  return {
    ok: res.ok,
    status: res.status,
    sizeBytes: Buffer.byteLength(raw, 'utf8'),
    requestId,
    data,
    raw,
  };
}

export async function relayResponse(
  target: string,
  res: FetchResponse,
  meta: Record<string, unknown> = {}
): Promise<HandlerResponse> {
  const extracted = await extractResponse(res);
  return jsonResponse(extracted.status, {
    ok: extracted.ok,
    status: extracted.status,
    target,
    forwardedAt: new Date().toISOString(),
    sizeBytes: extracted.sizeBytes,
    requestId: extracted.requestId,
    data: extracted.data,
    ...meta,
  });
}
