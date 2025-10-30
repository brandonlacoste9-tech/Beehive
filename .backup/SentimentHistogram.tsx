'use client';

import { useEffect, useState } from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

type Point = { hour: string; count: number; mean: number };
type Payload = { ok: boolean; hours: number; series: Point[] };

export default function SentimentHistogram({ hours = 24 }: { hours?: number }) {
  const [data, setData] = useState<Payload | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/sentiment/histogram?hours=${hours}`, { cache: 'no-store' });
        const json = await res.json();
        if (!json.ok) throw new Error(json.error || 'hist error');
        if (!cancelled) setData(json);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message ?? 'network error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hours]);

  if (err) {
    return (
      <div className="rounded-2xl p-5 shadow bg-red-50">
        Histogram error: {err}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-2xl p-5 shadow bg-white/50">
        Loading sentiment…
      </div>
    );
  }

  const series = data.series.map((point) => ({
    ...point,
    label: new Date(point.hour).toLocaleTimeString([], { hour: 'numeric' }),
  }));

  return (
    <div className="rounded-2xl p-5 shadow bg-white">
      <div className="text-sm text-gray-500">Sentiment (last {data.hours}h)</div>
      <div className="mt-4 h-32">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={series}>
            <XAxis dataKey="label" />
            <YAxis yAxisId="left" orientation="left" />
            <YAxis yAxisId="right" orientation="right" domain={[-1, 1]} />
            <Tooltip formatter={(value: unknown) => String(value)} />
            <Bar yAxisId="left" dataKey="count" barSize={14} fill="#a855f7" />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="mean"
              dot={false}
              strokeWidth={2}
              stroke="#2563eb"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 text-xs text-gray-400">
        Bars = mention volume; Line = mean sentiment (−1 to +1).
      </div>
    </div>
  );
}
