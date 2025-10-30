# Copilot Instructions for Beehive: AdGenXAI

## Project Overview
- Beehive: AdGenXAI is a Next.js app that generates ad creatives (headline, body, image prompt) for marketers and creators.
- UI is built with React and Tailwind CSS; deployed on Netlify.
- Main entry points: `pages/index.tsx` (UI), `pages/api/generateAd.js` (API, placeholder for stability).

## Stack & Routing
- Next.js 14 (Pages Router) with a JS/TS mix (no `tsconfig.json` in repo).
- Tailwind CSS with custom theme (`tailwind.config.js`) and global styles in `styles/globals.css`.
- API routes live under `pages/api/` (currently `generateAd.js`).

## Repo Layout Quick Map
- `pages/index.tsx` — Main UI page.
- `pages/api/generateAd.js` — Placeholder API returning sample data.
- `pages/_app.js`, `pages/_document.js` — App/document wrappers.
- `styles/globals.css` — Tailwind layers + bee-themed classes.
- `tailwind.config.js` — Theme extensions (brand colors, Inter font).
- `netlify.toml` — Build settings (see Deployment).
- `wiki/` — Cookbook and integration notes.

## Key Workflows
## Key Workflows & Commands

**Local development:**
```sh
npm install           # Install dependencies
npm run dev           # Start Next.js dev server
npm run build         # Production build (output: .next)

## API Contract
```

**Deployment (Netlify):**
```sh
# Build command:
- Route: `POST /api/generateAd`
# Publish directory:
- Request body: `{ productDescription?: string, url?: string }`
# Set OPENAI_API_KEY in Netlify environment variables if enabling OpenAI
```

**Smoke tests:**
Run these before/after major changes:
- Setup-only install: `npm ci --ignore-scripts`
- Runtime block test: `node scripts/block-runtime.js`
- Slack env-selection: `node scripts/test-slack-env.js`
- Prompt-injection test: `node scripts/prompt-injection.js`
- Response body: `{ headline: string, body: string, imagePrompt: string }`
- Current behavior: ignores input and returns a static sample payload to maintain build stability.

## Environment & Integration
## Environment & Integration

**.env.example** (see root):
```env
OPENAI_API_KEY=your-openai-key-here   # Required for AI ad generation (server-side only)
# NETLIFY_* variables are set in Netlify UI (build/deploy)
# DATABASE_URL=...                    # (Optional) If using a database
# SLACK_WEBHOOK_URL=...               # (Optional) For Slack notifications
# LEAD_HMAC_SECRET=...                # (Optional) For lead signature validation
```

**Secrets handling:**
- Never expose secrets (API keys, webhooks, etc.) in client code or public repos.
- Store secrets in `.env.local` (local) or Netlify/secret manager (production).
- Use secrets for setup and server-side logic only.

**OpenAI integration:**
- Currently disabled; OpenAI SDK not installed.
- If enabling:
  - Add `openai@^4` (server-side only). Never expose `OPENAI_API_KEY` to the client.
  - Configure `.env.local` with `OPENAI_API_KEY` and read it in API routes only.
  - Prefer lightweight models (e.g., `gpt-4o-mini`) and a deterministic JSON schema for `{ headline, body, imagePrompt }`.
- Reference prompt patterns and output shape in `wiki/Cookbook.md` and `wiki/OpenAI.md`.

## Copilot & Codex Usage Tips

**How to prompt Copilot/Codex:**
- Be specific: “Add a form to `pages/index.tsx` that POSTs to `/api/generateAd` and displays the result.”
- Reference files: “Update `pages/api/generateAd.js` to use OpenAI if `OPENAI_API_KEY` is set.”
- Use a clear, direct tone. Prefix with context if needed: “In this repo…”

**Example Copilot prompt:**
```text
Add a Slack notification to `pages/api/generateAd.js` when an ad is generated, using `SLACK_WEBHOOK_URL` from env.
```

## AGENTS.md & Security

- Place `AGENTS.md` in the project root or `netlify/functions/` for agent-specific rules.
- Example snippet for `netlify/functions/AGENTS.md`:
```markdown
# AGENTS.md
## Security Checks
- All functions must validate incoming requests for HMAC signature using `LEAD_HMAC_SECRET`.
- Test commands: `npm run lint && npm run build && npm run test`
```

## CI & chmod

- If present, `.github/workflows/codex-chmod.yml` enforces CI gating for Codex/agent diffs. All changes must pass CI before merge.

## Quick File Map

- `pages/index.tsx` — Main UI
- `pages/api/generateAd.js` — API endpoint (ad generation)
- `styles/globals.css` — Tailwind + bee styles
- `tailwind.config.js` — Theme config
- `wiki/` — Cookbook, OpenAI, and prompt docs
- `.env.example` — Required/optional env vars

## Project Conventions
- Styling
  - Use Tailwind utilities; extend theme in `tailwind.config.js`.
  - Reuse bee-themed helpers in `styles/globals.css` (e.g., `.bee-gradient`, `.bee-shadow`).
- Structure
  - Keep UI in `pages/index.tsx` unless introducing a `components/` folder explicitly.
  - Keep API routes under `pages/api/` and return the documented contract.
- Change scope
  - Favor small, focused changes; avoid adding new UI libraries.
  - Run `npm run lint` and keep dependencies minimal.

## Deployment
- Current settings (netlify.toml): `command = "npm run build"`, `publish = ".next"`.
- For SSR features, consider adding the Netlify Next.js Runtime (`@netlify/plugin-nextjs`). If you switch to `next export`, set `publish = "out"` instead.
- This project uses Next.js API routes; the `functions` directory is not currently used.

## Contribution
- Standard GitHub flow: fork → branch → PR.
- No custom CI; rely on Next.js defaults.
- Naming: use “Beehive: AdGenXAI” consistently. The current UI text displays “Adgenxa” in `pages/index.tsx:6`.

## Known Gaps / Next Steps
- Add a simple form in `pages/index.tsx` to collect `productDescription` or `url` and `fetch('/api/generateAd', { method: 'POST', body })`.
- Optional: standardize branding in the UI to “AdGenXAI”.
- Optional: re-enable server-side OpenAI in `pages/api/generateAd.js` following `wiki/OpenAI.md`.

## Examples
- To add a new ad format, update prompt templates in `wiki/Cookbook.md` and adjust the API to produce `{ headline, body, imagePrompt }` accordingly.
- For custom styles, extend Tailwind config and add classes to `styles/globals.css`.

---
For more, see `README.md` and the `wiki/` directory.
