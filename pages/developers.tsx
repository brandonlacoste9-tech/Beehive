import Link from 'next/link';

import { developerEndpoints, developerHero } from '@/lib/content/pjAceContent';

const jobMetadata = [
  { label: 'jobId', value: 'swarm_93ac-pjace-im8' },
  { label: 'status', value: 'streaming' },
  { label: 'sizeBytes', value: '48239410' },
  { label: 'previewUrl', value: 'https://deploy-preview-128--adgenxai.netlify.app' },
];

export default function DevelopersPage() {
  return (
    <main className="space-y-24 bg-slate-50 pb-24 text-slate-900">
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-amber-700 py-20 text-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-amber-300">Developers</p>
          <h1 className="text-4xl font-semibold sm:text-5xl">{developerHero.title}</h1>
          <p className="text-base text-slate-200">{developerHero.description}</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href={developerHero.cta.href}
              className="inline-flex items-center justify-center rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-amber-300"
            >
              {developerHero.cta.text}
            </Link>
            <Link
              href="/templates/import?source=pj-ace-grandma"
              className="inline-flex items-center justify-center rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:border-white"
            >
              Launch Grandma quickstart
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl space-y-10 px-6">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-500">Quickstart</p>
          <h2 className="text-3xl font-semibold text-slate-900">{developerHero.quickstartTitle}</h2>
          <p className="text-sm text-slate-600">{developerHero.quickstartBody}</p>
        </header>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <pre className="overflow-auto rounded-2xl bg-slate-900 p-6 text-xs text-amber-200" aria-label="API request sample">
            <code>{developerEndpoints[0]?.sample}</code>
          </pre>
          <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
            <p className="text-xs uppercase tracking-[0.3em] text-amber-500">CodexReplay metadata</p>
            <dl className="mt-3 grid gap-2 md:grid-cols-2">
              {jobMetadata.map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-xl bg-white px-4 py-2">
                  <dt className="font-semibold text-slate-900">{item.label}</dt>
                  <dd className="text-xs text-slate-500">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl space-y-10 px-6">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-500">Endpoints</p>
          <h2 className="text-3xl font-semibold text-slate-900">Wire up PJ Ace workflows programmatically</h2>
        </header>
        <div className="space-y-4">
          {developerEndpoints.map((endpoint) => (
            <div key={`${endpoint.method} ${endpoint.path}`} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-amber-500">
                <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-700">{endpoint.method}</span>
                <span className="text-slate-600">{endpoint.path}</span>
              </div>
              <p className="mt-3 text-sm text-slate-600">{endpoint.description}</p>
              {endpoint.sample ? (
                <pre className="mt-4 overflow-auto rounded-2xl bg-slate-900 p-4 text-xs text-amber-200" aria-label="Endpoint sample">
                  <code>{endpoint.sample}</code>
                </pre>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl space-y-8 px-6">
        <header className="space-y-2 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-500">CI/CD</p>
          <h2 className="text-3xl font-semibold text-slate-900">Codex review, Netlify preview, smoke tests</h2>
        </header>
        <div className="rounded-3xl bg-white p-8 shadow-xl">
          <ol className="space-y-4 text-sm text-slate-600">
            <li className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              Commit triggers GitHub Action → enqueue Codex review via <code className="rounded bg-slate-900 px-2 py-1 text-xs text-amber-200">POST /api/codex/review</code> → badge updates in StudioShare.
            </li>
            <li className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              Deploy preview minted at <code className="rounded bg-slate-900 px-2 py-1 text-xs text-amber-200">deploy-preview-*</code> → Puppeteer smoke + Lighthouse run streamed over SSE.
            </li>
            <li className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              Operators approve high-risk steps with provenance receipts stored in Supabase for replay overlays.
            </li>
          </ol>
        </div>
      </section>
    </main>
  );
}
