import { createClient, type SupabaseClient } from '@supabase/supabase-js';

type MutationLog = {
  actor: string;
  ritual: string;
  status: 'success' | 'failure' | string;
  message: string;
  payload?: unknown;
  response?: unknown;
  metadata?: Record<string, unknown> | null;
};

const TABLE = process.env.SUPABASE_MUTATIONS_TABLE ?? 'ritual_mutations';
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

let cachedClient: SupabaseClient | null = null;

function ensureClient(): SupabaseClient | null {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn('[logMutation] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY; skipping mutation log.');
    return null;
  }
  if (!cachedClient) {
    cachedClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false },
      global: { headers: { 'X-Client-Info': 'beehive-netlify-functions' } },
    });
  }
  return cachedClient;
}

function payloadSize(value: unknown): number | null {
  try {
    const json = JSON.stringify(value);
    return typeof json === 'string' ? Buffer.byteLength(json, 'utf8') : null;
  } catch {
    return null;
  }
}

export async function logMutation(entry: MutationLog): Promise<void> {
  const client = ensureClient();
  if (!client) return;

  const { actor, ritual, status, message, payload = null, response = null, metadata } = entry;
  const enrichedMetadata = {
    ...(metadata ?? {}),
    payloadBytes: payloadSize(payload),
    responseBytes: payloadSize(response),
  };

  const { error } = await client
    .from(TABLE)
    .insert({ actor, ritual, status, message, payload, response, metadata: enrichedMetadata });

  if (error) {
    console.error('[logMutation] Failed to record mutation:', error);
  }
}
