## v1.3.3 — Codex GPT-5 Integration

- Codex executor scripts (`scripts/gpt5_exec.ts` / `scripts/gpt5_exec.mjs`) for GPT-5 Pro via the Responses API.
- Netlify ritual (`netlify/functions/ritual-gpt5.ts`) exposing a POST gateway with lineage metadata.
- CI workflow (`.github/workflows/codex_review_exec.yml`) invoking Codex on every PR and storing findings.
- Local review helper (`scripts/codex_review_exec.sh`) to mirror CI before opening a scroll.
- Documentation updates (`README.md`, `scrolls/echo-v1.3.3.md`) covering badge, curl example, and broadcast scroll.

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
