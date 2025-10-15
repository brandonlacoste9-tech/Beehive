import { NextResponse } from 'next/server';
import { CODEX_INSTANCE } from '@/lib/instance';

export const runtime = 'nodejs';

export async function GET() {
  const env = {
    SUPABASE_URL: !!process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    GEMINI_API_KEY: !!process.env.GEMINI_API_KEY,
  };
  const ok = env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY && env.GEMINI_API_KEY;
  return NextResponse.json(
    {
      ok,
      instance: CODEX_INSTANCE,
      env,
      ts: new Date().toISOString(),
    },
    { status: ok ? 200 : 500 }
  );
}
