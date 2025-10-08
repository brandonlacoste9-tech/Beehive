import Head from "next/head";
import Link from "next/link";

export default function Home() {
  const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://adgenxai.com";
  return (
    <>
      <Head>
        <title>AdgenXAI — Creative intelligence for ads & video</title>
        <meta
          name="description"
          content="Make, version, and ship ads & videos to TikTok, Instagram, and YouTube—instantly."
        />
        <meta property="og:title" content="AdgenXAI" />
        <meta property="og:description" content="Creative intelligence for ads & video." />
        <meta property="og:image" content={`${SITE}/adgenx-hero.png`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={`${SITE}/adgenx-hero.png`} />
      </Head>

      <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,rgba(0,0,0,0.03),transparent_60%)]">
        {/* Hero */}
        <section className="px-6 py-20 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold">
            Creative intelligence for ads & video
          </h1>
          <p className="mt-4 text-lg text-neutral-600">
            Generate, version, and ship to TikTok • Instagram • YouTube — in minutes.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/pricing"
              className="rounded-lg bg-black text-white px-6 py-3 font-semibold hover:bg-neutral-800"
            >
              Get started
            </Link>
            <a
              href="#demo"
              className="rounded-lg border px-6 py-3 font-semibold hover:bg-neutral-50"
            >
              Watch demo
            </a>
          </div>
        </section>

        {/* Value tiles */}
        <section className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 pb-12 md:grid-cols-3">
          {[
            ["⚡ Generate instantly", "On-brand ads & videos with variants per channel."],
            ["🧩 Extensions", "Plug in feeds, brand kits, data, and analytics."],
            ["🚀 Ship everywhere", "One flow to export to TikTok, IG, YouTube, Ads Manager."],
          ].map(([title, sub]) => (
            <div key={title} className="rounded-2xl border p-6">
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-neutral-600">{sub}</p>
            </div>
          ))}
        </section>

        {/* BeeHive agents */}
        <section className="mx-auto max-w-6xl px-6 py-12">
          <h2 className="text-2xl font-bold">Meet the BeeHive</h2>
          <ul className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-4">
            {[
              ["Copy Bee", "Headlines, hooks, captions in any tone/language."],
              ["Visual Bee", "Layouts, formats, brand-safe visuals."],
              ["Video Bee", "Cuts, subtitles, aspect ratios, shorts/reels."],
              ["Compliance Bee", "Policy guardrails & disclosures."],
            ].map(([k, v]) => (
              <li key={k} className="rounded-xl border p-4">
                <b>{k}</b>
                <div className="text-neutral-600">{v}</div>
              </li>
            ))}
          </ul>
        </section>

        {/* Demo */}
        <section id="demo" className="mx-auto max-w-5xl px-6 py-12">
          <div className="aspect-video overflow-hidden rounded-2xl border">
            <iframe
              className="h-full w-full"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              title="AdgenXAI Demo"
              allowFullScreen
            />
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 py-16 text-center">
          <h2 className="text-2xl font-bold">Ready to ship your next campaign?</h2>
          <Link
            href="/pricing"
            className="mt-6 inline-block rounded-lg bg-black px-6 py-3 font-semibold text-white hover:bg-neutral-800"
          >
            View pricing
          </Link>
          <p className="mt-3 text-sm text-neutral-600">
            Or <a className="underline" href="/build">listen to the podcast</a> for product updates.
          </p>
        </section>
      </main>
    </>
  );
}