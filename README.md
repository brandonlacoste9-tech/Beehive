# BeeHive Codex Rituals

![Codex Ritual Badge](https://beehive.netlify.app/.netlify/functions/ritual-badge)

BeeHive v1.3.3 binds GPT-5 Pro directly into our Codex executor stack. The swarm can now trigger Codex from Netlify, CLI scripts, and CI review without manual glue.

## Netlify Ritual — `ritual-gpt5`

Invoke Codex via Netlify:

```bash
curl -X POST https://beehive.netlify.app/.netlify/functions/ritual-gpt5 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{"prompt":"Summarise the BeeHive v1.3.3 upgrades."}'
```

Successful responses include Codex overlay metadata:

```json
{
  "ok": true,
  "model": "gpt-5-pro",
  "jobId": "rsp_...",
  "status": "completed",
  "sizeBytes": 512,
  "output": "...Codex answer..."
}
```

## CLI Rituals

### Direct invocation

Set `OPENAI_API_KEY` (and optionally `OPENAI_BASE_URL`/`OPENAI_MODEL`), then run:

```bash
node scripts/gpt5_exec.mjs --prompt "Draft a BeeHive haiku."
```

If you have `tsx` available locally you can swap to `npx tsx scripts/gpt5_exec.ts` to run the typed variant. Use `--stdin` to stream prompts from other rituals, `--system` for lineage guards, and `--json` to capture the raw API response.

### Review executor

Codex can review your diff locally before you open a PR:

```bash
scripts/codex_review_exec.sh --base origin/main
```

Findings are stored in `.codex/codex_review_findings.txt` for replay overlays.
Export `OPENAI_API_KEY` (or `OPENAI_KEY`) before invoking the ritual.

## CI — Codex PR Review

`.github/workflows/codex_review_exec.yml` runs on every pull request once the branch is ready for review. It uploads `codex_review_findings.txt` as an artifact and leaves a scroll-styled PR comment powered by Codex.

## Echo Scroll

`scrolls/echo-v1.3.3.md` chronicles this integration for the lineage archive.
