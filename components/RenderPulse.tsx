"use client";

import { useMemo, useState } from "react";

type RitualStage = {
  id: string;
  title: string;
  description: string;
  completedAt?: string;
};

const baseStages: RitualStage[] = [
  {
    id: "ingest",
    title: "Signal Ingested",
    description: "Studio inputs are parsed and normalized for the swarm.",
  },
  {
    id: "render",
    title: "Render Ritual",
    description: "Voice + visual synthesis threads align and render the request.",
  },
  {
    id: "verify",
    title: "Guardian Check",
    description: "Safety, compliance, and human-in-the-loop gates approve the pulse.",
  },
  {
    id: "ship",
    title: "Beacon Broadcast",
    description: "Final assets are dispatched to collaborators and storage.",
  },
];

function formatTimeStamp(value: string | undefined) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function createStageState(): RitualStage[] {
  return baseStages.map((stage) => ({ ...stage }));
}

export default function RenderPulse() {
  const [stages, setStages] = useState<RitualStage[]>(() => createStageState());

  const completedCount = useMemo(
    () => stages.filter((stage) => stage.completedAt).length,
    [stages],
  );

  const progress = Math.round((completedCount / stages.length) * 100);

  const nextStageIndex = useMemo(
    () => stages.findIndex((stage) => !stage.completedAt),
    [stages],
  );

  const nextStage = nextStageIndex === -1 ? undefined : stages[nextStageIndex];

  const lastPulse = useMemo(() => {
    const finished = stages
      .filter((stage) => stage.completedAt)
      .sort((a, b) =>
        (a.completedAt ?? "").localeCompare(b.completedAt ?? ""),
      );
    return finished.at(-1);
  }, [stages]);

  const emitPulse = () => {
    setStages((current) => {
      const index = current.findIndex((stage) => !stage.completedAt);
      if (index === -1) {
        return current;
      }

      const updated = current.map((stage, stageIndex) =>
        stageIndex === index
          ? { ...stage, completedAt: new Date().toISOString() }
          : stage,
      );

      return updated;
    });
  };

  const resetRitual = () => {
    setStages(createStageState());
  };

  return (
    <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 p-8 text-white shadow-xl">
      <header className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-indigo-300">Render Pulse</p>
          <h2 className="text-3xl font-semibold tracking-tight">Heartbeat Monitor</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative flex h-12 w-12 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500/40" />
            <span className="relative inline-flex h-8 w-8 rounded-full bg-emerald-400" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Progress</p>
            <p className="text-xl font-semibold">{progress}%</p>
          </div>
        </div>
      </header>

      <div className="mb-6 overflow-hidden rounded-2xl bg-gray-950/60">
        <div className="flex h-2 w-full overflow-hidden rounded-full bg-gray-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 px-4 pb-4">
          <p className="text-sm text-gray-300">
            {nextStage
              ? `Awaiting ${nextStage.title}.` : "All rituals sealed. The swarm hums in sync."}
          </p>
          {lastPulse?.completedAt ? (
            <p className="text-xs font-medium text-indigo-300">
              Last pulse: {formatTimeStamp(lastPulse.completedAt)} · {lastPulse.title}
            </p>
          ) : (
            <p className="text-xs font-medium text-gray-500">
              No pulses emitted yet.
            </p>
          )}
        </div>
      </div>

      <ul className="space-y-4">
        {stages.map((stage, index) => {
          const isCompleted = Boolean(stage.completedAt);
          const isActive = index === nextStageIndex;
          return (
            <li
              key={stage.id}
              className="flex items-start gap-4 rounded-2xl border border-white/5 bg-white/5 p-4 backdrop-blur"
            >
              <div className="relative mt-1 flex h-10 w-10 items-center justify-center">
                <span
                  className={`absolute inline-flex h-10 w-10 rounded-full border ${
                    isCompleted
                      ? "border-emerald-400/50"
                      : isActive
                        ? "border-indigo-400/40"
                        : "border-gray-600"
                  }`}
                />
                <span
                  className={`relative inline-flex h-3 w-3 rounded-full ${
                    isCompleted
                      ? "bg-emerald-400"
                      : isActive
                        ? "bg-indigo-400"
                        : "bg-gray-600"
                  }`}
                />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <p className="text-lg font-semibold text-white">{stage.title}</p>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      isCompleted
                        ? "bg-emerald-500/20 text-emerald-200"
                        : isActive
                          ? "bg-indigo-500/20 text-indigo-200"
                          : "bg-gray-700 text-gray-300"
                    }`}
                  >
                    {isCompleted ? "Complete" : isActive ? "In motion" : "Queued"}
                  </span>
                  {isCompleted && (
                    <span className="text-xs text-gray-400">
                      {formatTimeStamp(stage.completedAt)}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-gray-300">
                  {stage.description}
                </p>
              </div>
            </li>
          );
        })}
      </ul>

      <footer className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-gray-400">
          {completedCount === stages.length ? (
            <span>The swarm recorded every pulse. Ritual complete.</span>
          ) : (
            <span>
              {stages.length - completedCount} pulse
              {stages.length - completedCount === 1 ? "" : "s"} remain.
            </span>
          )}
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={emitPulse}
            className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-gray-600"
            disabled={nextStageIndex === -1}
          >
            Emit next pulse
          </button>
          <button
            type="button"
            onClick={resetRitual}
            className="rounded-full border border-white/20 px-5 py-2 text-sm font-semibold text-gray-200 transition hover:border-white/40 hover:text-white"
          >
            Reset ritual
          </button>
        </div>
      </footer>
    </section>
  );
}
