import Link from 'next/link';

export type CaseStudyProps = {
  id: string;
  title: string;
  releaseDate: string;
  metrics: { views: number; shares: number; costEstimate: string };
  heroMedia: string;
  tools: string[];
  pipeline: Array<{ step: string; agent: string; snippet?: string }>;
  shots: Array<{ scene: string; prompt: string; refImages?: string[] }>;
  timeline: { days: number; phases: string[] };
  ethicalNotes?: string;
};

export function CaseStudyPage({
  title,
  releaseDate,
  metrics,
  heroMedia,
  tools,
  pipeline,
  shots,
  timeline,
  ethicalNotes,
}: CaseStudyProps) {
  return (
    <article className="mx-auto flex max-w-5xl flex-col gap-12 px-6 py-16">
      <header className="space-y-6">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Case Study</p>
        <h1 className="text-4xl font-semibold text-slate-900">{title}</h1>
        <div className="flex flex-wrap gap-3 text-sm text-slate-500">
          <span>{releaseDate}</span>
          <span aria-hidden>•</span>
          <span>{metrics.views.toLocaleString()} views</span>
          <span aria-hidden>•</span>
          <span>{metrics.shares.toLocaleString()} shares</span>
          <span aria-hidden>•</span>
          <span>Cost: {metrics.costEstimate}</span>
        </div>
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-black/80 p-6 text-white shadow-lg">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-300">Preview</p>
          <p className="mt-2 text-lg font-semibold">{heroMedia}</p>
          <p className="mt-2 text-sm text-slate-200">
            This placeholder represents the Veo 3 cinematic reel that plays on the live site. Embed video via mux player once media
            is cleared.
          </p>
        </div>
      </header>
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900">Tools & Pipeline</h2>
        <div className="rounded-3xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800">Stack</h3>
          <ul className="mt-3 flex flex-wrap gap-2 text-sm text-slate-600">
            {tools.map((tool) => (
              <li key={tool} className="rounded-full bg-slate-100 px-3 py-1 font-semibold">
                {tool}
              </li>
            ))}
          </ul>
          <ol className="mt-6 space-y-3">
            {pipeline.map((step) => (
              <li key={`${step.step}-${step.agent}`} className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{step.step}</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{step.agent}</p>
                {step.snippet ? (
                  <pre className="mt-3 overflow-auto rounded-xl bg-slate-900 p-4 text-xs text-amber-200" aria-label="Prompt snippet">
                    <code>{step.snippet}</code>
                  </pre>
                ) : null}
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900">Shotlist & Prompt Library</h2>
        <div className="space-y-4">
          {shots.map((shot) => (
            <div key={shot.scene} className="rounded-3xl border border-slate-200 p-6 shadow-sm">
              <header className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-lg font-semibold text-slate-900">{shot.scene}</h3>
                <button
                  type="button"
                  className="rounded-full border border-amber-400 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-500 transition hover:bg-amber-50"
                >
                  Copy prompt
                </button>
              </header>
              <pre className="mt-4 overflow-auto rounded-xl bg-slate-50 p-4 text-sm text-slate-700" aria-label="Prompt">
                <code>{shot.prompt}</code>
              </pre>
              {shot.refImages ? (
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                  {shot.refImages.map((img) => (
                    <span key={img} className="rounded-full bg-slate-100 px-3 py-1 font-medium">
                      {img}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </section>
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900">Production Timeline</h2>
        <div className="rounded-3xl border border-slate-200 p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Total duration: {timeline.days} days</p>
          <ul className="mt-3 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
            {timeline.phases.map((phase) => (
              <li key={phase} className="rounded-xl bg-slate-50 px-4 py-3 font-semibold">
                {phase}
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900">Ethics & Provenance</h2>
        <div className="rounded-3xl border border-amber-200 bg-amber-50/60 p-6 text-amber-900 shadow-sm">
          <p className="text-sm leading-relaxed">
            {ethicalNotes ??
              'This production followed AdGenXAI consent flows for likeness usage, voice cloning disclosures, and AI-generated labelling.'}
          </p>
          <Link href="#audit-trail" className="mt-3 inline-flex text-sm font-semibold text-amber-700 hover:text-amber-500">
            View audit trail →
          </Link>
        </div>
      </section>
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900">Replicate this Workflow</h2>
        <p className="text-sm text-slate-600">
          Launch the PJ Ace template in AdGenXAI, complete with Veo 3 shotlists, ElevenLabs voice packs, and Codex QA guardrails.
        </p>
        <Link
          href={`/templates/import?source=${encodeURIComponent(title)}`}
          className="inline-flex max-w-xs items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          Use this workflow
        </Link>
      </section>
    </article>
  );
}

export default CaseStudyPage;
