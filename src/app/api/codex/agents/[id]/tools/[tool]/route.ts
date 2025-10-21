import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import {
  requireCodexAgent,
  requireJSON,
  correlationHeaders,
  rateLimit,
} from '@/lib/codexAgents';

export const runtime = 'nodejs';

export async function POST(req: Request, ctx: { params: { id: string; tool: string } }) {
  const runId = randomUUID();
  const { id, tool } = ctx.params;

  try {
    const agent = requireCodexAgent(id);
    const payload = await requireJSON(req);
    const rpm = agent.entitlements?.limits?.rpm ?? 60;
    rateLimit(`agent:${id}:tool:${tool}`, rpm);

    return NextResponse.json(
      {
        ok: true,
        runId,
        result: { tool, inputs: payload ?? {} },
      },
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
