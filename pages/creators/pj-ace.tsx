import CreatorProfile from '@/components/marketing/CreatorProfile';
import Link from 'next/link';

import { heroCopy, pjAceProfile } from '@/lib/content/pjAceContent';

export default function PjAceCreatorPage() {
  return (
    <main className="space-y-20 bg-slate-50 pb-20">
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-amber-700 py-16 text-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-amber-300">Creator Showcase</p>
          <h1 className="text-4xl font-semibold sm:text-5xl">PJ Ace — AI Filmmaker & Viral Visionary</h1>
          <p className="text-base text-slate-200">
            {heroCopy.subhead}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href={heroCopy.ctaPrimary.href}
              className="inline-flex items-center justify-center rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-amber-300"
            >
              {heroCopy.ctaPrimary.text}
            </Link>
            <Link
              href="/case-studies/im8-ad"
              className="inline-flex items-center justify-center rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:border-white"
            >
              Explore IM8 case study
            </Link>
          </div>
        </div>
      </section>
      <CreatorProfile {...pjAceProfile} />
      <section className="mx-auto max-w-4xl space-y-6 rounded-3xl bg-white px-6 py-12 text-slate-700 shadow-xl">
        <p className="text-xs uppercase tracking-[0.4em] text-amber-500">About PJ Ace</p>
        <p className="text-lg leading-relaxed text-slate-700">
          PJ Ace (PJ Accetturo) is a viral AI filmmaker who reimagines cinematic storytelling with generative AI. From meme-driven
          ad campaigns to full 25-minute AI TV episodes, PJ combines cinematic craft with aggressive prompt engineering to generate
          viral, platform-native content in days. His portfolio spans Veo 3, Midjourney Omni Reference, ElevenLabs voice cloning, and
          Codex QA, proving how small teams can out-execute legacy studios with speed, humor, and platform-native design.
        </p>
      </section>
    </main>
  );
}
