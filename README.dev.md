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

## Usage
- `docker compose ps` — check all services
- `docker compose exec app node scripts/retry-crm.js` — run retry worker
- `docker compose exec app node scripts/pr-automerge.js <owner> <repo> <pr>` — run Codex auto-merge
- `docker compose exec app node scripts/agent-runner.js` — run agent harness

## Secrets & Safety
- Copy `.env.example` to `.env.local` and edit for local secrets
- Never commit secrets; use `docker-compose.override.yml` for local-only overrides
- Agent runner disables internet by default; only allowlist safe actions

## Troubleshooting
- If a service fails, check logs: `docker compose logs <service>`
- For Playwright browser, ensure port 9222 is open and not in use
