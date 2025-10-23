import type { Handler } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const CAP = process.env.CODEX_CAPABILITY_KEY;

if (!supabaseUrl || !serviceKey) {
  throw new Error("Missing Supabase credentials for mutations function");
}

const supabase = createClient(supabaseUrl, serviceKey);

export const handler: Handler = async (event) => {
  if (!CAP) {
    return { statusCode: 500, body: "Server misconfigured" };
  }

  const headerCap = event.headers?.["x-codex-capability"] ?? event.headers?.["X-Codex-Capability"];
  if (headerCap !== CAP) {
    return { statusCode: 401, body: "Unauthorized" };
  }

  const { data, error } = await supabase
    .from("codex_mutations")
    .select("id,created_at,actor,ritual,target,status,message")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return { statusCode: 500, body: error.message };
  }

  return {
    statusCode: 200,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(data ?? []),
  };
};
