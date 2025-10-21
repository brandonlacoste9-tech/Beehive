---
title: "codex: main charter of the swarm"
status: "sealed"
tags: [codex, swarm, adgenxai, beereel, rituals, cookbook, lineage]
---

# Codex Charter — Main Codex

This charter unifies BeeHive’s prompting rituals, integration constellations, and
operational lineage. Treat each section as a lens; together they form the living Codex.

## 🔭 Four Lenses of Prompting
1. **Designer** — craft moodboards and brand alignments via the BEEREEL `/create` ritual.
   - Inputs: audience, tone, palette, motion glyphs.
   - Outputs: storyboard-ready hero strips and step grids.
2. **Developer** — translate prompts into reproducible components.
   - Use `src/components/` for UI atoms, `src/app/api/` for data flows, and document
     permutations in `scrolls/beereel-create-flowing-honey.md`.
3. **Engineer** — balance performance, resilience, and observability.
   - Reference architecture diagrams under *Engineer’s Sigil* in the Flowing Honey scroll.
4. **Wizard** — orchestrate AI collaborators.
   - Persona Engine → Script Weaver → Voice Nectarist → Motion Oracle → Swarm Conductor → Replay Scribe.

## 🌌 Integration Constellation
- **OpenAI**: Story ideation via persona prompts (`src/lib/promptTemplates`).
- **Google Gemini**: Sentiment-aware beat sheets (`src/app/api/beat-sheet/route.ts`).
- **ElevenLabs**: Voice weaves triggered in the persona pipeline (documented under `/demo`).
- **Stripe + Coinbase**: Billing bridge via Netlify function [`billing-bridge.ts`](netlify/functions/billing-bridge.ts).
- **Mux**: Reel streaming endpoints referenced in BEEREEL ritual scroll.
- **GA4 / YouTube**: Growth metrics summarised in `src/app/api/lineage/metrics/route.ts`.

## 🗺️ UI Maps
- **AdGenXAI Homepage**: `pages/index.tsx` with links to rituals and Netlify functions.
- **BEEREEL App**: App Router pages under `src/app/` (`/agent`, `/vs`, `/montage/[id]`).
- **Persona Demo**: `/demo` pipeline overview (see `pages/demo/index.tsx`).

## 🎭 Persona Demo Flows
1. Prompt intake (`/demo` → Designer Hymn).
2. Script weaving (Gemini + Script Weaver).
3. Voice synthesis (ElevenLabs via Voice Nectarist).
4. Motion blueprint (Motion Oracle outputs scene directives).
5. Reel assembly & publish (Mux + Swarm Conductor, logged by Replay Scribe).

## 🛠️ Contributor Guidance
- **Agents**: extend behaviours via `src/codex/` modules and register through `registerCodexScrolls()`.
- **Bees**: follow `README.deploy.md` for deployment rites, and log every change in `CHANGELOG.md`.
- **Swarm**: update `Codex-Index-Scroll.md` whenever a scroll is sealed.
- **External Contributors**: start with `scrolls/rituals.md` and run `make smoke` before proposing PRs.

## 🚀 Deployment Rites
- Ritual commands: `make dev`, `make smoke`, `make build`, `make zip`, `make wiki`.
- Netlify executes `npm run build` via `@netlify/plugin-nextjs` (see `netlify.toml`).
- SwarmKit bundles via `scripts/package/make-swarmkit.mjs`.

## 📚 Cookbook & Rituals
- Flowing Honey Ritual: [scrolls/beereel-create-flowing-honey.md](scrolls/beereel-create-flowing-honey.md)
- Smoke Test Scroll: [scrolls/smoke-tests-beereel.md](scrolls/smoke-tests-beereel.md)
- Deployment Ledger: [README.deploy.md](README.deploy.md)

## 🪶 Seal & Metadata
```
jobId: codex-main-2025-10-20
status: sealed
sizeBytes: TBD via make zip
```

Keep this charter synchronized with all derivative scrolls before publishing SwarmKit artifacts.
