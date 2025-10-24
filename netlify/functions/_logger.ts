export type MutationLogInput = {
  actor?: string;
  ritual: string;
  status: string;
  message: string;
  payload?: unknown;
  response?: unknown;
  metadata?: Record<string, unknown>;
};

const DEFAULT_TABLE = 'codex_mutations';
const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, MUTATION_LOG_TABLE } = process.env;

async function postSupabase(table: string, body: Record<string, unknown>) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('[logMutation] Missing Supabase credentials; skipping log.');
    return;
  }

  const endpoint = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/${table}`;
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify([body]),
  });

  if (!res.ok) {
    let detail: string | null = null;
    try {
      const data = (await res.json()) as { message?: string; hint?: string };
      detail = data?.message ?? JSON.stringify(data);
    } catch {
      detail = await res.text();
    }
    throw new Error(`Supabase logging failed (${res.status}): ${detail}`);
  }
}

export async function logMutation(entry: MutationLogInput): Promise<boolean> {
  const table = (MUTATION_LOG_TABLE && MUTATION_LOG_TABLE.trim()) || DEFAULT_TABLE;
  const body = {
    actor: entry.actor ?? null,
    ritual: entry.ritual,
    status: entry.status,
    message: entry.message,
    payload: entry.payload ?? null,
    response: entry.response ?? null,
    metadata: entry.metadata ?? null,
    timestamp: new Date().toISOString(),
  };

  try {
    await postSupabase(table, body);
    return true;
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.error('[logMutation] Failed to persist log:', reason);
    return false;
  }
}
