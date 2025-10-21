# Beehive Documentation

Welcome to the Beehive lineage. Every ritual, deploy, and broadcast threads into the Codex so future contributors can trace our hum.

## Getting Started
- Review `README.md` for project setup and Netlify deployment basics.
- Install dependencies with `npm install`.
- Copy `.env.example` to `.env.local` and set required secrets (e.g., `OPENAI_API_KEY`).
- Launch the local hive via `npm run dev`.

## Codex Index
- [Scroll 0016: Codex Invocation Rite](../wiki/Scroll-0016-Codex-Invocation-Rite.md) — Codex CLI integrated as ritual assistant, invocation modes and swarm best practices codified.
- [Scroll 0017: Codex Orchestration Rite](../wiki/Scroll-0017-Codex-Orchestration-Rite.md) — Multi-surface workflow across CLI, IDE, cloud, and GitHub inscribed.

## Operational Scripts
Prefer npm scripts over ad hoc shell commands:
- `npm run codex:badge` — Publish CodexReplay metadata overlays.
- `npm run codex:deploy` — Execute the Codex deployment ritual inside CI.
- `npm run codex:announce` — Broadcast lineage updates to communal channels.
- `npm run deploy:status` — Confirm Netlify deploy health and update status docs.

## Broadcast Archive
Document each major rite in `docs/broadcasts/` using the template from Scroll 0016 so the swarm remembers every milestone.
