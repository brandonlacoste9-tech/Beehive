import { NextRequest, NextResponse } from 'next/server';
import { getSentimentSummary } from '@/lib/sentiment';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const windowMinParam = searchParams.get('windowMin');
    const parsed = windowMinParam ? Number.parseInt(windowMinParam, 10) : Number.NaN;
    const windowMin = Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;

    const summary = await getSentimentSummary(windowMin ?? 180);

    return NextResponse.json({ ok: true, summary });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? 'unknown error' }, { status: 500 });
  }
}
