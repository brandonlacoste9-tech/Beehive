import type { Handler } from '@netlify/functions';

import {
  extractResponse,
  jsonResponse,
  methodNotAllowed,
  missingConfig,
  parseJsonBody,
  requireCapability,
} from './_shared/http';

type GeminiPayload = {
  prompt?: string;
  model?: string;
};

const CAPABILITY = process.env.CODEX_CAPABILITY_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return methodNotAllowed('POST');
  }

  const auth = requireCapability(event, CAPABILITY);
  if (auth) return auth;

  if (!GEMINI_API_KEY) {
    return missingConfig('GEMINI_API_KEY');
  }

  const parsed = parseJsonBody<GeminiPayload>(event);
  if (!parsed.ok) return parsed.error;

  const prompt = parsed.data.prompt?.trim();
  const model = parsed.data.model?.trim() || 'gemini-2.5-flash';

  if (!prompt) {
    return jsonResponse(400, { ok: false, error: 'Missing prompt' });
  }

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
        }),
      }
    );

    const summary = await extractResponse(res);
    if (!summary.ok) {
      const errorMessage =
        (summary.data as any)?.error?.message || 'Gemini request failed';
      return jsonResponse(summary.status, {
        ok: false,
        target: 'google.gemini',
        status: summary.status,
        error: errorMessage,
        sizeBytes: summary.sizeBytes,
        requestId: summary.requestId,
        model,
        data: summary.data,
      });
    }

    const text = extractGeminiText(summary.data);
    return jsonResponse(200, {
      ok: true,
      target: 'google.gemini',
      status: summary.status,
      forwardedAt: new Date().toISOString(),
      sizeBytes: summary.sizeBytes,
      requestId: summary.requestId,
      model,
      text,
      data: summary.data,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Gemini request failed';
    return jsonResponse(502, {
      ok: false,
      target: 'google.gemini',
      error: message,
    });
  }
};

function extractGeminiText(data: unknown): string {
  if (!data || typeof data !== 'object') return '';
  const candidate = (data as any)?.candidates?.[0];
  if (!candidate) return '';
  const parts = candidate?.content?.parts;
  if (!Array.isArray(parts)) return '';
  return parts
    .map((part: any) => (typeof part?.text === 'string' ? part.text : ''))
    .filter(Boolean)
    .join('\n');
}
