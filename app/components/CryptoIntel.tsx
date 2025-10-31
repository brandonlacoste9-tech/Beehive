// app/components/CryptoIntel.tsx
"use client";
import { useEffect, useState, useRef } from "react";
import Sparkline from "./Sparkline";

type Intel = {
  timestamp: string;
  prices: Record<string, { usd: number; usd_24h_change: number }>;
  topNews?: { title: string; url: string; votes?: any }[];
  sentiment?: string;
};

type HistoryResponse = {
  timestamp: string;
  ids: string[];
  points: number;
  results: Record<string, { samples: { t: number; p: number }[] }>;
};

export default function CryptoIntel() {
  const [intel, setIntel] = useState<Intel | null>(null);
  const [history, setHistory] = useState<Record<string, number[]>>({});
  const ids = ["bitcoin", "ethereum", "solana"];
  const points = 60;
  const pollRef = useRef<number | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const [sRes, hRes] = await Promise.all([
          fetch("/api/crypto-intel").then((r) => r.json()),
          fetch(`/api/crypto-intel/history?ids=${ids.join(",")}&points=${points}`).then((r) =>
            r.json()
          ),
        ]);

        if (!mounted) return;

        setIntel(sRes as Intel);

        const h = (hRes as HistoryResponse).results ?? {};
        const mapped: Record<string, number[]> = {};
        ids.forEach((id) => {
          const samples = h[id]?.samples ?? [];
          mapped[id] = samples.map((s) => Number(s.p));
        });
        setHistory(mapped);
      } catch (e) {
        console.error("crypto intel load error:", e);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const interval = 10_000;
    const tick = async () => {
      try {
        const sRes = await fetch("/api/crypto-intel").then((r) => r.json());
        setIntel(sRes);

        setHistory((prev) => {
          const next = { ...prev };
          Object.entries(sRes.prices ?? {}).forEach(([k, v]: any) => {
            const price = Number(v.usd ?? v);
            const arr = (next[k] ?? []).slice();
            arr.push(price);
            while (arr.length > points) arr.shift();
            next[k] = arr;
          });
          return next;
        });
      } catch (e) {
        console.error("poll error:", e);
      }
    };

    tick();
    pollRef.current = window.setInterval(tick, interval);
    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
    };
  }, []);

  if (!intel) return <p className="text-sm text-black/60">Loading crypto intel…</p>;

  const priceCards = Object.entries(intel.prices).map(([name, val]: any) => {
    const change = Number(val.usd_24h_change ?? 0);
    const price = Number(val.usd ?? 0);
    const color = change >= 0 ? "text-green-600" : "text-red-600";
    const sparkValues = history[name] ?? [];

    const intensity = Math.min(1, Math.abs(change) / 6);
    const hue = change >= 0 ? 150 : 10;

    return (
      <div
        key={name}
        className="relative rounded-xl border px-4 py-3 overflow-hidden"
        style={{
          background: "var(--card)",
          borderColor: "var(--border)",
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 rounded-xl aurora"
          style={
            {
              ["--aurora-intensity" as any]: intensity,
              ["--aurora-hue" as any]: hue,
              ["--aurora-speed" as any]: `${1.8 - Math.min(1.4, Math.abs(change) / 8)}s`,
            } as React.CSSProperties
          }
        />

        <div className="flex items-center justify-between">
          <div>
            <b className="capitalize">{name}</b>
            <div className="text-xs text-black/60">
              Updated {new Date(intel.timestamp).toLocaleTimeString()}
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm font-medium">${price.toFixed(2)}</div>
            <div className={`text-xs ${color}`}>
              {change >= 0 ? "▲" : "▼"} {Math.abs(change).toFixed(2)}%
            </div>
          </div>
        </div>

        <div className="mt-3">
          {sparkValues.length >= 2 ? (
            <Sparkline
              values={sparkValues}
              width={260}
              height={56}
              stroke={change >= 0 ? "#059669" : "#ef4444"}
              fill={change >= 0 ? "rgba(5,150,105,0.12)" : "rgba(239,68,68,0.10)"}
            />
          ) : (
            <div className="text-xs text-black/50">No sparkline yet</div>
          )}
        </div>
      </div>
    );
  });

  return (
    <section className="mt-6 space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">{priceCards}</div>

      <div>
        <h2 className="text-lg font-bold mt-4">Trending Headlines</h2>
        <ul className="mt-2 list-disc pl-6 space-y-1 text-sm">
          {intel.topNews?.slice(0, 5).map((n) => (
            <li key={n.url}>
              <a href={n.url} target="_blank" rel="noreferrer" className="hover:underline">
                {n.title}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {intel.sentiment && (
        <p className="text-sm italic mt-4 text-black/70">Market Sentiment: {intel.sentiment}</p>
      )}
    </section>
  );
}
