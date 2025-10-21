'use client';

import { useEffect, useMemo, useState } from 'react';

type MentionSample = { platform: string; text: string; score: number };

type SentimentSummary = {
  windowMin: number;
  count: number;
  avg: number;
  minTs?: string;
  maxTs?: string;
  sample?: MentionSample[];
};

type Payload = {
  ok: boolean;
  summary?: SentimentSummary;
  error?: string;
};

function toMoodLabel(avg: number) {
  if (avg > 0.25) return 'Optimistic / Positive';
  if (avg < -0.25) return 'Frustrated / Negative';
  return 'Mixed / Neutral';
}

function formatScore(avg: number) {
  const rounded = Math.round(avg * 100) / 100;
  return rounded.toFixed(2);
}

export default function SentimentCard({ windowMin = 180 }: { windowMin?: number }) {
  const [data, setData] = useState<SentimentSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/sentiment/summary?windowMin=${windowMin}`, {
          cache: 'no-store',
        });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const json: Payload = await res.json();
        if (!json.ok || !json.summary) {
          throw new Error(json.error || 'Unable to load sentiment');
        }
        if (!ignore) {
          setData(json.summary);
          setError(null);
        }
      } catch (err: any) {
        if (!ignore) {
          setError(err?.message ?? 'Unexpected error');
          setData(null);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, [windowMin]);

  const mood = useMemo(() => (data ? toMoodLabel(data.avg) : ''), [data]);
  const excerpts = data?.sample ?? [];

  if (loading) {
    return (
      <div className="rounded-2xl bg-white/60 p-5 shadow">
        <div className="text-sm text-gray-500">Sentiment summary</div>
        <div className="mt-6 h-16 animate-pulse rounded-lg bg-gray-100" />
        <div className="mt-4 h-20 animate-pulse rounded-lg bg-gray-100" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-red-50 p-5 shadow">
        <div className="text-sm font-medium text-red-700">Sentiment summary</div>
        <div className="mt-2 text-sm text-red-600">{error}</div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="flex h-full flex-col rounded-2xl bg-white p-5 shadow">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-gray-500">Sentiment summary · last {data.windowMin}m</div>
          <div className="mt-2 text-2xl font-semibold text-gray-900">{mood}</div>
        </div>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-4 text-sm text-gray-600 md:grid-cols-4">
        <div className="rounded-lg bg-slate-50 p-3">
          <dt className="text-xs uppercase tracking-wide text-slate-500">Mentions</dt>
          <dd className="mt-1 text-xl font-semibold text-slate-900">{data.count}</dd>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <dt className="text-xs uppercase tracking-wide text-slate-500">Mean score</dt>
          <dd className="mt-1 text-xl font-semibold text-slate-900">{formatScore(data.avg)}</dd>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <dt className="text-xs uppercase tracking-wide text-slate-500">Mood</dt>
          <dd className="mt-1 text-xl font-semibold text-slate-900">{mood}</dd>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <dt className="text-xs uppercase tracking-wide text-slate-500">Latest mention</dt>
          <dd className="mt-1 text-base text-slate-900">
            {data.maxTs ? new Date(data.maxTs).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '—'}
          </dd>
        </div>
      </dl>

      <div className="mt-6">
        <div className="text-xs uppercase tracking-wide text-gray-400">Recent excerpts</div>
        <ul className="mt-3 space-y-3">
          {excerpts.length === 0 && (
            <li className="rounded-xl bg-slate-50 p-3 text-sm text-gray-500">No recent mentions in this window.</li>
          )}
          {excerpts.map((item, idx) => (
            <li key={`${item.platform}-${idx}`} className="rounded-xl bg-slate-50 p-3">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="font-medium text-slate-600">{item.platform}</span>
                <span className="font-mono text-slate-500">{item.score.toFixed(2)}</span>
              </div>
              <p className="mt-2 text-sm text-slate-900">{item.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
