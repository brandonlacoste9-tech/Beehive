# Codex Scroll: Spark Mutation Relay

## Ritual Setup
- **Environment**: set `NETLIFY_GPT5_GATEWAY_TOKEN` (and optionally `NETLIFY_GPT5_GATEWAY_URL`). Supabase credentials remain under `assertServerEnv` guard.
- **Storage**: provision a `codex_spark_mutations` table with JSONB columns for request/response payloads plus status metadata (`job_id`, `status`, `size_bytes`, `retries`, `message`, timestamps).
- **Invocation**: always use the exported helpers — no direct fetches. They encode retry cadence, Supabase persistence, and replay telemetry for CodexReplay overlays.

## Flow
1. `queueSparkMutation` normalizes ACE context packs and posts them to the Netlify GPT-5 gateway. Responses are persisted with `jobId`, `status`, `sizeBytes`, and patch sets, ready for overlays.
2. `applySparkMutations` (optionally refreshing from the gateway) composes patch sets back into a file map and stamps the Supabase record with `status: applied` plus `applied_at`.
3. Both helpers surface operational metadata (`jobId`, `sizeBytes`, `status`, optional `message`) for badges, Codex index entries, and lineage reports.

## Backoff & Recovery
- Retries default to two attempts with 750 ms exponential spacing. Adjust via `QueueSparkMutationOptions` if a ritual needs a longer meditation window.
- Failures write `status: failed` and preserve the error message; downstream rituals can key off this to trigger a nudge or requeue.

## Integration Notes
- ACE patches expect `{ row, column }` coordinates. The helper collapses them into deterministic byte offsets before slicing.
- Replay clients should honor the returned `patchSets` order and treat absent files as empty buffers (the helpers already do so on the server).
- Supabase persistence keeps request metadata alongside results, enabling spark lineage audits without leaving the Codex garden.
