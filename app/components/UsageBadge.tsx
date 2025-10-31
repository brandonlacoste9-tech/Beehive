"use client";

import { useEffect, useState } from "react";

interface UsageStats {
  total: number;
  today: number;
  lastHour: number;
}

export default function UsageBadge() {
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const res = await fetch("/.netlify/functions/usage");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setStats(data);
        setError(false);
      } catch {
        setError(true);
      }
    };

    fetchUsage();
    const interval = setInterval(fetchUsage, 10000);
    return () => clearInterval(interval);
  }, []);

  if (error || !stats) return null;

  return (
    <div
      className="inline-flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-full text-xs font-medium text-muted-foreground"
      role="status"
      aria-live="polite"
      aria-label={`Usage: ${stats.today} requests today`}
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
      </span>
      <span>
        Usage: <strong className="text-foreground">{stats.today}</strong> today
      </span>
    </div>
  );
}
