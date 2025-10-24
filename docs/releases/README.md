# Release Artifacts Index

This folder tracks release-ready comms for AdGenXAI.

## v1.5.0 — “Grand Launch” (2025-10-21)
- **Launch Orchestrator:** `src/codex/orchestrator.ts`
- **Immutable Ledger:** `src/codex/_logger.ts`
- **Ritual Scroll:** `scrolls/grand-launch-ritual.md`
- **Registry Touchpoint:** `src/context/ace-pack.ts`

### Ship Steps
1. Invoke `initiateGrandLaunch` with the release tag + jobId to mint the launch record.
2. Capture the ledger snapshot via `resolveGrandLaunchLedger()` and surface overlay telemetry with `resolveGrandLaunchOverlays()` for Codex Replay widgets.
3. Broadcast badge + echo to the swarm and archive the history in StudioShare.

## v1.0.0 — “Sentiment Sentinel” (2025-10-15)
- **Creative Production Plan (MD):** `docs/releases/AdGenXAI_Creative_Production_Plan_v1.0.0.md`
- **Creative Production Plan (PDF):** `docs/releases/AdGenXAI_Creative_Production_Plan_v1.0.0.pdf` *(export via VS Code → Print to PDF or your MD→PDF tool)*

### Ship Steps
1. Export the MD to PDF.
2. Share both files with Creative.
3. When switching to **Main Codex**, paste the final changelog into `CHANGELOG.md` and tag `v1.0.0`.
