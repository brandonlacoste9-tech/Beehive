import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { assertServerEnv } from '@/lib/envGuard';

export const runtime = 'nodejs';

type Bin = { hour: string; count: number; mean: number };

function hasSupabaseEnv() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function GET(req: NextRequest) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ ok: false, error: 'supabase env missing' }, { status: 503 });
  }
  assertServerEnv();
  const supabase = getSupabaseAdmin();
  const url = new URL(req.url);
  const hours = Math.min(Math.max(Number(url.searchParams.get('hours') ?? 24), 6), 72);
  const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('social_mentions')
    .select('ts, sentiment_score')
    .gte('ts', since)
    .order('ts', { ascending: true })
    .limit(20000);
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  const bins: Bin[] = [];
  const now = new Date();
  for (let i = hours - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setMinutes(0, 0, 0);
    d.setHours(now.getHours() - i);
    const label = d.toISOString().slice(0, 13) + ':00';
    bins.push({ hour: label, count: 0, mean: 0 });
  }
  const index = new Map(bins.map((b, i) => [b.hour, i]));

  for (const r of data ?? []) {
    const dt = new Date(r.ts as string);
    dt.setMinutes(0, 0, 0);
    const label = dt.toISOString().slice(0, 13) + ':00';
    const idx = index.get(label);
    if (idx === undefined) continue;
    const bin = bins[idx];
    const score = typeof r.sentiment_score === 'number' ? r.sentiment_score : 0;
    bin.mean = (bin.mean * bin.count + score) / (bin.count + 1);
    bin.count += 1;
  }

  return NextResponse.json({ ok: true, hours, series: bins });
}
