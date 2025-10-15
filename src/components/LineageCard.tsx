'use client';

import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

type SeriesPoint = { day: string; montages: number; sessions: number };

type Payload = {
  ok: boolean;
  kFactor: number | null;
  totals: { montages: number; sessions: number };
  latest: { montages: number; sessions: number; delta: number };
  series: SeriesPoint[];
  windowDays: number;
};

export default function LineageCard() {
  const [data, setData] = useState<Payload | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/lineage/metrics', { cache: 'no-store' });
        const json = await res.json();
        if (!json.ok) throw new Error(json.error || 'metrics error');
        if (!cancelled) setData(json);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message ?? 'network error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (err) {
    return (
      <div className="rounded-2xl p-5 shadow bg-red-50">
        Lineage error: {err}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-2xl p-5 shadow bg-white/50">
        Loading lineage…
      </div>
    );
  }

  const kText = data.kFactor === null ? '—' : data.kFactor.toFixed(2);
  const trend = data.latest.delta > 0 ? '▲' : data.latest.delta < 0 ? '▼' : '•';

  return (
    <div className="rounded-2xl p-5 shadow bg-white">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-gray-500">
            K-factor (last {data.windowDays}d)
          </div>
          <div className="text-3xl font-semibold mt-1">
            {kText}{' '}
            <span className="text-base text-gray-400">
              {trend}
            </span>
          </div>
          <div className="mt-2 text-gray-600 text-sm">
            Montages: {data.totals.montages} • Sessions: {data.totals.sessions}
          </div>
        </div>
      </div>
      <div className="mt-4 h-28">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data.series}>
            <XAxis dataKey="day" hide />
            <YAxis hide />
            <Tooltip
              formatter={(value: unknown) => String(value)}
              labelFormatter={(label) => `Day ${label}`}
            />
            <Line
              type="monotone"
              dataKey="montages"
              dot={false}
              strokeWidth={2}
              stroke="#6366f1"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 text-xs text-gray-400">
        Heuristic: explicit <code>referrals</code> table if present; otherwise
        montage growth ratio.
      </div>
    </div>
  );
}
