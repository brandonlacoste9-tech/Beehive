import { getSupabaseAdmin } from './supabaseAdmin';

type Row = { platform: string; text: string; sentiment_score: number | null; ts: string };

export type SentimentSummary = {
  windowMin: number;
  count: number;
  avg: number; // mean sentiment_score (-1..1)
  minTs?: string;
  maxTs?: string;
  sample?: Array<{ platform: string; text: string; score: number }>;
};

export async function getSentimentSummary(windowMin = 180): Promise<SentimentSummary> {
  const since = new Date(Date.now() - windowMin * 60_000).toISOString();
  const supabase = getSupabaseAdmin();

  // Assumes table: social_mentions(text, platform, sentiment_score, magnitude, ts)
  const { data, error } = await supabase
    .from('social_mentions')
    .select('platform,text,sentiment_score,ts')
    .gte('ts', since)
    .order('ts', { ascending: false })
    .limit(200);

  if (error) throw error;
  const rows: Row[] = data ?? [];

  const count = rows.length;
  const avg = count ? rows.reduce((s, r) => s + (r.sentiment_score ?? 0), 0) / count : 0;
  const minTs = count ? rows[rows.length - 1].ts : undefined;
  const maxTs = count ? rows[0].ts : undefined;
  const sample = rows.slice(0, 6).map((r) => ({
    platform: r.platform,
    text: r.text,
    score: r.sentiment_score ?? 0,
  }));

  return { windowMin, count, avg, minTs, maxTs, sample };
}

export function toSentimentSnippet(s: SentimentSummary) {
  const mood =
    s.avg > 0.25
      ? 'optimistic/positive'
      : s.avg < -0.25
      ? 'frustrated/negative'
      : 'mixed/neutral';

  const bullets = (s.sample ?? [])
    .map((m) => `• [${m.platform}] (${m.score.toFixed(2)}): ${m.text.slice(0, 160)}`)
    .join('\n');

  return `Window: ${s.windowMin}m | Mentions: ${s.count} | Mean: ${s.avg.toFixed(2)} → Mood: ${mood}` +
    `\nExamples:\n${bullets || '• (no recent examples)'}`;
}
