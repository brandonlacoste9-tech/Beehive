import { NextRequest, NextResponse } from 'next/server';
import { buildSandboxAgentPayload } from '@/lib/sandboxAgent';
import { AGENT_CHAT_TEMPLATE } from '@/lib/promptTemplates/agentChat';

export const runtime = 'nodejs';

function hasLiveEnv() {
  return (
    Boolean(process.env.GEMINI_API_KEY) &&
    Boolean(process.env.SUPABASE_URL) &&
    Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)
  );
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const message = typeof body?.message === 'string' ? body.message : '';
  const windowMin = Number(body?.windowMin ?? 180) || 180;

  if (!hasLiveEnv()) {
    const payload = buildSandboxAgentPayload({ message, windowMin });
    return NextResponse.json({
      ok: true,
      reply: payload.reply,
      sentiment: payload.summary,
      mode: 'sandbox',
    });
  }

  try {
    const [{ getSentimentSummary, toSentimentSnippet }, { runGeminiPrompt }] = await Promise.all([
      import('@/lib/sentiment'),
      import('@/lib/gemini'),
    ]);

    const summary = await getSentimentSummary(windowMin);
    const snippet = toSentimentSnippet(summary);
    const systemPrompt = AGENT_CHAT_TEMPLATE
      .replace('{{WINDOW_MIN}}', String(summary.windowMin))
      .replace('{{SENTIMENT_SNIPPET}}', snippet);

    const userPrompt = message || 'Provide sentiment-led guidance for the ritual.';
    const reply = await runGeminiPrompt(systemPrompt, userPrompt);

    return NextResponse.json({ ok: true, reply, sentiment: summary, mode: 'live' });
  } catch (e: any) {
    const payload = buildSandboxAgentPayload({ message, windowMin });
    return NextResponse.json({
      ok: true,
      reply: payload.reply,
      sentiment: payload.summary,
      mode: 'sandbox',
      fallbackError: e?.message,
    });
  }
}
