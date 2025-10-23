# Broadcast Relays — Codex Lineage

This scroll documents the broadcast rituals introduced for the Beehive swarm. Each relay is sealed as a Netlify Function and authenticated via the shared capability key.

## Functions

| Function | Target | Notes |
| --- | --- | --- |
| `broadcast-pr` | GitHub Pull Requests | Creates a pull request for the configured repository. |
| `broadcast-gist` | GitHub Gists | Publishes or updates an authenticated Gist. |
| `broadcast-netlify` | Netlify Build Hook | Triggers the configured build hook for digest generation. |
| `broadcast-discord` | Discord | Posts a message to the configured webhook. |
| `gemini-generate` | Google AI Studio | Requests text completions from Gemini models. |

All functions expect the header `x-codex-capability` to match `CODEX_CAPABILITY_KEY` and surface metadata such as status, requestId, and payload size for audit overlays.

## Dashboard Ritual

`src/components/BroadcastActions.tsx` renders trigger buttons on the home page, letting custodians launch each broadcast from the dashboard. Every action replays the response payload so the lineage is observable.

## PowerShell Helpers

`Codex.psm1` exposes:

- `Invoke-CodexBroadcast` — wraps the HTTP calls for PR/Gist/Netlify/Discord.
- `Invoke-GeminiScroll` — simplifies Gemini prompts with status reporting.

Both commands require `$env:CODEX_CAPABILITY` and default to the production Netlify endpoints.

## Configuration

Set these environment variables in Netlify:

- `CODEX_CAPABILITY_KEY`
- `GITHUB_PAT`
- `GITHUB_REPO`
- `NETLIFY_BUILD_HOOK_URL`
- `DISCORD_WEBHOOK_URL`
- `GEMINI_API_KEY`

Local operators should export `CODEX_CAPABILITY` before running the PowerShell helpers.

> Every broadcast is now a traceable chord in the Codex lineage.
