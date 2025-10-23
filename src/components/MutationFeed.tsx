export type Mutation = {
  id: string;
  created_at: string;
  actor: string;
  ritual: string;
  target?: string | null;
  status: string;
  message: string;
};

const BADGE_BASE = 'text-xs px-2 py-0.5 rounded-full border uppercase tracking-wide';

function statusBadge(status: string) {
  const normalized = status.toLowerCase();
  if (normalized === 'success') {
    return `${BADGE_BASE} bg-emerald-500/10 text-emerald-300 border-emerald-500/40`;
  }
  if (normalized === 'failure') {
    return `${BADGE_BASE} bg-rose-500/10 text-rose-300 border-rose-500/40`;
  }
  return `${BADGE_BASE} bg-slate-500/10 text-slate-200 border-slate-600/40`;
}

export default function MutationFeed({ items }: { items: Mutation[] }) {
  if (!items.length) {
    return (
      <section className="max-w-6xl mx-auto p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Live mutation feed</h2>
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 text-slate-400">
          Awaiting the first ritual echo.
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-white mb-4">Live mutation feed</h2>
      <div className="space-y-3">
        {items.map((m) => (
          <article
            key={m.id}
            className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"
          >
            <div className="space-y-1">
              <div className="text-slate-400 text-xs">
                {new Date(m.created_at).toLocaleString()}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="text-white font-semibold">{m.ritual}</div>
                <span className={statusBadge(m.status)}>
                  {m.status}
                </span>
              </div>
              <div className="text-slate-200 text-sm">{m.message}</div>
              {m.target ? (
                <div className="text-slate-400 text-xs break-all">
                  Target: {m.target}
                </div>
              ) : null}
            </div>
            <div className="text-slate-400 text-sm sm:text-right">{m.actor}</div>
          </article>
        ))}
      </div>
    </section>
  );
}
