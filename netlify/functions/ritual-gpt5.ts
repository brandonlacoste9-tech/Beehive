import type { Handler } from '@netlify/functions';

const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-5-pro';
const API_URL = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
const BASE_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
};

function extractText(payload: any): string {
  if (!payload) return '';
  if (typeof payload.output_text === 'string' && payload.output_text.trim()) {
    return payload.output_text.trim();
  }
  if (Array.isArray(payload.output)) {
    const chunks: string[] = [];
    for (const item of payload.output) {
      if (Array.isArray(item.content)) {
        for (const part of item.content) {
          if (part && part.type === 'text' && typeof part.text === 'string') {
            chunks.push(part.text);
          }
        }
      }
    }
    return chunks.join('\n').trim();
  }
  if (typeof payload.text === 'string') {
    return payload.text.trim();
  }
  return '';
}

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: { ...BASE_HEADERS, Allow: 'POST' },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { ...BASE_HEADERS, Allow: 'POST' },
      body: JSON.stringify({ ok: false, error: 'Method not allowed' }),
    };
  }

  const key = process.env.OPENAI_API_KEY || process.env.OPENAI_KEY;
  if (!key) {
    return {
      statusCode: 500,
      headers: BASE_HEADERS,
      body: JSON.stringify({ ok: false, error: 'Missing OPENAI_API_KEY' }),
    };
  }

  let payload: { prompt?: string; system?: string };
  try {
    payload = event.body ? JSON.parse(event.body) : {};
  } catch {
    return {
      statusCode: 400,
      headers: BASE_HEADERS,
      body: JSON.stringify({ ok: false, error: 'Invalid JSON body' }),
    };
  }

  const prompt = payload.prompt?.trim();
  if (!prompt) {
    return {
      statusCode: 400,
      headers: BASE_HEADERS,
      body: JSON.stringify({ ok: false, error: 'Missing prompt' }),
    };
  }

  const body: Record<string, any> = {
    model: DEFAULT_MODEL,
    input: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  };

  if (payload.system?.trim()) {
    body.input.unshift({ role: 'system', content: payload.system.trim() });
  }

  try {
    const response = await fetch(`${API_URL}/responses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers: BASE_HEADERS,
        body: JSON.stringify({ ok: false, error: data }),
      };
    }

    const text = extractText(data);
    const metadata = {
      ok: true,
      model: data.model ?? DEFAULT_MODEL,
      jobId: data.id ?? null,
      status: data.status ?? 'unknown',
      sizeBytes: Buffer.byteLength(text, 'utf8'),
      output: text,
    };

    return {
      statusCode: 200,
      headers: BASE_HEADERS,
      body: JSON.stringify(metadata),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: BASE_HEADERS,
      body: JSON.stringify({ ok: false, error: String(error) }),
    };
  }
};
