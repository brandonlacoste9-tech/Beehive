const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_LEDGER_TABLE = process.env.SUPABASE_LEDGER_TABLE ?? "ritual_ledger";

type Serializable = string | number | boolean | null | Serializable[] | { [key: string]: Serializable };

type MutationStatus = "success" | "failure";

export type MutationLog = {
  actor: string;
  ritual: string;
  status: MutationStatus;
  message?: string;
  payload?: unknown;
  response?: unknown;
};

function toSerializable(value: unknown): Serializable {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(toSerializable) as Serializable[];
  }

  if (typeof value === "object") {
    const result: Record<string, Serializable> = {};
    for (const [key, entry] of Object.entries(value)) {
      result[key] = toSerializable(entry);
    }
    return result;
  }

  return String(value);
}

export async function logMutation(entry: MutationLog): Promise<void> {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.warn("[logMutation] Missing Supabase configuration.");
    return;
  }

  const payload = {
    ...entry,
    payload: entry.payload ? toSerializable(entry.payload) : null,
    response: entry.response ? toSerializable(entry.response) : null,
  };

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${SUPABASE_LEDGER_TABLE}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText);
      console.error(`[logMutation] Failed to persist mutation: ${res.status} ${text}`);
    }
  } catch (error) {
    console.error("[logMutation] Unexpected error while logging mutation", error);
  }
}
