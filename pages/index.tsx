import Link from 'next/link';

import {
  analyticsHighlights,
  deliverables,
  featureHighlights,
  heroCopy,
  legalCta,
  legalFeatures,
  pjAceProfile,
  rolloutPlan,
  templateGallery,
} from '@/lib/content/pjAceContent';

export default function Home() {
  return (
    <main className="space-y-24 bg-slate-50 pb-24 text-slate-900">
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-amber-700 text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-24">
          <div className="space-y-8">
            <p className="text-xs uppercase tracking-[0.4em] text-amber-300">AI Filmmaker Studio</p>
            <h1 className="text-5xl font-semibold sm:text-6xl">{heroCopy.headline}</h1>
            <p className="max-w-3xl text-lg text-slate-200">{heroCopy.subhead}</p>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">{heroCopy.statLine}</p>
            <div className="flex flex-wrap gap-4">
              <Link
                href={heroCopy.ctaPrimary.href}
                className="inline-flex items-center justify-center rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-amber-300"
              >
                {heroCopy.ctaPrimary.text}
              </Link>
              <Link
                href={heroCopy.ctaSecondary.href}
                className="inline-flex items-center justify-center rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:border-white"
              >
                {heroCopy.ctaSecondary.text}
              </Link>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {featureHighlights.map((feature) => (
              <div key={feature.title} className="rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur">
                <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                <p className="mt-3 text-sm text-slate-200">{feature.description}</p>
                {feature.stat ? <p className="mt-4 text-xs uppercase tracking-[0.2em] text-amber-200">{feature.stat}</p> : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto flex max-w-6xl flex-col gap-16 px-6">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.4em] text-amber-500">Creator Showcase</p>
          <h2 className="text-4xl font-semibold text-slate-900">PJ Ace: Flagship AdGenXAI Filmmaker</h2>
          <p className="max-w-3xl text-base text-slate-600">
            PJ Ace shows the full stack — prompt templates, Veo 3 shotlists, ElevenLabs voice packs, and Codex QA sign-off. Study his
            workflow, import the template, and launch a swarm in four clicks.
          </p>
        </header>
        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-6 rounded-3xl bg-white p-8 shadow-xl">
            <h3 className="text-2xl font-semibold">Case studies</h3>
            <ul className="space-y-4">
              {pjAceProfile.projects.map((project) => (
                <li key={project.id} className="flex flex-col gap-1 border-l-4 border-amber-300 pl-4">
                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <span>{project.date}</span>
                    <span>{project.views}</span>
                  </div>
                  <Link href={`/case-studies/${project.id}`} className="text-lg font-semibold text-slate-900 hover:text-amber-500">
                    {project.title}
                  </Link>
                  <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                    {project.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-slate-100 px-2 py-1 font-semibold uppercase tracking-wide">
                        {tag}
                      </span>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
            <Link
              href={pjAceProfile.ctaPrimary.href}
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              {pjAceProfile.ctaPrimary.text}
            </Link>
          </div>
          <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h3 className="text-2xl font-semibold text-slate-900">Template gallery</h3>
            <ul className="space-y-4">
              {templateGallery.map((template) => (
                <li key={template.name} className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                  <span className="text-2xl" aria-hidden>
                    {template.icon}
                  </span>
                  <div>
                    <p className="text-lg font-semibold text-slate-900">{template.name}</p>
                    <p className="text-sm text-slate-600">{template.description}</p>
                  </div>
                </li>
              ))}
            </ul>
            <Link href="/creators/pj-ace" className="text-sm font-semibold text-slate-900 hover:text-amber-500">
              View PJ Ace profile →
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6">
        <div className="grid gap-10 rounded-3xl bg-white p-10 shadow-xl lg:grid-cols-2">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.4em] text-amber-500">Compliance & Ethics</p>
            <h2 className="text-3xl font-semibold text-slate-900">Keep likeness, voice, and provenance in-bounds</h2>
            <p className="text-sm text-slate-600">
              PJ Ace workflows rely on trusted approvals. AdGenXAI ships with consent capture, AI labels, and audit logs so you can move
              fast without crossing lines.
            </p>
            <Link
              href={legalCta.cta.href}
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              {legalCta.cta.text}
            </Link>
          </div>
          <ul className="space-y-3">
            {legalFeatures.map((item) => (
              <li key={item} className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-amber-400" aria-hidden />
                <p>{item}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto flex max-w-6xl flex-col gap-12 px-6">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.4em] text-amber-500">Analytics tuned for viral ops</p>
          <h2 className="text-3xl font-semibold text-slate-900">Measure PJ Ace-style momentum</h2>
        </header>
        <div className="grid gap-6 md:grid-cols-2">
          {analyticsHighlights.map((item) => (
            <div key={item.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-500">{item.title}</p>
              <p className="mt-3 text-base text-slate-600">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto flex max-w-6xl flex-col gap-8 px-6">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.4em] text-amber-500">Rollout</p>
          <h2 className="text-3xl font-semibold text-slate-900">Ship the AdGenXAI filmmaker experience</h2>
        </header>
        <ol className="space-y-3">
          {rolloutPlan.map((item) => (
            <li key={item} className="rounded-3xl border border-slate-200 bg-white p-5 text-sm text-slate-700 shadow-sm">
              {item}
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto flex max-w-6xl flex-col gap-8 px-6">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.4em] text-amber-500">Next Artifacts</p>
          <h2 className="text-3xl font-semibold text-slate-900">Pick the next deliverable</h2>
        </header>
        <div className="grid gap-6 md:grid-cols-3">
          {deliverables.map((item) => (
            <div key={item.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-lg font-semibold text-slate-900">{item.title}</p>
              <p className="mt-3 text-sm text-slate-600">{item.detail}</p>
              <Link href="/studio-share" className="mt-4 inline-flex text-sm font-semibold text-slate-900 hover:text-amber-500">
                Request artifact →
              </Link>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
