# Codex Scroll: Grand Launch Ritual
id: scroll-grand-launch
status: sealed
version: 1.0.0
last_updated: 2025-10-21
owners: ["keeper@beehive", "ops@beehive"]
links:
  - orchestrator: src/codex/orchestrator.ts
  - immutable_ledger: src/codex/_logger.ts
  - invocation_protocol: src/codex/invocation_protocol.ts
  - registry: src/context/ace-pack.ts
  - workflow_entry: netlify/functions/codex_review.ts

## Purpose
Seal the "Ritual of the First Bloom" by wiring the Cerebral Cortex (orchestrator),
the Immutable Ledger, and the Invocation Protocol into a single launch command.
This scroll documents the operational handshake for the Grand Launch phase of
AdGenXAI.

## Lifecycle
1. **Invoke** — Call `initiateGrandLaunch(config)` with operator metadata (`jobId`,
   `releaseTag`, `sizeBytes`). The invocation protocol mints an immutable
   request record.
2. **Record** — The ledger (`grandLaunchLedger`) tracks every event, preserving
   audit-ready history for Codex Replay overlays.
3. **Broadcast** — Helpers (`scheduleRemix`, `codexBadge`, `codexEcho`,
   `addHistoryEntry`) emit the remix signal, mint the launch badge, and echo the
   status to the swarm.
4. **Seal** — Completion marks the ledger entry as `completed` with
   `{ stage: 'sealed' }`, concluding the launch ritual.

## Invocation Payload
| Field | Required | Description |
| :--- | :--- | :--- |
| `operator` | ✅ | Human or agent triggering the launch. |
| `releaseTag` | ✅ | Semantic version or codename being launched. |
| `jobId` | ➖ | Optional job/queue identifier surfaced in overlays (auto-minted if omitted). |
| `sizeBytes` | ➖ | Artifact payload size for telemetry. |
| `notes` | ➖ | Operator remarks recorded on the ledger. |
| `payload` | ➖ | Free-form JSON for downstream rituals. |

## Telemetry Output
`initiateGrandLaunch` returns an object containing:
- `invocation`: Immutable invocation record with metadata + audit trail.
- `ledgerEntry`: Snapshot of ledger events for overlays and export badges.
- `badge`: Symbolic token minted for the launch broadcast.
- `broadcast`: Echo string for Codex replay widgets.
- `history`: Ordered `HistoryEntry[]` for StudioShare lineage notes.
- `overlay`: Structured metadata payload (jobId, stage, badge) for CodexReplay overlays.

## Runbook
- Use `registerCodexScrolls()` (see `src/context/ace-pack.ts`) to prime the
  orchestrator inside Netlify functions or other runtimes.
- Access immutable history via `resolveGrandLaunchLedger()` for dashboards or
  follow-on rituals.
- Pull overlay metadata with `resolveGrandLaunchOverlays()` or the registry's
  `orchestrator.overlays()` hook to update CodexReplay widgets.
- Netlify `codex_review` primes `globalThis.__codexGrandLaunchOverlays` so
  downstream scripts can render live overlay badges.
- Responses from `codex_review` include `x-codex-overlay` and
  `x-codex-overlay-updated-at` headers for quick CodexReplay ingestion.
- Update `scrolls/scroll_index.json` + `CHANGELOG.md` whenever the ritual evolves
  (see Swarm convention notes).

## Completion Checklist
- [x] Cerebral Cortex online (`orchestrator.ts`).
- [x] Immutable Ledger online (`_logger.ts`).
- [x] Invocation Protocol online (`invocation_protocol.ts`).
- [x] Netlify entrypoint sealed (`codex_review.ts`).
- [x] Registry cached in `registerCodexScrolls()`.
- [x] Grand Launch badge minted.
