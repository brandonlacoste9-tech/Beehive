## [DRAFT] v1.0.0 — “Sentiment Sentinel” (2025-10-15)

**Scope:** end-to-end ritual flow online — ingest → mood-aware generation → artifacts → growth telemetry.

### Core Intelligence
- Real-Time Sentiment Grounding in Beat-Sheet + Agent Chat.
- Insight Hotspots (data-weighted confidence; hedge on weak signal).
- Streaming UX (SSE via Gemini 1.5).

### Growth & Metrics
- Explicit K-Factor via `referrals` + tracked Share links (`?ref=<sessionId>` + UTM).
- Ritual Analytics: K with delta vs yesterday, 14-day sparkline, 24h Sentiment Histogram.
- CSV export for lineage metrics.

### Artifacts & Usability
- Montage page with **Export .md/.json**.
- Share buttons with **UTM** presets.

### DevOps
- `/api/health` instance/env guard.
- CI ingest scaffold (crawler → BigQuery).
- Dual-lane setup: `/vs` sandbox (zero-key), `/agent` full stack (Supabase/Gemini).
## v1.4.5 — Remix Scheduler (2025-10-19)

### Codex Helpers
- Added `remix_scheduler` to orchestrate scheduling and collect run metadata.
- Added `codex_badge` to emit badges for rituals.
- Added `codex_echo` to provide structured echo/log utilities.
- Added `codex_history` to append and retrieve run history.

### Scroll Registry
- Introduced `scroll_index.json` entries for each new helper with `version: "1.4.5"` and `enabled: true`.

### Integration
- Added `src/context/ace-pack.ts` to register the new helpers.
- Updated `netlify/functions/codex_review.ts` to import the register function and left a TODO hook for integration.



## v1.5.0 — Main Codex Inscription (2025-10-20)

### Codex Lineage
- Inscribed the unified [Codex-Main-Scroll.md](Codex-Main-Scroll.md) with prompting lenses, integration constellation, and deployment rites.
- Added [Codex-Index-Scroll.md](Codex-Index-Scroll.md) to track seals across the swarm.
- Documented the Flowing Honey ritual for BEEREEL `/create` and codified smoke tests.

### Operations
- Introduced `README.deploy.md`, Makefile rituals (`make dev`, `make smoke`, `make build`, `make zip`, `make wiki`), and SwarmKit bundling script.
- Added Netlify `billing-bridge` function to verify Stripe and Coinbase webhooks.
- Created smoke harness script (`npm run smoke`) validating the BEEREEL scroll.

