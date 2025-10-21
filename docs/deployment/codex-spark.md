# Codex Spark Deployments

The `codex-spark-deploy` Netlify Function bridges spark build jobs back into the BeeHive
lineage. Requests must be `POST` and include the spark repository identifier along with the
swarm token for that repo.

## Environment configuration

Set these variables in the Netlify UI (per environment) before enabling the webhook:

- `SPARK_SWARM_TOKENS`: JSON or `repo=token` mapping for authenticating incoming requests.
  A wildcard entry (`"*"`) applies to every repo that is not explicitly listed.
- `SPARK_SWARM_TOKEN`: Fallback token when a repo-specific token is not provided.
- `SPARK_BUILD_HOOKS`: JSON or `repo=https://...` mapping to Netlify build hooks for each
  spark repository.
- `SPARK_BUILD_HOOK_URL`: Fallback build hook URL if a repo does not have an explicit entry.
- `CODEX_HISTORY_STORE`: Optional override for the Netlify Blobs store that houses spark
  deploy history. Defaults to `beehive_codex`.

## Request payload

Example JSON body:

```json
{
  "repo": "echo",
  "jobId": "spark-2025-02-08T10-15-00Z",
  "status": "success",
  "deployPrimeUrl": "https://spark-echo.netlify.app/",
  "artifactSizeBytes": 1048576,
  "targets": ["echo"],
  "swarmToken": "<token>"
}
```

- `status` accepts `success`, `failed`, `queued`, or `building`.
- `targets` may be provided to trigger multiple spark build hooks.
- When a job resolves to `success`, the function records the deployment snapshot and
  POSTs to the configured build hooks with the job metadata.

Codex history is surfaced via `/.netlify/functions/ritual-metrics` under the
`codex_spark` key and reflected on the ritual badge.
