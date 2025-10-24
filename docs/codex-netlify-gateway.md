# Codex PR Review via Netlify AI Gateway

This repository routes PR reviews through a Netlify Function that calls **GPT-5 Pro** by way of Netlify’s **AI Gateway**. No provider API keys are stored in GitHub&mdash;auth, billing, rate limits, and caching live in Netlify.

The `codex-review.yml` workflow now checks out the PR **head ref**, builds a truncated diff payload, and posts findings back to the pull request so reviewers can respond inline.

## Flow overview

1. The GitHub Action checks out `${{ github.event.pull_request.head.ref }}` with `fetch-depth: 0` to guarantee the latest commit tree.
2. A diff between `base.sha` and `head.sha` is generated, truncated to 200k lines for token safety, and serialized as JSON payload.
3. The workflow POSTs JSON to `/.netlify/functions/codex_review` with optional `maxOutputTokens` coming from repository variables.
4. The function invokes `new OpenAI().responses.create({ model: "gpt-5-pro", ... })` and caches successful responses when available.
5. Findings return to the workflow, are uploaded as an artifact, streamed into the run summary, and posted to the PR via a persistent `codex-review` comment.

## Prerequisites

- A deployed Netlify site (standard, background, or edge functions all supported).  
- Netlify AI Gateway enabled for the site (provides auth automatically).  
- GitHub secret `SITE_URL` set to the site URL, e.g. `https://example.netlify.app`.

Recommended hardening:

- Keep `fetch-depth: 0` in the workflow and check out by PR head SHA for consistent diffs.  
- Concurrency guard prevents duplicate spend on fast re-runs.

## Local smoke test

```bash
# from repo root
curl -sS -X POST "$SITE_URL/.netlify/functions/codex_review" \
  -H 'content-type: application/json' \
  --data '{"repo":"owner/repo","pr":123,"base":"<sha>","head":"<sha>","diff":"diff --git a/x b/x\n..."}'
```

## Troubleshooting

- **Gateway error / no findings**: Check Netlify function logs and confirm your plan still has AI credits.  
- **429 rate limit**: Re-run later or enable heavier caching/batching.  
- **Missing artifact**: The workflow always writes `codex_review_findings.txt`; if absent, inspect the “Invoke Codex” step logs.

## Notes

- The function performs a best-effort cache using the Web Cache API when available; misses are tagged via the `x-codex-cache` header.  
- Diff payload is truncated in the workflow (first 200k lines by default) to control token usage&mdash;override `DIFF_LINE_LIMIT` if required.
- Concurrency guard (`codex-review-${{ github.event.pull_request.number }}`) prevents duplicate Netlify calls during rapid pushes.
- Findings include appended metadata (`jobId`, `attempt`, `status`, `artifact`) for CodexReplay overlays and badge updates.

