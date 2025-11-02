# Hive Rituals Index

A centralized registry for operational rituals in the Beehive repository. Every contributor can reference this scroll for the latest templates and checklists.

---

## 🟡 Ritual Seal Template
- **File:** `.github/RITUAL-TEMPLATE.md`
- **Purpose:** Standardizes how every milestone or process seal is inscribed in `CHANGELOG.md` and `scrolls/registry.md`.

## 🟡 Pre-Merge Ritual Checklist
- **File:** `.github/MERGE-Ritual.md`
- **Purpose:** Ensures every pull request is clean, reviewed, and follows ceremonial standards before merging.

## 🟡 Post-Merge Checklist
- **File:** `.github/post-merge-checklist.md`
- **Purpose:** Guides verification of deployments, dashboard integrity, and documentation after every merge.

## 🟣 Grand Mutation Loop Orchestrator
- **File:** `netlify/functions/orchestrator.ts`
- **Purpose:** Executes declarative ritual graphs, balancing sequential and parallel steps with bounded concurrency, retries, and webhook fan-out.
- **Inputs:** `POST` body describing rituals (`sequential`/`parallel` groups of actions) plus optional `idemKey` for idempotent replays.
- **GitHub Hydration:** Requires `GITHUB_REPO` with `GITHUB_TOKEN`/`GITHUB_PAT`/`CODEX_GITHUB_TOKEN` to hydrate pull-request context; degrades gracefully without credentials.
- **Runtime Limits:** Tune `RITUAL_TIMEOUT_MS`, `RITUAL_MAX_RETRIES`, and `RITUAL_PARALLEL_LIMIT` to shape orchestration pressure.
- **Telemetry:** Returns `codexReplayOverlay` payloads and an `x-replay-ready` header so badges and CodexReplay pick up `replayReady`, `status`, `durationMs`, `sizeBytes`, `jobId`, and ritual counts.

### Orchestration Telemetry
- Overlay payloads are also written to the mutation log via `_logger.logMutation`, refreshing `ritual-badge` and `ritual-metrics` stores.
- Set `LOG_FORMAT=plain` locally to mirror console traces while keeping JSON logs in production.
- `codexReplayOverlay` is the canonical field for StudioShare/Badge consumers; ensure downstream rituals propagate the payload when chaining.

---

**How to use:**
- Review this index before every PR or milestone.
- Follow the linked rituals for consistent, audit-ready operations.  
- Update this index when new ritual scrolls are added.

---

> The Hive’s lineage is protected by ritual. Every merge, every seal, every contributor follows the same path.