import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { requireCodexAgent, correlationHeaders } from '@/lib/codexAgents';

export const runtime = 'nodejs';

export async function GET(_req: Request, ctx: { params: { id: string } }) {
  const runId = randomUUID();
  const { id } = ctx.params;

  try {
    requireCodexAgent(id);
    return NextResponse.json(
      { ok: true, runId, items: [], nextCursor: null },
      { headers: correlationHeaders(runId) },
    );
  } catch (err: any) {
    const status = typeof err?.status === 'number' ? err.status : 400;
    const message = err?.message ?? 'error';
    return NextResponse.json(
      { ok: false, runId, error: message },
      { status, headers: correlationHeaders(runId) },
    );
  }
}
