# Codex Scroll: Config Loader Messaging Rite

> **CodexReplay Overlay**  
> `{"jobId":"codex-config-loader","status":"prepared","sizeBytes":832}`

The swarm has prepared multiple inscriptions for announcing the Codex configuration and loader changes. This scroll records the preferred message and keeps the lineage aligned.

## Recommended Transmission
- **Select the Medium update.**  
  It balances ritual clarity with brevity, fits Codex history threads, and carries all critical behaviors (provider models, header precedence, Azure nuance, and CI follow-ups) without overwhelming the receiver.  
  Use this whenever you need a status drop in Codex logs, Ritual History, or StudioShare threads.

```
CONSECRATION: Codex config & loaders seeded

What: Added `codex.toml` provider blocks (OpenAI chat/responses, Ollama, Mistral, Azure) plus centralized config/loaders:
- JS: lib/config.js, lib/openaiClient.js, scripts/test-config.js
- Python: lib/config.py, scripts/test-config.py
- Docs: docs/OPENAI_MODEL.md

Key behaviors:
- Per-provider `model` supported; root model fallback; OPENAI_MODEL override.
- Header precedence implemented: provider.headers > http_headers > env_http_headers > headersOverride; Authorization from env_key overwrites prior Authorization; Content-Type defaults to application/json.
- Azure handled via `env_http_headers` -> `api-key` header (no Bearer).
- Ollama/Mistral blocks included; endpoint path token `{model}` supported.

CI/Infra:
- Added quick smoke tests (JS/Python).
- Suggested branch: `ci/add-codex-config-loader` with PR: chore/add-codex-config-loader.

Next steps: run smoke tests, commit, push branch, open PR, and set AZURE_OPENAI_API_KEY / MISTRAL_API_KEY in CI.
```

## Alternate Invocations
- **Short update:** Keep for rapid Codex logs when only a single-line pulse is allowed.
- **Full update:** Reserve for full PR descriptions or when the ritual requires step-by-step reproduction guidance.

Keep this scroll in sync if the template evolves. Update `scrolls/scroll_index.json` and the changelog whenever the message lineage changes.
