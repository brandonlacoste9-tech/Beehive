// app/components/CryptoFeed.tsx
"use client";
import { useEffect, useState } from "react";

type Prices = Record<string, { usd: number; usd_24h_change: number }>;

export default function CryptoFeed() {
  const [prices, setPrices] = useState<Prices>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let timer: any;
    const tick = async () => {
      try {
        const res = await fetch("/api/crypto-feed");
        const j = await res.json();
        setPrices(j);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
        timer = setTimeout(tick, 60_000);
      }
    };
    tick();
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <div className="text-sm text-black/60">Loading market data…</div>;

  return (
    <div className="mt-2 flex flex-wrap gap-3 text-sm">
      {Object.entries(prices).map(([name, val]) => {
        const color = val.usd_24h_change >= 0 ? "text-green-600" : "text-red-600";
        return (
          <div key={name} className="flex items-center gap-1 rounded-full border px-3 py-1"
            style={{ background:"var(--card)", borderColor:"var(--border)" }}>
            <span className="capitalize">{name}</span>
            <span className="font-mono">${val.usd.toFixed(2)}</span>
            <span className={color}>
              {val.usd_24h_change >= 0 ? "▲" : "▼"} {Math.abs(val.usd_24h_change).toFixed(2)}%
            </span>
          </div>
        );
      })}
    </div>
  );
}
