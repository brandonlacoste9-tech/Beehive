import { Buffer } from 'node:buffer';
import { NextResponse, type NextRequest } from 'next/server';

const CAP = process.env.CODEX_CAPABILITY_KEY;

function resolveBaseUrl(): string {
  const candidates = [
    process.env.RITUAL_FUNCTION_BASE,
    process.env.NETLIFY_SITE_URL,
    process.env.URL,
    process.env.DEPLOY_URL,
    process.env.SITE_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
  ];
  for (const value of candidates) {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.replace(/\/$/, '');
    }
  }
  return 'http://localhost:8888';
}

async function forwardRitual(
  ritual: string,
  payload: Record<string, unknown>,
  actor: string,
): Promise<{ ok: boolean; status: number; data?: unknown; error?: string; metadata?: Record<string, unknown> }> {
  if (!CAP) {
    return { ok: false, status: 500, error: 'Capability not configured' };
  }

  const base = resolveBaseUrl();
  const target = `${base}/.netlify/functions/${ritual}`;

  let requestBody = '{}';
  try {
    requestBody = JSON.stringify(payload ?? {});
  } catch (error: any) {
    return {
      ok: false,
      status: 400,
      error: `Ritual payload serialization failed: ${String(error)}`,
    };
  }
  const requestBytes = Buffer.byteLength(requestBody, 'utf8');

  let response: Response;
  try {
    response = await fetch(target, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-codex-capability': CAP,
        'x-codex-actor': actor,
      },
      body: requestBody,
    });
  } catch (error: any) {
    return {
      ok: false,
      status: 502,
      error: `Ritual forward failed: ${String(error)}`,
    };
  }

  const text = await response.text();
  const responseBytes = Buffer.byteLength(text, 'utf8');
  const contentLengthHeader = response.headers.get('content-length');
  const parsedContentLength = contentLengthHeader ? Number(contentLengthHeader) : undefined;
  const contentLength =
    typeof parsedContentLength === 'number' && Number.isFinite(parsedContentLength)
      ? parsedContentLength
      : undefined;
  const requestId = response.headers.get('x-nf-request-id') ?? undefined;

  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }

  if (!response.ok) {
    const message = typeof json?.error === 'string' ? json.error : text || 'Ritual invocation failed';
    return {
      ok: false,
      status: response.status,
      error: message,
      metadata: {
        requestId,
        functionUrl: target,
        statusCode: response.status,
        requestBytes,
        responseBytes,
        contentLength,
      },
    };
  }

  return {
    ok: true,
    status: response.status,
    data: json ?? text ?? null,
    metadata: {
      requestId,
      functionUrl: target,
      statusCode: response.status,
      requestBytes,
      responseBytes,
      contentLength,
    },
  };
}

export async function POST(request: NextRequest, { params }: { params: { ritual: string } }) {
  const ritual = params.ritual;
  if (!ritual) {
    return NextResponse.json({ ok: false, error: 'Missing ritual name', status: 400 }, { status: 400 });
  }

  let incoming: any = {};
  try {
    incoming = await request.json();
  } catch {
    incoming = {};
  }

  const actor =
    (typeof incoming.actor === 'string' && incoming.actor.trim()) ||
    request.headers.get('x-codex-actor') ||
    'Dashboard Steward';

  const { actor: _omit, ...payload } =
    incoming && typeof incoming === 'object' ? (incoming as Record<string, unknown>) : {};

  const result = await forwardRitual(ritual, payload, actor);
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, status: result.status, error: result.error, metadata: result.metadata },
      { status: result.status },
    );
  }

  return NextResponse.json(
    {
      ok: true,
      status: result.status,
      data: result.data,
      metadata: result.metadata,
    },
    { status: 200 },
  );
}
