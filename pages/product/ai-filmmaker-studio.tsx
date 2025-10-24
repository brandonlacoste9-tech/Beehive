import Link from 'next/link';

import { analyticsHighlights, featureHighlights, legalFeatures, templateGallery } from '@/lib/content/pjAceContent';

const roster = [
  { name: 'Ideation Agent', description: 'Drops trend-aware concepts seeded with PJ Ace prompt packs.' },
  { name: 'Script Agent', description: 'Drafts scripts with meme beats and platform-native pacing.' },
  { name: 'Shotlist Agent', description: 'Translates script into Veo 3-ready sequences and Omni references.' },
  { name: 'Reference Manager', description: 'Stores Midjourney Omni Reference packs and continuity notes.' },
  { name: 'Director Agent', description: 'Runs Veo 3, orchestrates ElevenLabs vocals, syncs final edit cues.' },
  { name: 'Post-Production Agent', description: 'Stages Netlify previews, runs Lighthouse and Puppeteer tests.' },
];

const omniIntegrations = [
  {
    title: 'Omni Reference Upload',
    detail: 'Drag and drop character look books, capture omniRef IDs, and keep styles consistent across shots.',
  },
  {
    title: 'Veo 3 Shotlist Sync',
    detail: 'Send structured shotlists to Veo 3 with camera moves, lighting notes, and voice cues.',
  },
  {
    title: 'ElevenLabs Voice Chain',
    detail: 'Request voice clones with consent receipts, monitor audio status, and drop into timeline automatically.',
  },
  {
    title: 'Preview + QA Harness',
    detail: 'Spin deploy previews, auto-run Puppeteer smoke, gather Codex QA notes directly in your swarm.',
  },
];

export default function AiFilmmakerStudioPage() {
  return (
    <main className="space-y-24 bg-slate-50 pb-24 text-slate-900">
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-amber-700 py-20 text-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-amber-300">Product</p>
          <h1 className="text-4xl font-semibold sm:text-5xl">AI Filmmaker Studio</h1>
          <p className="text-base text-slate-200">
            Build PJ Ace-grade ad campaigns, meme drops, and long-form pilots with agent-first tooling, Veo 3 orchestration, and
            Codex QA guardrails.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/templates/import?source=pj-ace-viral-ad"
              className="inline-flex items-center justify-center rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-amber-300"
            >
              Launch PJ Ace workflow
            </Link>
            <Link
              href="/developers"
              className="inline-flex items-center justify-center rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:border-white"
            >
              View API reference
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-8 px-6">
        <header className="space-y-2 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-500">Why AdGenXAI</p>
          <h2 className="text-3xl font-semibold text-slate-900">PJ Ace&apos;s production line in a box</h2>
          <p className="text-sm text-slate-600">
            These features compress months of creative iteration into a few days, pairing agent-first orchestration with ethics-first
            guardrails.
          </p>
        </header>
        <div className="grid gap-6 md:grid-cols-3">
          {featureHighlights.map((feature) => (
            <div key={feature.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-lg font-semibold text-slate-900">{feature.title}</p>
              <p className="mt-3 text-sm text-slate-600">{feature.description}</p>
              {feature.stat ? <p className="mt-4 text-xs uppercase tracking-[0.2em] text-amber-500">{feature.stat}</p> : null}
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-10 px-6">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-500">Agent Swarm Studio</p>
          <h2 className="text-3xl font-semibold text-slate-900">Roster tuned for AI filmmaking</h2>
          <p className="text-base text-slate-600">Use the same roster PJ Ace runs to take a prompt from spark to shipped.</p>
        </header>
        <div className="grid gap-6 md:grid-cols-2">
          {roster.map((agent) => (
            <div key={agent.name} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-500">{agent.name}</p>
              <p className="mt-3 text-sm text-slate-600">{agent.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto flex max-w-6xl flex-col gap-12 px-6">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-500">Pipeline</p>
          <h2 className="text-3xl font-semibold text-slate-900">Integrations ready out of the box</h2>
          <p className="text-base text-slate-600">Blend Veo 3, Midjourney Omni Reference, and ElevenLabs without leaving the swarm.</p>
        </header>
        <div className="grid gap-6 md:grid-cols-2">
          {omniIntegrations.map((item) => (
            <div key={item.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-lg font-semibold text-slate-900">{item.title}</p>
              <p className="mt-2 text-sm text-slate-600">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-10 px-6">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-500">Viral templates</p>
          <h2 className="text-3xl font-semibold text-slate-900">Start from PJ Ace playbooks</h2>
        </header>
        <div className="grid gap-6 md:grid-cols-3">
          {templateGallery.map((template) => (
            <div key={template.name} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <span className="text-3xl" aria-hidden>
                {template.icon}
              </span>
              <p className="mt-4 text-lg font-semibold text-slate-900">{template.name}</p>
              <p className="mt-2 text-sm text-slate-600">{template.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-10 px-6">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-500">QA & Compliance</p>
          <h2 className="text-3xl font-semibold text-slate-900">Codex-reviewed before every launch</h2>
        </header>
        <div className="rounded-3xl bg-white p-8 shadow-xl">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Every variant runs through Codex QA, Lighthouse, and Puppeteer before it leaves staging. Approvers receive structured
                diffs, ethics flags, and provenance receipts to keep campaigns safe and fast.
              </p>
              <ul className="space-y-3">
                {legalFeatures.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                    <span className="mt-1 inline-block h-2 w-2 rounded-full bg-amber-400" aria-hidden />
                    <p>{feature}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-500">Analytics Hooks</p>
              <ul className="space-y-3">
                {analyticsHighlights.slice(0, 3).map((metric) => (
                  <li key={metric.title} className="rounded-2xl bg-white p-4 shadow-sm">
                    <p className="text-sm font-semibold text-slate-900">{metric.title}</p>
                    <p className="mt-2 text-xs text-slate-600">{metric.detail}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-8 px-6">
        <header className="space-y-2 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-500">Ready when you are</p>
          <h2 className="text-3xl font-semibold text-slate-900">Spin up a PJ Ace workflow in four clicks</h2>
          <p className="text-sm text-slate-600">
            Create campaign → Upload Omni references → Pick voice + distribution → Start swarm and watch variants stream in via SSE.
          </p>
        </header>
        <div className="flex justify-center">
          <Link
            href="/templates/import?source=pj-ace-viral-ad"
            className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Start now
          </Link>
        </div>
      </section>
    </main>
  );
}
