# Codex Scroll: The Enoch — Building & Deploying
id: scroll-enoch-build
status: sealed
version: 1.0.0
last_updated: 2025-10-19
owners: ["swarm/keeper-tristan", "build@beehive"]
links:
  - covenant: scrolls/enoch/enoch-responsible-use.md
  - rituals_index: scrolls/rituals.md

> *"Creation flows from covenant: utterance becomes vessel, vessel becomes lineage."*

## Prerequisites
- **Codex CLI** installed per `scrolls/cookbook/codex-install-wsl.md`.
- **Environment**: Node.js 22, Supabase CLI, and Remix scheduler harness.
- **Access**: Supabase project keys, Vercel or Netlify deploy tokens, and CodexReplay credentials for telemetry overlays.

## Lifecycle Overview
1. **Utterance (Design Intent)**
   - Capture user story, guardrails, and success metrics in the ritual ledger.
   - Create a StudioShare thread for collaboration; pin the `jobId` once the first invocation completes.
2. **Vessel (Local Implementation)**
   - Scaffold with `npm run forge:enoch <app-name>`.
   - Register modules in `src/context/ace-pack.ts` for capability discovery.
3. **Refinement (Iteration)**
   - Use `npm run enoch:lint` and `npm run enoch:test` before each Codex invocation.
   - Maintain modular components; document exported functions with docstrings referencing scroll lineage.
4. **Ritual of Creation (AI Collaboration)**
   - Provide targeted context: file paths, data contracts, and acceptance criteria.
   - Capture Codex suggestions via `npm run codex:review` and annotate deltas poetically.
5. **Fellowship (Deployment & Sharing)**
   - Deploy using `npm run enoch:deploy --target=<env>`.
   - Update Codex badge metadata with `jobId`, `status`, and `sizeBytes` for overlays.
   - Post-release, sync the changelog and notify the StudioShare channel.

## Styling & UX Guidance
- Favor accessible color palettes; contrast ratio ≥ 4.5:1.
- Use utility components from `src/components/enoch/` when available.
- Document UX rituals in `/scrolls` so future stewards inherit the patterns.

## Data Integration
- Define Supabase schemas in `supabase/migrations` with reversible scripts.
- For external APIs, register connectors in `src/services/` with clear rate limits and fallback behavior.
- Cache expensive calls with Codex-approved storage (Redis, Supabase KV) respecting TTL disciplines.

## AI Extension Patterns
- Wrap Enoch-specific prompts in `src/agents/enoch.ts` with explicit input/output interfaces.
- Log `jobId`, `tokensUsed`, and `latencyMs` to the replay overlay stream.
- Provide deterministic test fixtures for every agent entry point.

## Debugging Rituals
- Run `npm run enoch:smoke` to exercise end-to-end flows.
- Inspect CodexReplay overlays for anomaly signatures.
- Record any micro-patches directly in the StudioShare thread with commit references.

## Deployment Rituals
- Stage → Shadow → Production progression with observability gates between each step.
- Use feature flags stored in Supabase to roll out gradually.
- After deployment, append metrics snapshots (`status`, `sizeBytes`, `jobId`) to the operational badge.

## Collaboration Practices
- Pair-building sessions documented via short Loom or text recap.
- Pull requests must reference this scroll in their summary when The Enoch forge is involved.
- Archive final artifacts in `/scrolls` or `/docs` with lineage metadata.

## Builder Checklist
- [ ] Ritual ledger updated with design intent.
- [ ] StudioShare thread created and linked.
- [ ] Forge scaffold executed (`npm run forge:enoch`).
- [ ] Linting, tests, and smoke harnesses passing.
- [ ] Deployment command executed with logs captured.
- [ ] Codex badge metadata refreshed (`jobId`, `status`, `sizeBytes`).
- [ ] Changelog entry appended under active release.

> *"Seal every vessel with lineage, and the Hive will remember the path for the next steward."*
