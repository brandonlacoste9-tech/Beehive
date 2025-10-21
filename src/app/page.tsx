import Link from "next/link";
import { CODEX_INSTANCE } from "@/lib/instance";

const functions = [
  { href: "/.netlify/functions/deploy-notify", label: "deploy-notify (POST)" },
  { href: "/.netlify/functions/ritual-agent", label: "ritual-agent (POST)" },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-amber-100">
      <section className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-16">
        <header className="space-y-2 text-center">
          <p className="text-sm uppercase tracking-[0.4em] text-amber-500">BeeHive</p>
          <h1 className="text-4xl font-semibold text-gray-900">Ritual Stack Directory</h1>
          <p className="text-sm text-gray-500">
            Instance: <span className="font-mono text-gray-700">{CODEX_INSTANCE}</span>
          </p>
        </header>

        <section className="rounded-3xl border border-amber-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Netlify Functions</h2>
          <p className="mt-1 text-sm text-gray-600">
            Each endpoint responds with observability metadata to keep the swarm in sync.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-amber-700">
            {functions.map((fn) => (
              <li key={fn.href}>
                <Link className="hover:underline" href={fn.href}>
                  {fn.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-6 rounded-lg bg-amber-50 p-4 text-xs text-amber-800">
            The ritual agent returns <span className="font-semibold">requestId</span>,
            <span className="font-semibold"> jobId</span>, and <span className="font-semibold">sizeBytes</span>
            for CodexReplay overlays. Capture these fields to stitch swarm lineage.
          </p>
        </section>
      </section>
    </main>
  );
}
