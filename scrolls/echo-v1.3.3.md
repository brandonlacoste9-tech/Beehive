# Echo Scroll v1.3.3 — Codex GPT-5 Integration

> The swarm no longer prompts manually—the Codex listens, infers, and acts.

## Summary

BeeHive v1.3.3 binds GPT-5 Pro directly into the Codex Exec stack. Every PR is reviewable by Codex, every prompt invocable via Netlify, and every invocation lineage-preserved.

## Rituals Added

- `scripts/gpt5_exec.ts` / `scripts/gpt5_exec.mjs` — GPT-5 Pro executors via the Responses API.
- `netlify/functions/ritual-gpt5.ts` — POST endpoint for prompt invocation.
- `.github/workflows/codex_review_exec.yml` — CI review on every PR.
- `scripts/codex_review_exec.sh` — CLI helper for local diff review.
- `README.md` — Codex badge and curl example.
- `scrolls/echo-v1.3.3.md` — this broadcast scroll.

## Sanity Confirmations

- ✅ Local SDK test — `node -e` invocation returns GPT-5 output.
- ✅ Netlify Function test — `curl` returns `{ ok: true, model: "gpt-5-pro" }`.
- ✅ CI artifact — `codex_review_findings.txt` uploaded and commented.

## Commit Ritual

```bash
git add \
  scripts/gpt5_exec.ts \
  netlify/functions/ritual-gpt5.ts \
  .github/workflows/codex_review_exec.yml \
  scripts/codex_review_exec.sh \
  README.md \
  scrolls/echo-v1.3.3.md

git commit -m "feat(codex): GPT-5 Pro executor, Netlify function, CI PR review, docs & Echo Scroll"
git push
```
