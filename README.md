# BeeHive / BeeSwarm Studio

Sovereign, living UI: Next.js 14 (App Router) + Tailwind (Fire-UI) + Remotion (preview only) + OpenAI Whisper (STT) + ElevenLabs (TTS/music proxy). Optional observability (Supabase/Upstash/OTel) is stubbed.

## Prereqs
- Node 18+
- npm or pnpm
- `.env.local` with keys (see below)

## Setup
```bash
npm i
cp .env.example .env.local # or create manually
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you should see **SwarmGate**.

## Env (.env.local)

```
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_ELEVENLABS_API_KEY=...
NEXT_PUBLIC_ELEVENLABS_VOICE_URL=/api/voice/synthesize
NEXT_PUBLIC_ELEVENLABS_MUSIC_URL=/api/music/generate
```

> Keys must **not** be hardcoded in client code. Server routes proxy external services.

## Commands

* `npm run dev` — local server
* `npm run build` — Next build (Remotion previews must be CSR via dynamic import)
* `npm run start` — production start
* `npm run lint` — optional
* `npm run typecheck` — optional

## Structure

```
app/                      # App Router
  api/
    voice/synthesize/
    music/generate/
    assets/list/
    rituals/live/
    export/               # (stub – see below)
src/
  components/             # Fire-UI components
  lib/                    # motion, sound, api helpers
tailwind.config.ts        # Fire-UI tokens, keyframes
TASKS.md                  # agent-friendly backlog
.github/copilot-instructions.md
```

## Development Flow (Agents & Humans)

1. Pick a task in `TASKS.md`.
2. Implement **only** files listed in the task’s scope.
3. Verify with `npm run dev` (no console errors).
4. Update `TASKS.md` (mark done + notes).
5. Commit using conventional style, open PR.

## Known Stubs

* ffmpeg export worker (server/queue) — **stubbed** via `/api/export`.
* Observability (Supabase/Upstash/OTel) — **no-ops** behind `src/lib/telemetry.ts`.
* Music generation — demo URLs until real endpoint is available.

```
