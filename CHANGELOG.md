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

## [1.3.0] — Codex Agent Runner

- Added `ritual-agent.ts` Netlify Function powered by OpenAI Codex.
- Accepts POST requests with `prompt` field and returns Codex + metadata payloads for observability overlays.
- Linked function from the homepage directory and repository README with sample replay payload.
- Documented environment expectations for Netlify deploys.
