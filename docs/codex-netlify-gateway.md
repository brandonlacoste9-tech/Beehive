# Codex PR Review via Netlify AI Gateway

This repository routes PR reviews through a Netlify Function that calls **GPT-5 Pro** by way of Netlify’s **AI Gateway**. No provider API keys are stored in GitHub&mdash;auth, billing, rate limits, and caching live in Netlify.

## Flow overview

1. The GitHub Action builds a PR-scoped diff (capped for token size).  
2. The workflow POSTs JSON to `/.netlify/functions/codex_review`.  
3. The function invokes `new OpenAI().responses.create({ model: "gpt-5-pro", ... })`.  
4. Plain-text findings are returned to the workflow.  
5. The workflow uploads the findings as an artifact and comments on the PR (when applicable).

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
- Diff payload is truncated in the workflow (first 200k lines) to control token usage&mdash;adjust as needed.

