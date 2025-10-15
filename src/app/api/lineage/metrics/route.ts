import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { assertServerEnv } from '@/lib/envGuard';

export const runtime = 'nodejs';

function daysBack(n = 14) {
  const out: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

type SeriesPoint = { day: string; montages: number; sessions: number };

async function computeKFactor(series: SeriesPoint[]): Promise<number | null> {
  try {
    const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
    const { data: refs, error } = await supabaseAdmin
      .from('referrals')
      .select('source_id,target_id,created_at')
      .gte('created_at', since)
      .limit(10000);
    if (!error && Array.isArray(refs) && refs.length) {
      const seeds = new Set<string>();
      const targets = new Set<string>();
      for (const r of refs) {
        if (r.source_id) seeds.add(String(r.source_id));
        if (r.target_id) targets.add(String(r.target_id));
      }
      if (seeds.size > 0) {
        return Math.round((targets.size / seeds.size) * 100) / 100;
      }
    }
  } catch {
    /* ignore */
  }

  const ratios: number[] = [];
  for (let i = 1; i < series.length; i++) {
    const prev = series[i - 1].montages;
    const cur = series[i].montages;
    if (prev > 0) ratios.push(cur / prev);
  }
  if (!ratios.length) return null;
  const avg = ratios.reduce((a, b) => a + b, 0) / ratios.length;
  return Math.round(avg * 100) / 100;
}

export async function GET(_req: NextRequest) {
  assertServerEnv();

  const windowDays = 14;
  const days = daysBack(windowDays);
  const start = new Date(days[0] + 'T00:00:00Z').toISOString();

  let montages: Array<{ created_at: string }> = [];
  let messages: Array<{ created_at: string; session_id: string | null }> = [];

  try {
    const { data } = await supabaseAdmin
      .from('montages')
      .select('id,created_at')
      .gte('created_at', start)
      .limit(10000);
    montages = data ?? [];
  } catch {
    montages = [];
  }

  try {
    const { data } = await supabaseAdmin
      .from('agent_messages')
      .select('id,created_at,session_id')
      .gte('created_at', start)
      .limit(10000);
    messages = data ?? [];
  } catch {
    messages = [];
  }

  const series: SeriesPoint[] = days.map((day) => ({ day, montages: 0, sessions: 0 }));
  const dayIndex = new Map(days.map((d, i) => [d, i]));

  for (const m of montages) {
    const day = String(m.created_at).slice(0, 10);
    const idx = dayIndex.get(day);
    if (idx !== undefined) series[idx].montages++;
  }

  const sessionsMap: Record<string, Set<string>> = {};
  for (const msg of messages) {
    const day = String(msg.created_at).slice(0, 10);
    const sid = msg.session_id ? String(msg.session_id) : '';
    if (!sid) continue;
    if (!sessionsMap[day]) sessionsMap[day] = new Set();
    sessionsMap[day].add(sid);
  }

  for (const [day, set] of Object.entries(sessionsMap)) {
    const idx = dayIndex.get(day);
    if (idx !== undefined) series[idx].sessions = set.size;
  }

  const k = await computeKFactor(series);
  const totalMontages = montages.length;
  const totalSessions = Object.values(sessionsMap).reduce((sum, set) => sum + set.size, 0);
  const latest = series[series.length - 1] ?? { montages: 0, sessions: 0 };
  const prev = series.length > 1 ? series[series.length - 2] : { montages: 0, sessions: 0 };
  const delta = latest.montages - prev.montages;

  return NextResponse.json({
    ok: true,
    kFactor: k,
    totals: { montages: totalMontages, sessions: totalSessions },
    latest: { montages: latest.montages, sessions: latest.sessions, delta },
    series,
    windowDays,
  });
}
