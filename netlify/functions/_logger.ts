import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase credentials for mutation logger");
}

const supabase = createClient(supabaseUrl, supabaseKey);

type MutationStatus = "success" | "failure";

type MutationLogEntry = {
  actor: string;
  ritual: string;
  target?: string;
  status: MutationStatus;
  message: string;
  payload?: unknown;
  response?: unknown;
};

export async function logMutation(entry: MutationLogEntry) {
  const { error } = await supabase.from("codex_mutations").insert({
    actor: entry.actor,
    ritual: entry.ritual,
    target: entry.target ?? null,
    status: entry.status,
    message: entry.message,
    payload: entry.payload ?? null,
    response: entry.response ?? null,
  });

  if (error) {
    console.error("Failed to log mutation", error);
  }
}
