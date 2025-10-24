import { NextRequest, NextResponse } from 'next/server';
import { buildSandboxAgentPayload } from '@/lib/sandboxAgent';

export const runtime = 'nodejs';

function hasLiveEnv() {
  return (
    Boolean(process.env.SUPABASE_URL) &&
    Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)
  );
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const windowParam = Number(url.searchParams.get('windowMin') ?? 180) || 180;

  if (!hasLiveEnv()) {
    const { summary } = buildSandboxAgentPayload({ message: '', windowMin: windowParam });
    return NextResponse.json({ ok: true, summary, mode: 'sandbox' });
  }

  try {
    const { getSentimentSummary } = await import('@/lib/sentiment');
    const summary = await getSentimentSummary(windowParam);
    return NextResponse.json({ ok: true, summary, mode: 'live' });
  } catch (e: any) {
    const { summary } = buildSandboxAgentPayload({ message: '', windowMin: windowParam });
    return NextResponse.json({ ok: true, summary, mode: 'sandbox', fallbackError: e?.message });
  }
}
