import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import {
  requireCodexAgent,
  requireJSON,
  correlationHeaders,
  rateLimit,
} from '@/lib/codexAgents';

export const runtime = 'nodejs';

export async function POST(req: Request, ctx: { params: { id: string } }) {
  const runId = randomUUID();
  const { id } = ctx.params;

  try {
    const agent = requireCodexAgent(id);
    const body = await requireJSON(req);
    const task = typeof body?.task === 'string' ? body.task.trim() : '';
    if (!task) {
      throw httpError(400, 'missing task');
    }

    const inputs = body?.inputs && typeof body.inputs === 'object' ? body.inputs : {};
    const rpm = agent.entitlements?.limits?.rpm ?? 60;
    rateLimit(`agent:${id}`, rpm);

    const output = {
      echo: { task, inputs },
      note: 'stub',
    };

    return NextResponse.json(
      {
        ok: true,
        runId,
        output,
        tokens: { input: 0, output: 0 },
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

function httpError(status: number, message: string) {
  const error = new Error(message) as Error & { status?: number };
  error.status = status;
  return error;
}
