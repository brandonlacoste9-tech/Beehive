'use client';

import { useEffect, useMemo, useState } from 'react';
import { toMood } from '@/lib/sandboxAgent';

type SentimentSample = {
  platform: string;
  text: string;
  score: number;
};

type SentimentPayload = {
  windowMin: number;
  count: number;
  avg: number;
  minTs?: string;
  maxTs?: string;
  sample?: SentimentSample[];
};

type ApiResponse = {
  ok: boolean;
  summary?: SentimentPayload;
  error?: string;
  mode?: 'live' | 'sandbox';
};

type Props = {
  windowMin?: number;
};

export default function SentimentCard({ windowMin = 180 }: Props) {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const url = `/api/sentiment/summary?windowMin=${windowMin}`;
        const res = await fetch(url, { cache: 'no-store' });
        const json: ApiResponse = await res.json();
        if (!json.ok || !json.summary) {
          throw new Error(json.error || `sentiment error (${res.status})`);
        }
        if (!cancelled) setData(json);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message ?? 'network error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [windowMin]);

  const summary = data?.summary;
  const mood = useMemo(() => {
    if (!summary) return null;
    return toMood(summary.avg);
  }, [summary]);

  if (err) {
    return (
      <div className="rounded-2xl p-5 shadow bg-red-50 text-sm text-red-700">
        Sentiment error: {err}
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="rounded-2xl p-5 shadow bg-white/50 text-sm text-gray-500">
        Loading sentiment pulse…
      </div>
    );
  }

  const samples = summary.sample ?? [];

  return (
    <div className="rounded-2xl p-5 shadow bg-white space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-gray-500">
            Sentiment (last {summary.windowMin}m)
          </div>
          <div className="mt-2 text-3xl font-semibold">
            {summary.avg.toFixed(2)}{' '}
            <span className="text-base text-gray-400">{mood ?? '—'}</span>
          </div>
          <div className="mt-1 text-sm text-gray-600">
            Mentions: {summary.count}
            {summary.minTs && summary.maxTs && (
              <span className="text-gray-400">
                {' '}
                ({new Date(summary.minTs).toLocaleTimeString([], {
                  hour: 'numeric',
                  minute: '2-digit',
                })}
                {' – '}
                {new Date(summary.maxTs).toLocaleTimeString([], {
                  hour: 'numeric',
                  minute: '2-digit',
                })})
              </span>
            )}
          </div>
        </div>
        {data?.mode === 'sandbox' && (
          <span className="rounded-full border bg-yellow-50 px-2 py-1 text-xs text-yellow-700">
            sandbox
          </span>
        )}
      </div>
      {samples.length > 0 && (
        <div className="rounded-xl border bg-gray-50 p-3 text-xs text-gray-600 space-y-2">
          <div className="font-semibold text-gray-800">Sample chatter</div>
          <ul className="space-y-1">
            {samples.slice(0, 3).map((item, idx) => (
              <li key={`${item.platform}-${idx}`} className="flex gap-2">
                <span className="font-medium text-gray-500">[{item.platform}]</span>
                <span className="flex-1">
                  {item.text}
                  <span className="ml-2 text-gray-400">({item.score.toFixed(2)})</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
