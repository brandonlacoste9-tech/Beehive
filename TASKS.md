# TASKS — BeeHive Mode Backlog (Agent-Friendly)

> Agents: pick ONE task, perform it end-to-end, update this file in a new PR, and include reproduction steps.

## 0) Bootstrap Verify
**Goal:** Ensure BeeHive runs locally.
- Steps: `npm i && npm run dev`
- Verify:
  - App loads, ambient background visible.
  - Home shows `SwarmGate` with input + Unlock button.
- Done when: No console errors; UI renders.

---

## 1) Fire-UI Tokens & Provider Check
**Goal:** Confirm tokens, keyframes, and provider wrap.
- Edit: `tailwind.config.ts`, `src/components/FireUIProvider.tsx`
- Accept:
  - Colors present: `aurora.*`, `hive.*`.
  - Keyframes present: `swarm-float`, `swarm-glow`, `swarm-pulse`.
  - `FireUIProvider` includes `AuroraBackground` and `SwarmParticleTrail`.

---

## 2) Voice Synthesis (VoiceForge)
**Goal:** Synthesize voice via ElevenLabs proxy.
- Files:
  - `app/api/voice/synthesize/route.ts` — server proxy
  - `src/lib/elevenlabs-voice.ts` — `synthesizeVoice({text, voice?})`
  - `src/components/VoiceForge.tsx` — textarea → audio preview
- Accept:
  - POST returns `{ audioUrl }`.
  - UI synthesizes and plays audio.
  - No secrets leaked to client.

---

## 3) Transcription (WhisperWing)
**Goal:** Upload audio and get captions.
- Files:
  - `src/lib/openai-whisper.ts` — `transcribeAudio(file)`
  - `src/components/WhisperWing.tsx` — file input → transcript
- Accept:
  - Text returns for valid audio.
  - Error shows friendly message on failure.

---

## 4) Music Demo (LayerLoom)
**Goal:** Generate or demo music.
- Files:
  - `app/api/music/generate/route.ts` — returns demo URLs per style
  - `src/components/LayerLoom.tsx` — prompt/style → `<audio>`
- Accept:
  - Styles switch audio source.
  - Clear messaging if real endpoint not configured.

---

## 5) Asset Library (CodexScrolls)
**Goal:** List basic assets from API.
- Files:
  - `app/api/assets/list/route.ts`
  - `src/components/CodexScrolls.tsx`
- Accept:
  - API returns array with `{id,name,type,date,url}`.
  - UI lists items with motion hover.

---

## 6) Ritual Dashboard (SwarmHive)
**Goal:** Show live ritual cards.
- Files:
  - `app/api/rituals/live/route.ts`
  - `src/components/SwarmHive.tsx`
- Accept:
  - Cards render with status and agent.
  - Uses `liftProps` on hover.
  - No client errors.

---

## 7) EchoTale Preview
**Goal:** Remotion-based voice + captions preview (SSR-safe).
- Files:
  - `src/components/EchoTale.tsx` (Player via dynamic import)
- Accept:
  - Plays audio track in a Sequence.
  - Renders timed caption blocks.
  - No hydration warnings.

---

## 8) Sound & Motion Consistency
**Goal:** Use shared hooks across modules.
- Files:
  - `src/lib/motion.ts`, `src/lib/sound.ts`
- Accept:
  - Buttons use `liftProps`.
  - Key interactions use `playTone("hover"|"render"|"export"|"unlock")`.

---

## 9) Docs & Onboarding
**Goal:** Create quickstart README.
- File: `README.md`
- Include:
  - Prereqs, env setup, commands, known stubs.
  - Link to this `TASKS.md` and `.github/copilot-instructions.md`.

---

## 10) Stretch: Export Engine Stub
**Goal:** Introduce export entry point (no real ffmpeg yet).
- File: `app/api/export/route.ts` (stub)
- Accept:
  - POST accepts composition + tracks schema.
  - Returns `{ jobId, status: "queued" }`.
  - Notes: “ffmpeg worker in future slice.”

---

## Agent Checklist (per task)
- [ ] Create/modify only required files.
- [ ] Run `npm run dev` and verify no errors.
- [ ] Update this file — mark task as “Done” with a brief note.
- [ ] Commit with: `task: #N short description`
- [ ] Open PR and include reproduction steps.
