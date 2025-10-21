# 📜 Codex CI Lineage & Artifact Protocol (v1)

> A unifying protocol for managing Codex-generated artifacts, test rituals, and status propagation across CI systems and contributor workflows.

---

## 🎯 Purpose

To establish a consistent, reliable, and traceable pattern for:
- Emitting and validating Codex artifacts
- Propagating artifact lineage metadata
- Ensuring cross-environment reproducibility
- Broadcasting CI status and failures in real time
- Defining contributor rituals and status badges

---

## 📦 Artifact Structure

Every Codex run must emit the following base artifacts:

| Artifact         | Format | Required | Description |
|------------------|--------|----------|-------------|
| `codex.json`     | JSON   | ✅       | Root metadata: version, test IDs, agent info |
| `report.html`    | HTML   | ✅       | Visualized test and generation summary |
| `coverage.xml`   | XML    | 🔄       | Required if test coverage is enabled |
| `lineage.lock`   | YAML   | ✅       | Lineage proof: input hashes, prompt lineage, run ID |

Each artifact must be checksum-stamped and uploaded to the Codex archive bucket or CI workspace.

---

## 🧬 Lineage Protocol

### Format: `lineage.lock`

```yaml
lineage:
  run_id: codex-2025-10-20-00123
  generated_by: Codex Agent v1.5.0
  inputs:
    prompt_hash: abc123def456
    template: enoch
    seed: 42
  context:
    branch: main
    commit: a1b2c3d4
    contributor: @beereel
    workflow: codex-ci.yml
```

> 📌 Purpose: enables reproducibility and forensic diffing

---

## 🏷️ Status Badge System

Codex workflows MUST expose a CI badge updated per commit to `main`:

| Status     | Icon | Trigger                            |
| ---------- | ---- | ---------------------------------- |
| `passing`  | ✅    | All artifacts present + tests pass |
| `warnings` | ⚠️   | Non-blocking issues (e.g. lint)    |
| `failing`  | ❌    | Blocking errors or test failures   |

### Badge Source:

GitHub Action: `badges/update-codex-badge.yml`
Badge file: `/badges/codex-status.svg`

---

## 📣 Slack Protocols

Codex Slack agents will follow structured notification blocks:

### ✅ Success Message

```json
{
  "status": "passing",
  "run_id": "codex-2025-10-20-00123",
  "branch": "main",
  "commit": "a1b2c3d4",
  "artifacts": ["codex.json", "report.html", "coverage.xml"]
}
```

### ❌ Failure Message (threaded)

Includes:

* Failed job name
* Exception or lint error
* Contributor handle
* Direct link to failed artifact preview

Channels: `#ci-status`, optionally `#codex-alerts`

---

## 🧙 Contributor Rituals

> Codex scroll authors MUST follow the protocol when submitting new artifacts or workflows:

* Use `codex run --all` before PR submission
* Validate outputs: `codex preview report.html`
* Confirm badge status in preview
* Attach `lineage.lock` to PR body
* Announce scroll status in `#codex-updates`

---

## 🔐 Verification

All lineage and artifact checksums are validated using:

```bash
codex verify lineage.lock
```

Failure to pass verification blocks artifact archiving.

---

## 📆 Versioning & Maintenance

* This is **v1.0.0** — any major protocol change requires:

  * Scroll amendment PR
  * Agent version bump
  * Notification in `#codex-ci`

---

## 🧾 TODO for v1.1+

* Agent-verified Slack replies with artifact diffs
* GitHub badge caching prevention script
* Codex-run signature validation (PGP optional)
* Archive migration script from v0.x

---

## 👥 Maintainers

* Codex CI Team
* @beereel
* Codex Agent Ops

---

> *"Let the lineage speak louder than code."* – Scroll Fragment 7.4b

