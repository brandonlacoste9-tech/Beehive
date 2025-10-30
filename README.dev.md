# Beehive DevContainer & Docker Compose Dev Machine

## Quick Start

```bash
git checkout -b infra/dev-machine
# (Apply patch or add files)
docker compose up -d --build
# Open in VS Code DevContainer or Codespaces
```

## Services
- `app`: Node.js dev image (with pnpm, netlify-cli, playwright, ffmpeg)
- `postgres`: Postgres 15
- `redis`: Redis 7
- `browser`: Playwright headful browser (Chromium, port 9222)


## Agent Runner (Playwright+LLM)
- `docker compose exec app node scripts/agent-runner-playwright.js` — run agent harness (mock or real)
- `USE_MOCK_LIBS=1` — mock mode (no network/side effects)
- `AUTO_CONFIRM=1` — actually perform browser actions (otherwise dry-run)
- `OPENAI_API_KEY` — required for real LLM mode
- `docker compose exec app bash scripts/test-agent-smoke.sh` — run smoke tests (mock and real)

### Example: Mock vs Real
```bash
# Mock mode (safe, no network):
USE_MOCK_LIBS=1 docker compose exec app node scripts/agent-runner-playwright.js
# Real mode (needs OPENAI_API_KEY):
OPENAI_API_KEY=sk-... docker compose exec app node scripts/agent-runner-playwright.js
```

### Audit Log
- All agent actions, suggestions, and errors are logged to `logs/agent-audit.log` (JSONL).

### Required Secrets
- `OPENAI_API_KEY` (for LLM)
- (Optional) `AGENT_ALLOWLIST`, `AUTO_CONFIRM`

---
## Usage
...existing code...

## Secrets & Safety
- Copy `.env.example` to `.env.local` and edit for local secrets
- Never commit secrets; use `docker-compose.override.yml` for local-only overrides
- Agent runner disables internet by default; only allowlist safe actions

## Troubleshooting
- If a service fails, check logs: `docker compose logs <service>`
- For Playwright browser, ensure port 9222 is open and not in use
