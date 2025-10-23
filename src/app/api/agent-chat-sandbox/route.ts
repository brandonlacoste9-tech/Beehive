import { NextRequest, NextResponse } from 'next/server';
import { buildSandboxAgentPayload } from '@/lib/sandboxAgent';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = typeof body?.message === 'string' ? body.message : '';
    const windowMin = Number(body?.windowMin ?? 180) || 180;
    const payload = buildSandboxAgentPayload({ message, windowMin });
    return NextResponse.json({ ok: true, reply: payload.reply, sentiment: payload.summary, mode: 'sandbox' });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? 'sandbox failure' }, { status: 500 });
  }
}
