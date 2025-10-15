export function assertServerEnv() {
  const missing: string[] = [];
  if (!process.env.SUPABASE_URL) missing.push('SUPABASE_URL');
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) missing.push('SUPABASE_SERVICE_ROLE_KEY');
  if (!process.env.GEMINI_API_KEY) missing.push('GEMINI_API_KEY');
  if (missing.length) {
    throw new Error(`Missing server env: ${missing.join(', ')}`);
  }
}
