# Codex Spark Deploy Ritual

The Codex Spark deploy function orchestrates artifact builds, Netlify deploy handoffs, and lineage logging.

## Invocation
- Endpoint: `POST /api/codex/spark/deploy`
- Auth: requires `x-beehive-token` header matching `BEACON_TOKEN` (skipped for local).
- Body fields (optional):
  - `jobId`: provide to reuse existing lineage id.
  - `branch`, `commitRef`, `context`: forwarded to Spark build + Netlify deploy metadata.
  - `artifactUrl`: pre-built artifact zip if the Spark builder is skipped.
  - `metadata`: additional JSON persisted alongside the deploy record.

The handler will generate a `spark-<timestamp>` job id when none is provided.

## Build choreography
1. Queue lineage entry via `echoSparkStatus` (`status=queued`).
2. Hit the Spark build webhook when `CODEX_SPARK_BUILD_URL` is configured; fall back to provided `artifactUrl`.
3. Create a Netlify deploy using `NETLIFY_SITE_ID` + API token.
4. Record the resulting `previewUrl`, `deployId`, and artifact metadata back through `echoSparkStatus`.

## Storage
- Latest status lives under the Netlify Blob store key `codex_spark_status`.
- History is pruned and persisted via `codex_spark_history` (see `netlify/lib/codex_history.ts`).

## Badge + Metrics
- `/.netlify/functions/ritual-badge` now surfaces Codex Spark status, job id, and preview link.
- `/.netlify/functions/ritual-metrics` exposes lineage snapshots in `spark_deploy`.

## Environment
- `CODEX_SPARK_BUILD_URL`: optional webhook for artifact builds.
- `CODEX_SPARK_BUILD_TOKEN`: bearer token for the build webhook.
- `NETLIFY_SITE_ID` / `CODEX_SITE_ID`: target site.
- `NETLIFY_AUTH_TOKEN` / `CODEX_NETLIFY_TOKEN`: API token used for deploy creation.
- `BEACON_TOKEN`: request guard for production traffic.

## Failure handling
Any exception during build or deploy marks the lineage entry as `failed`, captures the error message in the note field, and emits a red badge payload. Retry after addressing upstream errors; job ids can be reused to append to the same lineage record.
