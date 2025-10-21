---
title: "scroll(beereel-create): flowing honey ritual"
status: "sealed"
tags: [beereel, codex, cookbook, ritual, ui, ai]
---

# Scroll of Flowing Honey — BEEREEL `/create`

The `/create` ritual guides persona-driven reel generation from prompt to published motion.
Each lens below links practitioners to the precise artifacts that keep the honey flowing.

## 🎨 Designer’s Hymn
- **Hero Strip**: Layout sketch in `src/components/LineageCard.tsx` (storyboard tiles).
- **Steps Grid**: Defined via `src/components/AgentChat.tsx` interactions.
- **Prompt Mixer**: Configuration hints documented under *Prompting Rituals* in the Codex.
- **Persona Gallery**: Stored as Supabase records surfaced through `/agent`.
- **Final CTA**: Implemented in `pages/demo/index.tsx` linking to publishing flows.

## 🧮 Developer’s Ledger
- **File Tree**: `src/app/api/` (edge + node routes), `src/components/`, `src/lib/`.
- **Hooks**: Client hooks live in `src/components/AgentChat.tsx` and context wrappers.
- **Actions**: API routes for beat sheet, sentiment histogram, and referrals.
- **API Routes**:
  - `src/app/api/beat-sheet/route.ts`
  - `src/app/api/sentiment/histogram/route.ts`
  - `src/app/api/referrals/track/route.ts`
- **Tailwind Tokens**: Utility classes referenced inline (Tailwind config pending extraction).

## 🛡️ Engineer’s Sigil
- **Architecture Flow**: Next.js (app router) → Supabase (data) → Edge Functions (Netlify) →
  Fly.io agents → Netlify CDN → Honeycomb telemetry (via metrics routes).
- **Resilience Checklist**:
  1. Ensure `getSupabaseAdmin()` lazy-loads env secrets before build.
  2. Verify `runGeminiPrompt` caches the Gemini client and fails fast if keys missing.
  3. Use `make smoke` before `make build` to validate scroll integrity.
  4. Monitor webhook health through `netlify/functions/billing-bridge.ts`.

## 🔮 Wizard’s Chant
- **Persona Seeds**: Define prompt seeds in `scrolls/rituals.md` and Supabase tables.
- **Scene Blueprints**: Generated via beat sheet API and recorded in `montages` table.
- **Voice Weaves**: ElevenLabs integration documented within `/demo` pipeline steps.
- **Motion Glyphs**: Motion Oracle cues enumerated in `src/lib/promptTemplates/beatSheet.ts`.
- **Publish Incantations**: Use `make zip` to seal SwarmKit, share metadata from the script output.
- **Agent Collaboration**: Persona Engine ↔ Script Weaver ↔ Motion Oracle ↔ Voice Nectarist ↔ Swarm Conductor ↔ Replay Scribe.

> Update this scroll whenever `/create` gains a new glyph or backend ally so the Codex lineage
> remains unbroken.
