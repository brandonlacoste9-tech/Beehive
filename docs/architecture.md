# Codex-Compatible AI Content Agent Architecture

## Executive Summary
This architecture adapts Greg Isenberg's AI content agent workflow to the Codex delivery surface. It introduces policy-aware ingress, deterministic orchestration, verifiable validation, governed publishing, and replayable observability so that every run is auditable in CI, staging, and production.

## Component Map
| Domain | Component | Responsibility |
| --- | --- | --- |
| Ingress | **Topic Intake API (Appify actor trigger)** | Accepts requests with campaign topic, target personas, and platform preferences. Persists a signed job descriptor in Supabase (`content_jobs` table) and emits a `jobId` for downstream tracking. |
| Ingress | **Source Harvesters (Apify actors)** | Parameterized scrapers for YouTube, X, and optional RSS feeds. Credentials supplied via `APIFY_TOKEN`. Captures metadata, transcripts, and engagement metrics as newline-delimited JSON in Supabase storage. |
| Orchestration | **n8n Workflow (`content_agent_main`)** | Stateful DAG orchestrating scraping, enrichment, ideation, validation, writing, review, and publishing. All external calls flow through HTTP Request nodes bound to environment variables for keys, timeouts, and retry policies. |
| Orchestration | **Codex Runtime Hooks** | Codex agent pack defines prompts, guardrails, and PR review heuristics. Enforces human-in-loop checkpoints and returns signed verdicts for CI/CD gates. |
| Validation | **Perplexity Research Agent (via OpenRouter)** | Performs fact retrieval with verifiable citations. Outputs normalized evidence blocks stored alongside draft artefacts. |
| Validation | **Content Validator Script (`validate_perplexity.py`)** | Deterministically verifies citation freshness, schema compliance, banned phrase filters, and ensures brand voice alignment via deterministic regex + optional Claude critique call in dry-run mode. |
| Publishing | **LinkedIn Dry-Run Publisher (`publish_linkedin.py`)** | Executes idempotent publishing. In CI it runs in dry-run mode, emitting payload checksums. In production it signs and dispatches requests to LinkedIn Marketing API v2. |
| Observability | **Codex Replay Exporter** | Emits run metadata (`jobId`, `sizeBytes`, status transitions) to `scrolls/` ledger and optional StudioShare thread. n8n nodes log to Supabase `content_job_events`. |
| Governance | **Policy Registry (`docs/prompts.md`)** | Defines brand voice, banned phrases, escalation paths, and Codex review persona. Referenced by automation and humans alike for consistent governance. |

## Data Flow Overview
1. **Ingress:** A scheduler or on-demand request hits the Topic Intake API (Appify task or manual trigger). The request is validated, normalized, and persisted with a `jobId`.
2. **Harvest:** n8n loads job metadata, invokes Apify actors for YouTube and X using signed inputs. Results are stored and hashed (SHA-256) with checksums persisted for replay integrity.
3. **Ideate:** Aggregated text is fed into OpenRouter (GPT-4o or Claude Haiku) for ideation. The node enforces token budgets, deterministic temperature, and attaches the Apify checksum to each idea bundle.
4. **Validate:** Each idea is enriched via Perplexity search. Responses must include source URLs and publication dates. `validate_perplexity.py` enforces freshness (<365 days) and banned domain filters before the data reaches Claude Sonnet.
5. **Draft:** Claude Sonnet receives the curated corpus, evidence, and brand voice guardrails. Output undergoes formatting via `scripts/utils/formatting.py` to standardize headings, CTA, and metadata.
6. **Review:** Draft assets and structured metadata are pushed to Slack (human-in-loop). Approval events are captured in Supabase and gate publishing.
7. **Publish:** On approval, LinkedIn publishing runs. Dry-run mode (CI) logs payload; live mode posts to LinkedIn and stores response IDs for audit.
8. **Observability & Governance:** All stages emit events to Supabase and append run ledgers in `scrolls/`. Codex review agent verifies prompts and diff changes before merge.

## Security & Compliance
- **Secrets:** All API keys reside in environment variables with the `CONTENT_AGENT_` prefix and are injected at runtime via GitHub Actions secrets or `.env` for local dev. n8n references them through the `{{$env}}` helper.
- **Least Privilege:** Separate OpenRouter keys for research vs drafting to support revocation and usage monitoring.
- **Data Retention:** Transcripts and drafts expire after 30 days via Supabase storage policies. Checkpoints remain hashed for audit but redact raw content.
- **Governance Controls:** Brand guardrails, banned phrases, and review personas are versioned in `docs/prompts.md`. Any change triggers Codex review for traceability.

## Observability & Replay
- **Structured Logging:** Every script logs JSON lines with `jobId`, `stage`, `status`, `durationMs`, and `checksum` fields suitable for CodexReplay overlays.
- **Metrics:** n8n emits timing metrics to Prometheus (optional) using the built-in Prometheus node.
- **Replays:** `scrolls/` ledger entries capture inputs, outputs, and environment digests for deterministic replays. `docs/codex_quickstart.md` describes how to hydrate replays locally.

## Governance Lifecycle
1. **Policy Definition:** Brand voice, banned phrases, and compliance requirements live in `docs/prompts.md`.
2. **Automated Enforcement:** Scripts ingest these definitions to block publication if violations occur.
3. **Review:** Codex agent review prompt ensures human approval is recorded before publishing.
4. **Audit:** GitHub Actions store artefacts and the replay ledger indexes them by `jobId` for future audits.

## Next Steps
- Configure Supabase tables (`content_jobs`, `content_job_events`) using migrations (out of scope for this drop).
- Wire Appify actor for initial topic ingestion if not already available.
- Align governance doc with legal/comms stakeholders before first production run.
