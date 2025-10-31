"use client";
import { useEffect, useRef, useState } from "react";

export default function MetricCounter({
  label, 
  from = 0, 
  to = 100, 
  durationMs = 1400, 
  suffix = ""
}: { 
  label: string; 
  from?: number; 
  to?: number; 
  durationMs?: number; 
  suffix?: string; 
}) {
  const [val, setVal] = useState(from);
  const start = useRef<number | null>(null);

  useEffect(() => {
    let raf = 0;
    const step = (t: number) => {
      if (start.current == null) start.current = t;
      const p = Math.min(1, (t - start.current) / durationMs);
      const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
      setVal(Math.round(from + (to - from) * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [from, to, durationMs]);

  return (
    <div 
      className="rounded-2xl border p-4"
      style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--text)" }}
    >
      <div className="text-3xl font-extrabold tabular-nums">{val}{suffix}</div>
      <div className="text-sm opacity-75 mt-1">{label}</div>
    </div>
  );
}
