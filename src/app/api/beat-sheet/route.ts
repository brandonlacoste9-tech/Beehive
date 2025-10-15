import { NextRequest, NextResponse } from 'next/server';
import { BEAT_SHEET_TEMPLATE } from '@/lib/promptTemplates/beatSheet';
import { getSentimentSummary, toSentimentSnippet } from '@/lib/sentiment';
import { runGeminiPrompt } from '@/lib/gemini';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { topic, audience, windowMin = 180, userInput = '' } = body ?? {};

    const summary = await getSentimentSummary(windowMin);
    const sentimentSnippet = toSentimentSnippet(summary);

    const systemPrompt = BEAT_SHEET_TEMPLATE
      .replace('{{WINDOW_MIN}}', String(summary.windowMin))
      .replace('{{SENTIMENT_SNIPPET}}', sentimentSnippet);

    const userPrompt =
      `Topic: ${topic || 'N/A'}\n` +
      `Audience: ${audience || 'general'}\n` +
      `${userInput}`;

    const text = await runGeminiPrompt(systemPrompt, userPrompt);
    return NextResponse.json({ ok: true, sentiment: summary, result: text });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? 'unknown' }, { status: 500 });
  }
}

