'use client';

import { useEffect, useState } from 'react';

type HistogramPoint = { hour: string; count: number; mean: number };

type Props = {
  windowMin?: number;
};

export default function SentimentCard({ windowMin = 180 }: Props) {
  const [series, setSeries] = useState<HistogramPoint[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const hours = Math.max(1, Math.round(windowMin / 60));
    (async () => {
      try {
        const res = await fetch(`/api/sentiment/histogram?hours=${hours}`, { cache: 'no-store' });
        const json = await res.json();
        if (!json.ok) throw new Error(json.error || 'sentiment error');
        if (!cancelled) setSeries(json.series ?? []);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message ?? 'network error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [windowMin]);

  if (err) {
    return (
      <div className="rounded-2xl bg-red-50 p-5 shadow">
        <div className="text-sm font-semibold text-red-700">Sentiment offline</div>
        <div className="text-xs text-red-600">{err}</div>
      </div>
    );
  }

  if (!series) {
    return (
      <div className="rounded-2xl bg-white/60 p-5 shadow">
        <div className="text-sm text-gray-500">Loading sentiment…</div>
      </div>
    );
  }

  const totalMentions = series.reduce((sum, point) => sum + (point.count ?? 0), 0);
  const weightedMean = totalMentions
    ? series.reduce((sum, point) => sum + (point.count ?? 0) * (point.mean ?? 0), 0) / totalMentions
    : 0;
  const mood =
    weightedMean > 0.25 ? 'optimistic' : weightedMean < -0.25 ? 'frustrated' : 'mixed';

  const latest = series[series.length - 1];
  const lastMean = latest ? latest.mean : 0;

  return (
    <div className="rounded-2xl bg-white p-5 shadow">
      <div className="text-sm text-gray-500">Sentiment (last {windowMin} minutes)</div>
      <div className="mt-2 flex items-end justify-between">
        <div>
          <div className="text-3xl font-semibold text-gray-900">{weightedMean.toFixed(2)}</div>
          <div className="text-xs uppercase tracking-wide text-gray-400">Weighted mean</div>
        </div>
        <div className="text-right">
          <div className="text-lg font-semibold text-gray-800">Mood: {mood}</div>
          <div className="text-xs text-gray-500">Latest tick: {lastMean?.toFixed?.(2) ?? '0.00'}</div>
        </div>
      </div>
      <div className="mt-3 text-xs text-gray-500">
        Mentions aggregated from `social_mentions`. Use `/api/sentiment/histogram` to inspect the raw
        timeline.
      </div>
    </div>
  );
}
