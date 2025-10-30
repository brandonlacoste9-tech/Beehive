
# Copilot & Agent Instructions for Beehive: AdGenXAI

## Project Architecture & Key Patterns
- **Next.js 14 app** (JS/TS mix) for generating ad creatives (headline, body, imagePrompt).
- **UI:** React + Tailwind CSS, main entry: `pages/index.tsx` (keep UI here unless adding `components/`).
- **API:** All routes under `pages/api/` (see `generateAd.js` for contract: `{ headline, body, imagePrompt }`).
- **Serverless/Netlify Functions:** Place agent/serverless rules in `netlify/functions/AGENTS.md`.
- **Mocking:** Use `lib/*mock.js` for dry-run/testing (e.g., CRM, alerts, DB).
- **Prompt/Output patterns:** See `wiki/Cookbook.md` and `wiki/OpenAI.md` for prompt templates and output schema.

## Developer & Agent Workflows
- **Local dev:**
  - `npm install` — install deps
  - `npm run dev` — start dev server
  - `npm run build` — production build
- **Testing:**
  - `npm run test` — runs Jest (see `jest.config.js`)
  - `node scripts/test-generateAd.js` — offline contract test for ad generator
  - `node scripts/agent-runner-playwright.js` — run agent harness (mock/real, see README.dev.md)
  - `scripts/test-agent-smoke.sh` — smoke test for agent runner (mock/real)
- **Lint:** `npm run lint`
- **CI:** If `.github/workflows/codex-chmod.yml` exists, all agent/Codex changes must pass CI before merge.

## Security & Agent-Specific Rules
- **Frontend agents:**
  - Ensure accessibility (WCAG, aria, focus, contrast)
  - Use semantic markup, keyboard navigation
  - Add telemetry for key UX events (click, submit, error)
  - Suggest unit/integration tests for new logic
- **Serverless/Netlify agents:**
  - Validate all inputs (types, lengths, allowed values)
  - Enforce auth and least-privilege on endpoints
  - Use constant-time comparison for HMAC/signature checks (see `LEAD_HMAC_SECRET`)
  - Never log secrets/PII; mask in logs
  - Suggest idempotency/upsert for lead/queue endpoints
  - Place security rules in `netlify/functions/AGENTS.md`

## Environment & Integration
- **Secrets:** Never expose secrets in client code. Store in `.env.local` (local) or Netlify env (prod). See `.env.example` for required/optional vars.
- **OpenAI:**
  - If enabled, add `openai@^4` (server-only). Never expose `OPENAI_API_KEY` to client.
  - Use lightweight models (e.g., `gpt-4o-mini`), deterministic JSON output.
  - Reference prompt/output shape in `wiki/Cookbook.md` and `wiki/OpenAI.md`.

## Contribution & Conventions
- **Structure:**
  - UI: `pages/index.tsx` (unless adding `components/`)
  - API: `pages/api/` (return `{ headline, body, imagePrompt }`)
  - Styles: Tailwind utilities, extend in `tailwind.config.js`, reuse `.bee-gradient`, `.bee-shadow` from `styles/globals.css`
- **Change scope:**
  - Favor small, focused changes; avoid new UI libs
  - Run lint/tests before PR
- **Naming:** Use “Beehive: AdGenXAI” in UI/PRs. (Current UI: “Adgenxa” in `pages/index.tsx:6`)

## Example Prompts & Patterns
- **Prompt contract:** `{ headline, body, imagePrompt }` (see `lib/generateAdCore.js`)
- **Prompt templates:** `wiki/Cookbook.md`
- **Agent schema:** `lib/agent-schema.js` (see also agent runner in `scripts/agent-runner-playwright.js`)
- **CRM retry/alerting:** `lib/db.js`, `lib/alert.js`, `scripts/retry-crm.js`, `DOCS/LEADS_RETRY.md`

---
For more, see `README.md`, `README.dev.md`, and the `wiki/` directory.
