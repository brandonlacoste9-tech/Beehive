# BeeHive / BeeSwarm Studio — Agent Instructions (Codex & Copilot)

This repo powers the BeeSwarm Studio “BeeHive Mode”: Next.js 14 (App Router), Tailwind (Fire-UI tokens), Remotion (preview), ffmpeg (exports), OpenAI/Whisper, ElevenLabs (voice/music), Supabase (optional logs), Upstash (optional metrics), OpenTelemetry (optional traces).

## Golden Rules
- **Don’t invent files**; create only what’s requested in `TASKS.md` or user prompts.
- **SSR vs CSR**: Any Remotion `<Player>` must be dynamically imported (`ssr: false`). Audio APIs only in client components.
- **Env safety**: Never hard-code keys. Read from `.env.local`. Server routes must not leak secrets to the client.
- **Composable UI**: Reuse Fire-UI tokens and motion primitives. No inline magic colors; use `aurora.*` and `hive.*`.
- **Progress, not perfection**: Land vertical slices that run. Defer polish behind clearly named TODOs.

## Tech Baseline
- **Next.js**: App Router in `/app`. Client components use `"use client"`.  
- **Tailwind**: Tokens in `tailwind.config.ts`:
  - `aurora.gold`, `aurora.violet`, `aurora.plasma`
  - `hive.bg`, `hive.panel`, `hive.glow`
  - Keyframes: `swarm-float`, `swarm-glow`, `swarm-pulse`
- **Motion**: `src/lib/motion.ts` exports `liftProps`, `swarmSpring`, `pulseOnRender`.
- **Audio**: `src/lib/sound.ts` exports `playTone("hover"|"render"|"export"|"unlock")` with a shared `AudioContext`.
- **Ambient**: Wrap app with `FireUIProvider` (AuroraBackground + SwarmParticleTrail).

## Directory Layout (expected)
```

/app
layout.tsx
page.tsx
/api
/voice/synthesize/route.ts
/music/generate/route.ts
/assets/list/route.ts
/rituals/live/route.ts
/src
/components
FireUIProvider.tsx
AuroraBackground.tsx
SwarmParticleTrail.tsx
SwarmGate.tsx
SwarmAvatars.tsx
EchoTale.tsx
CodexReplay.tsx
CodexScrolls.tsx
SwarmHive.tsx
LayerLoom.tsx
WhisperWing.tsx
VoiceForge.tsx
/lib
motion.ts
sound.ts
openai-whisper.ts
elevenlabs-voice.ts
elevenlabs-music.ts (optional)
tailwind.config.ts

```

## Environment
Create `.env.local` (not committed):
```

OPENAI_API_KEY=...
NEXT_PUBLIC_ELEVENLABS_API_KEY=...
NEXT_PUBLIC_ELEVENLABS_VOICE_URL=/api/voice/synthesize
NEXT_PUBLIC_ELEVENLABS_MUSIC_URL=/api/music/generate

````

## Commands
- Install deps: `npm i`
- Dev: `npm run dev`
- Lint (if configured): `npm run lint`
- Build: `npm run build`
- Typecheck (if configured): `npm run typecheck`

## Frontend Conventions
- Prefer functional components; mark interactive ones `"use client"`.
- Use Tailwind tokens + minimal utility classes; keep variant logic simple.
- Accessibility: focus rings, semantic elements, ARIA where needed.
- Encapsulate animation props in `lib/motion.ts`; no ad-hoc framer configs sprinkled everywhere.

## API Conventions
- API routes return JSON only.
- Handle errors with `{ error: "slug" }` and HTTP status codes.
- Never return secret keys to the client. Server calls ElevenLabs/OpenAI.

## Remotion
- Wrap `Player` with dynamic import:
  ```ts
  const Player = dynamic(() => import("@remotion/player").then(m => m.Player), { ssr: false });
````

* Keep preview compositions small; real export is handled by the backend (ffmpeg or a render worker) later.

## Security / Privacy

* Do not log PII or keys.
* Validate inputs in API routes; return `400` on invalid payloads.

## Pull Requests (if CI present)

* Small, focused PRs tied to a `TASKS.md` entry.
* Include: what changed, why, how to test.
* No failing `build` or type checks.

## What’s “Done”

* Feature demonstrably works in `npm run dev`.
* No console errors in the browser for the happy path.
* Tokens/motion reused; styles consistent with Fire-UI.

## Gaps & TODOs (safe stubs)

* ffmpeg export worker (server/queue) — future slice.
* Supabase audit logs / Upstash metrics / OTel wiring — behind flags.
* Music generation — proxied demo until real ElevenLabs music API is available.

````
