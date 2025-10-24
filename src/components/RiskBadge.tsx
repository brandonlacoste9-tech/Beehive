'use client';

type Level = 'low' | 'medium' | 'high';

const map: Record<Level, string> = {
  low: 'bg-emerald-600',
  medium: 'bg-amber-500',
  high: 'bg-rose-600',
};

export default function RiskBadge({ level, score }: { level: Level; score: number }) {
  return (
    <span className={`px-2 py-1 rounded text-white text-xs font-semibold ${map[level]}`}>
      Risk: {level} ({score})
    </span>
  );
}
