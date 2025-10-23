'use client';

import { useEffect, useState } from 'react';
import MutationFeed, { type Mutation } from './MutationFeed';
import { loadMutations } from '@/lib/loadMutations';

export default function MutationFeedClient({ pollMs = 15000 }: { pollMs?: number }) {
  const [items, setItems] = useState<Mutation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setInterval> | null = null;

    async function refresh() {
      try {
        const data = await loadMutations();
        if (!cancelled) {
          setItems(data);
          setError(null);
          setLoading(false);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
          setLoading(false);
        }
      }
    }

    refresh();
    if (pollMs > 0) {
      timer = setInterval(refresh, pollMs);
    }

    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
    };
  }, [pollMs]);

  if (error) {
    return (
      <section className="max-w-6xl mx-auto p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Live mutation feed</h2>
        <div className="rounded-xl border border-rose-900 bg-rose-950/70 p-6 text-rose-200">
          Ritual feed error: {error}
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="max-w-6xl mx-auto p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Live mutation feed</h2>
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 text-slate-400">
          Listening for lineage whispers…
        </div>
      </section>
    );
  }

  return <MutationFeed items={items} />;
}
