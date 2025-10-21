import Head from 'next/head';

const steps = [
  {
    title: 'Prompt Intake',
    description:
      'Designer seeds the persona brief, tone, and hero moments. Stored via Supabase for lineage.',
  },
  {
    title: 'Script Weave',
    description:
      'Gemini + Script Weaver transform sentiment context into a narrated storyboard.',
  },
  {
    title: 'Voice Forge',
    description:
      'Voice Nectarist invokes ElevenLabs voices mapped to persona timbres.',
  },
  {
    title: 'Motion Blueprint',
    description:
      'Motion Oracle generates scene directives and camera glyphs ready for rendering.',
  },
  {
    title: 'Reel Assembly',
    description:
      'Mux ingest and Swarm Conductor combine script, voice, and motion into a playable reel.',
  },
  {
    title: 'Publish & Replay',
    description:
      'Replay Scribe logs outputs, Stripe/Coinbase webhooks confirm billing, GA4 + YouTube capture lift.',
  },
];

export default function DemoPage() {
  return (
    <>
      <Head>
        <title>Persona Demo Pipeline — BEEREEL</title>
      </Head>
      <main className="min-h-screen bg-amber-50 py-12">
        <section className="mx-auto max-w-5xl space-y-8 px-6">
          <header className="space-y-3 text-center">
            <p className="text-sm uppercase tracking-wide text-amber-700">Persona Demo</p>
            <h1 className="text-3xl font-bold text-amber-900">Prompt → Script → Voice → Video</h1>
            <p className="text-base text-amber-800">
              Follow the Flowing Honey ritual to witness how BEEREEL assembles branded reels from a single
              prompt. Each step is logged in the Codex and replayable via SwarmKit exports.
            </p>
          </header>
          <div className="grid gap-6 rounded-3xl bg-white p-8 shadow-xl">
            {steps.map((step, index) => (
              <div key={step.title} className="rounded-2xl border border-amber-100 bg-amber-50 p-6">
                <div className="flex items-center justify-between text-amber-700">
                  <span className="text-sm font-semibold">Step {index + 1}</span>
                  <span className="text-xs uppercase tracking-wide">Codex Lens</span>
                </div>
                <h2 className="mt-2 text-xl font-semibold text-amber-900">{step.title}</h2>
                <p className="mt-2 text-sm text-amber-800">{step.description}</p>
              </div>
            ))}
          </div>
          <footer className="space-y-3 rounded-3xl border border-amber-200 bg-white p-6 text-center shadow">
            <h2 className="text-xl font-semibold text-amber-900">Ready to Create?</h2>
            <p className="text-sm text-amber-700">
              Trigger the ritual from your terminal with <code>make smoke</code> then publish via <code>make zip</code>. Log outputs in `scrolls/smoke-tests-beereel.md` for replay overlays.
            </p>
          </footer>
        </section>
      </main>
    </>
  );
}
