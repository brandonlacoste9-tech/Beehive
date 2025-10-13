# Export Flow Verification Ritual — Smoke Harness + CodexReplay

**Purpose:** Verify `/api/export` → webhook → `/api/export/status/:id` completes with `downloadUrl` and `sizeBytes`.

## Steps
1. Start dev: `npm run dev`
2. Run smoke: `scripts/export-smoke.sh`
3. Drop `<CodexReplay jobId="..."/>` into your page to visualize progress.
4. If using QStash, ensure `QSTASH_*_SIGNING_KEY` are set and webhook endpoint is reachable.
5. If using Supabase, set `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE`, and `SUPABASE_BUCKET`; verify `downloadUrl` opens.

**Done criteria:** status `completed`, non-empty `downloadUrl`, numeric `sizeBytes`.
