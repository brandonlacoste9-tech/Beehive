'use client';

type RitualPayload = Record<string, unknown> & { actor?: string };

type RitualResponse<T> = {
  ok: true;
  status: number;
  data: T;
  metadata?: Record<string, unknown>;
};

export async function call<T = unknown>(ritual: string, payload: RitualPayload = {}): Promise<RitualResponse<T>> {
  const { actor, ...rest } = payload;
  const response = await fetch(`/api/rituals/${ritual}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ...rest, actor }),
  });

  let json: any = null;
  try {
    json = await response.json();
  } catch {
    json = null;
  }

  if (!response.ok || !json?.ok) {
    const message = json?.error || `Ritual ${ritual} failed (${response.status})`;
    const error = new Error(message) as Error & { metadata?: Record<string, unknown> };
    if (json?.metadata && typeof json.metadata === 'object') {
      error.metadata = json.metadata as Record<string, unknown>;
    }
    throw error;
  }

  return json as RitualResponse<T>;
}
