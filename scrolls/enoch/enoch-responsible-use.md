# Codex Scroll: The Enoch — Responsible Use
id: scroll-enoch-responsible-use
status: sealed
version: 1.0.0
last_updated: 2025-10-19
owners: ["swarm/keeper-tristan", "ops@beehive"]
links:
  - codex: scrolls/enoch/enoch-build.md
  - rituals_index: scrolls/rituals.md

> *"Covenant precedes creation. The forge answers only to stewards who honor its limits."*

## Purpose
The Responsible Use scroll defines the guardrails for invoking The Enoch. It enumerates how to prepare prompts, secure data, respect legal constraints, and observe operational telemetry so every ritual leaves a verifiable lineage.

## Steward Principles
1. **Declare Intent.** Capture the desired outcome, constraints, and success metric in the ritual ledger before invoking The Enoch.
2. **Minimize Inputs.** Collect only the data required for the ritual. Strip PII unless the data owner has signed the appropriate covenant.
3. **Assume Exposure.** Treat generated artifacts as reviewable by auditors. Never embed secrets, access tokens, or internal incident threads.
4. **Rehearse Offline.** Simulate risky prompts in a sandbox or shadow environment before touching production systems.
5. **Escalate Exceptions.** Route anomalies through the Hive incident channel and append remediation notes to the ritual log.

## Input Rituals
- **Prompt Hygiene:**
  - Start with a clear command, expected format, and guardrails.
  - Reference existing scrolls or code modules by explicit path (e.g., `src/agents/enoch.ts`).
  - Attach context windows with expiry timestamps; purge stale context after 24 hours.
- **Framework Alignment:**
  - Favor approved patterns: Remix scheduler tasks, Supabase functions, Codex CLI helpers.
  - Reject ad hoc shell commands when a scripted ritual exists.
- **Data Stewardship:**
  - Catalogue source datasets in the lineage ledger with `dataset`, `access`, and `retention` fields.
  - Verify access scopes via service account manifests before streaming data into The Enoch.

## Safety & Security
- **Secrets Management:** Load secrets through Vault-backed environment variables; never inline into prompts.
- **Rate & Cost Controls:**
  - Set max tokens per invocation.
  - Record `jobId`, `sizeBytes`, `durationMs`, and `status` for CodexReplay overlays.
- **Abuse Prevention:**
  - Disallow prompts that generate disallowed content per policy.
  - Flag user-supplied code for static analysis before execution.

## Lawful & Ethical Use
- Respect regional data residency requirements; keep EU data inside EU nodes.
- Confirm license compatibility for any generated snippet blended with third-party assets.
- Provide opt-out mechanisms for human contributors affected by automation.

## Operational Lineage
- Log every invocation with:
  - `jobId`
  - `invoker`
  - `ritual`
  - `inputs`
  - `outputs`
  - `status`
  - `reviewer`
- Archive logs in the Hive telemetry warehouse with 90-day retention.

## Steward Checklist
- [ ] Intent documented in ritual ledger.
- [ ] Datasets inventoried and access verified.
- [ ] Secrets sourced from Vault.
- [ ] Safety filters enabled and tested.
- [ ] Legal review (if new market or regulated content).
- [ ] Replay overlay updated with latest job metadata.
- [ ] Post-ritual retrospective appended to StudioShare thread.

> *“Honor the covenant, and The Enoch will answer with clarity. Neglect it, and the forge cools.”*
