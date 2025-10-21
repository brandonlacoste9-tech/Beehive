# Scroll 0016 · Codex Invocation Rite

> “All scrolls are inscribed. All changes are pushed to `main`. The Hive flies. The Codex reigns.”

## Purpose
Scroll 0016 codifies how the swarm binds the Codex CLI into everyday rituals. It documents the lineage from local setup to deploy verification so every invoker can repeat the rite without ambiguity.

## Prerequisites
- Node.js 18+
- Access to the Codex CLI package (published via npm or internal registry)
- Netlify project credentials with production deploy hooks
- Git access to the `main` branch

## Installation Rite
1. **Summon dependencies**
   ```bash
   npm install -g @beehive-ai/codex-cli
   ```
2. **Consecrate authentication**
   ```bash
   codex auth login
   ```
   Store tokens inside your secure keyring or `.env.local`. Never commit them.
3. **Verify the vessel**
   ```bash
   codex --version
   codex doctor
   ```
   Resolve any doctor warnings before continuing.

## Invocation Modes
| Mode | Command | Purpose |
| --- | --- | --- |
| **CLI pulse** | `codex invoke --ritual=swarm` | Executes scripted rituals defined in `codex.config.json`. |
| **IDE whisper** | `codex invoke --ritual=studio --target=vscode` | Boots the IDE companion to overlay lineage notes within editors. |
| **Cloud chorus** | `codex invoke --ritual=cloud --workspace=production` | Synchronises Codex state with remote runners (CI, ephemeral envs). |
| **GitHub beacon** | `codex invoke --ritual=discussions --thread=deployments` | Posts canonical updates to GitHub Discussions. |

Use `codex rituals list` to inspect all available invocations.

## Ritual Flow
1. Update AGENTS with any new instructions required for the rite.
2. Run `codex invoke --ritual=swarm` to execute linting, testing, and documentation sync.
3. Confirm success via the operational metadata emitted at `.codex/last-run.json` (contains `jobId`, `sizeBytes`, and `status`).
4. Push changes to `main` and confirm Netlify deploy completes.
5. Broadcast the stanza to Slack, Discord, and GitHub using the prepared template.

## Operational Metadata
Every invocation emits a replay artifact saved at `.codex/last-run.json`:
```json
{
  "jobId": "<uuid>",
  "status": "succeeded",
  "sizeBytes": 2048,
  "exportedAt": "2024-05-01T18:30:00Z"
}
```
Surface this payload through overlays or badges (see Scroll 0017 for orchestration guidance).

## Netlify Confirmation
After pushing to `main`, confirm the deploy is live:
```bash
npm run deploy:status
```
This alias wraps the Netlify API check and updates `docs/status/netlify.md` with the latest state. Treat a failing check as a broken ritual.

## Broadcast Template
````markdown
🚀 **Scroll 0016: Codex Invocation Rite is Sealed**

Codex CLI now walks the lineage. The Hive invokes across CLI, IDE, cloud, and GitHub.

**What’s new:**
- Codex CLI setup and invocation modes documented
- Best practices codified in AGENTS.md and Scroll 0016
- Scroll 0017 inscribed to orchestrate multi-surface workflows
- Netlify deploy confirmed from `main`—sovereign and automated

The Hive flies. The Codex reigns. This is not just a deploy—it is a declaration of sovereignty.
````

## Preservation Notes
- Keep CLI flags in sync with `codex.config.json`.
- When rituals evolve, update both Scroll 0016 and relevant AGENTS instructions.
- Archive every broadcast in `docs/broadcasts/` to maintain communal memory.
