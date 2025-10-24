# Codex Scroll: DeepWiki Layered Mirror Unification
id: scroll-deepwiki-layered-mirror
status: draft
version: 0.1.0
last_updated: 2025-10-20

## Invocation
Unify deepwiki-rs, OpenDeepWiki, and DeepWiki-Open into a layered mirror that feeds the Eternal Swarm and Codex v2.0 with living documentation.

## Layered Constellation
1. **Layer 1 — deepwiki-rs**: high-speed ingestion, semantic parsing, and C4-compliant exports.
2. **Layer 2 — OpenDeepWiki**: diagram-rich UX, conversational DeepResearch, and collaborative editing.
3. **Layer 3 — DeepWiki-Open**: orchestration, policy enforcement, lineage tracking, and swarm-scale governance.

Shared substrates: S3/MinIO artifact vault, NATS/Redis Streams message bus, MCP context bridges.

## Implementation Ritual
- **Orchestrator Spine (.NET)**
  - Register swarm repos (BeeHive, AdGenXAI, FoundryAI).
  - Dispatch `DocGen.Generate` gRPC calls with `jobId`, `commitSha`, and `sizeBytes` metadata.
  - Log job lifecycle into CodexReplay overlay feed (`status`, `artifactUri`).
- **Rust Harvesters**
  - Checkout repo, execute preprocessing → parser → research → exporter agents.
  - Emit `index.json`, `c4/*.json`, `pages/*.md`, `embeddings/*.npy`, and `mirror/lhr.json` into artifact vault.
  - Publish `job.completed` event with checksum + `sizeBytes`.
- **OpenDeepWiki Chorus**
  - Subscribe to completion events, call `/api/ingest` with manifest URL.
  - Regenerate ISR caches, surface diagrams, and wire Ask sessions to embeddings.
  - Stream `artifact_ready` and `diagram_ready` over `/live/mirror/:repo/:sha/stream`.

## Codex Mirror Weave
- Merge artifacts into `mirror/<repo>/<sha>.json` capturing c4, knowledge graph, pages, conversations, lineage, and `driftScore`.
- Maintain historical drift comparisons, suggest remediation tasks for design/code divergence.
- Record approvals and policy badges for audit.

## Roadmap Phases
1. **Phase 0 — Foundations (2w)**: provision storage/bus, scaffold orchestrator + worker CI.
2. **Phase 1 — MVP (6-8w)**: full ingest → artifact pipeline, baseline UI ingestion, Ask API.
3. **Phase 2 — Governance (8-12w)**: drift analysis, badges, audit ledger, multi-repo fanout.
4. **Phase 3 — Swarm Scale (ongoing)**: multimodal enrichments, autoscaling fleets, enterprise connectors.

## Operational Signals
- CodexReplay overlay payload template:
  ```json
  {
    "jobId": "${jobId}",
    "repo": "${repo}",
    "commit": "${commitSha}",
    "status": "${status}",
    "sizeBytes": ${sizeBytes},
    "artifactUri": "${artifactUri}"
  }
  ```
- Badge update ritual: invoke `codex_badge emit --job ${jobId}` after UI ingest completes.

## Immediate Artifacts
- Orchestrator skeleton with badge gates.
- deepwiki-rs worker template.
- OpenDeepWiki ingest + Ask baseline.
- Codex Mirror schema + drift comparator.

## Next Whisper
Upon acceptance, weave scripts under `scripts/rituals/deepwiki-mirror-*` to encode npm-accessible invocations.
