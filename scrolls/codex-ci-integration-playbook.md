# Codex Scroll: Codex CI Integration Playbook
id: scroll-codex-ci-integration
status: draft
version: 0.9.0
last_updated: 2025-10-25
owners: ["codex-leads@beehive", "ci-devops@beehive"]
review_due: 2025-10-25
lineage: codex-ci-playbook

## Summary
Codifies the Codex artifact integration flow for CI pipelines, covering artifact contracts, badge logic, Slack automation, troubleshooting, and rollout rituals. This scroll mirrors the draft that shipped in Codex StudioShare and retains the HTML/Python exports for downstream embeds.

## Artifacts Map
| Artifact | Format | Location | Consumer | Notes |
| --- | --- | --- | --- | --- |
| `codex.json` | JSON | `/build/output/` | QA Dashboard | Core metadata feed |
| `report.html` | HTML | `/ci/reports/` | Test Team | Visual output |
| `coverage.xml` | XML | `/ci/coverage/` | Codacy / Codecov | Badge + threshold logic |

## Codex Commands
| Purpose | Command | Notes |
| --- | --- | --- |
| Full run | `codex run --all` | Generates all outputs |
| Fast test | `codex run --test` | Unit-only CI check |
| Report preview | `codex preview report.html` | Visual test report |
| Burndown export | `codex burndown --daily` | Daily CI metrics |
| Slack notify | `codex notify slack` | Posts to `#ci-status`, `#codex-updates` |

## Badge Logic
- Statuses: ✅ `passing`, ⚠️ `warnings`, ❌ `failing`.
- Automation: `badges/update-badge.yml` regenerates the badge on pushes to `main` and PR merges.
- Cache hygiene: clear GitHub Pages cache or inspect `badge-bot` logs when badges stall.

## Burndown + Slack Integration
- `codex burndown --daily` materializes burndown metrics for replay dashboards.
- `codex notify slack` posts formatted summaries to `#ci-status` and `#codex-updates`, threading on failures.
- Supports block kit payloads; keep webhook secrets in CI vault.

## Troubleshooting Rituals
| Issue | Symptom | Fix |
| --- | --- | --- |
| Artifacts missing | CI success but no files | Ensure `persist-to-workspace` is configured in the workflow |
| Badge stuck | Status not updating | Clear GitHub Pages cache or review `badge-bot` logs |
| Slack silent | No channel updates | Verify webhook secret and bot scopes |

## Ready-to-Do Checklist
- [ ] Add `codex run --all` (or scoped variant) to merge pipeline
- [ ] Connect Slack bot + webhook secrets
- [ ] Validate badge rendering downstream
- [ ] Tune coverage thresholds in `codex.json`
- [ ] Share this playbook in `#eng-ci`

## Operational Metadata Schema
| job_id | artifact | size_bytes | status | last_exported |
| --- | --- | --- | --- | --- |
| `ci-${runNumber}` | `codex.json` | `~45_000` | `passing` | ISO8601 timestamp |
| `ci-${runNumber}` | `report.html` | `~120_000` | `passing` | ISO8601 timestamp |
| `ci-${runNumber}` | `coverage.xml` | `~35_000` | `passing` | ISO8601 timestamp |
> Surface these tuples in CodexReplay overlays whenever exports refresh. Update badge widgets with the same status payload.

## Distribution Formats
### Notion Blocks (internal knowledge base)
```
🔧 Codex CI Integration (v0.9 – Draft)
Owners: Codex Leads, CI DevOps
Status: Draft — target review Oct 25, 2025

Summary
This playbook documents Codex artifact integration in CI pipelines, including artifact maps, status badges, Slack alerts, troubleshooting, and rollout checklists.

Artifacts Map
- codex.json (JSON) @ build/output/ → QA Dashboard — Core metadata
- report.html (HTML) @ ci/reports/ → Test Team — Visual output
- coverage.xml (XML) @ ci/coverage/ → Codacy / Codecov — For badge + threshold logic

Codex Commands
- Full run: codex run --all — Generates all outputs
- Fast test: codex run --test — Unit-only CI check
- Preview: codex preview report.html — Visual test report

Badge Logic
- Statuses: ✅ passing, ⚠️ warnings, ❌ failing
- Updates via: badges/update-badge.yml
- Triggered on: push to main or PR merge

Burndown + Slack
- codex burndown --daily → daily metrics
- codex notify slack → posts to #ci-status, #codex-updates

Troubleshooting
- Artifacts missing → Check persist-to-workspace in CI config
- Badge stuck → Clear badge-bot cache or CDN
- Slack silent → Verify webhook + bot permissions

Checklist
- [ ] Add codex run to merge pipeline
- [ ] Connect Slack bot + webhook
- [ ] Validate badge rendering
- [ ] Tune coverage thresholds in codex.json
- [ ] Share playbook in #eng-ci
```

### Slack Drop (release announcement)
```
📢 Codex CI Integration Playbook (v0.9 draft) is live.
• Covers artifact map (codex.json, report.html, coverage.xml)
• Documents badge automation + burndown exports
• Slack + troubleshooting recipes
• Includes rollout checklist
Target review: Oct 25. Feedback welcome in-thread.
Scroll: scrolls/codex-ci-integration-playbook.md
```

### Confluence Layout
```
# Codex CI Integration Playbook (v0.9)
Status: Draft (Review by Oct 25, 2025)

## Artifacts Overview
- codex.json — JSON — /build/output/ — QA Dashboard — Core metadata
- report.html — HTML — /ci/reports/ — Test Team — Visual output
- coverage.xml — XML — /ci/coverage/ — Codacy / Codecov — Badge + thresholds

## Codex Commands
codex run --all — Full run
codex run --test — Unit CI check
codex preview report.html — HTML preview
codex burndown --daily — Daily metrics
codex notify slack — Slack notifications

## Badge Logic
Statuses: ✅ passing, ⚠️ warnings, ❌ failing
Automation: badges/update-badge.yml (push to main, PR merge)

## Slack Integration
#ci-status — Build alerts (thread failures)
#codex-updates — Burndown + coverage rollups

## Troubleshooting
Artifacts missing → Check persist-to-workspace
Badge stuck → Clear badge-bot cache/CDN
Slack silent → Verify webhook + permissions

## Checklist
- [ ] Add Codex jobs to CI
- [ ] Connect Slack app + webhook
- [ ] Validate coverage thresholds
- [ ] Review artifact locations in job config
- [ ] Post release notes in Slack
```

## Export Snippets
### HTML Embed
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Codex CI Integration Playbook (v0.9)</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; padding: 2em; background: #f9f9f9; color: #333; }
    h1, h2, h3 { color: #2c3e50; }
    table { width: 100%; border-collapse: collapse; margin-top: 1em; }
    th, td { padding: 8px 12px; border: 1px solid #ddd; }
    th { background-color: #f0f0f0; text-align: left; }
    code { background: #eee; padding: 2px 4px; border-radius: 4px; font-family: monospace; }
    .checklist li { list-style: none; margin: 6px 0; }
  </style>
</head>
<body>

<h1>🔧 Codex CI Integration Playbook (v0.9)</h1>

<p><strong>Status:</strong> Draft — feedback welcome. Target review by <strong>Oct 25, 2025</strong>.</p>

<h2>🔍 Summary</h2>
<p>This playbook documents Codex artifact integration in CI pipelines, including artifact maps, status badges, Slack alerts, troubleshooting, and rollout checklists.</p>

<h2>📦 Artifacts Map</h2>
<table>
  <tr>
    <th>Artifact</th><th>Format</th><th>Location</th><th>Consumer</th><th>Notes</th>
  </tr>
  <tr>
    <td>codex.json</td><td>JSON</td><td>/build/output/</td><td>QA Dashboard</td><td>Core metadata</td>
  </tr>
  <tr>
    <td>report.html</td><td>HTML</td><td>/ci/reports/</td><td>Test Team</td><td>Visual output</td>
  </tr>
  <tr>
    <td>coverage.xml</td><td>XML</td><td>/ci/coverage/</td><td>Codacy / Codecov</td><td>For badge + threshold logic</td>
  </tr>
</table>

<h2>🛠️ Codex Commands</h2>
<table>
  <tr><th>Purpose</th><th>Command</th><th>Notes</th></tr>
  <tr><td>Full run</td><td><code>codex run --all</code></td><td>Generates all outputs</td></tr>
  <tr><td>Fast test</td><td><code>codex run --test</code></td><td>Unit-only CI check</td></tr>
  <tr><td>Report preview</td><td><code>codex preview report.html</code></td><td>Visual test report</td></tr>
</table>

<h2>🏅 Badge Logic</h2>
<ul>
  <li>Statuses: ✅ <code>passing</code>, ⚠️ <code>warnings</code>, ❌ <code>failing</code></li>
  <li>Auto-updated via <code>badges/update-badge.yml</code></li>
  <li>Triggers on push to main or PR merge</li>
</ul>

<h2>📊 Burndown + Slack Integration</h2>
<ul>
  <li><strong>Burndown:</strong> <code>codex burndown --daily</code> generates daily CI metrics</li>
  <li><strong>Slack:</strong> <code>codex notify slack</code> sends messages to <code>#ci-status</code>, <code>#codex-updates</code></li>
  <li>Supports block formatting, threading on failures</li>
</ul>

<h2>🧯 Troubleshooting</h2>
<table>
  <tr><th>Issue</th><th>Symptom</th><th>Fix</th></tr>
  <tr><td>Artifacts missing</td><td>CI success, but no files</td><td>Check <code>persist-to-workspace</code></td></tr>
  <tr><td>Badge stuck</td><td>Status not updating</td><td>Clear GitHub Pages cache or badge-bot logs</td></tr>
  <tr><td>Slack silent</td><td>No update in channels</td><td>Check webhook secret + bot scopes</td></tr>
</table>

<h2>✅ Ready-to-Do Checklist</h2>
<ul class="checklist">
  <li>☐ Add <code>codex run</code> to merge pipeline</li>
  <li>☐ Connect Slack bot + webhook</li>
  <li>☐ Validate badge rendering</li>
  <li>☐ Tune coverage thresholds in <code>codex.json</code></li>
  <li>☐ Share playbook in <code>#eng-ci</code></li>
</ul>

<p><strong>Maintainers:</strong> Codex Leads, CI DevOps</p>

</body>
</html>
```

### Python CLI Helper
```python
def display_codex_ci_playbook():
    print("🔧 Codex CI Integration Playbook (v0.9)")
    print("Status: Draft — feedback welcome. Target review by Oct 25, 2025\n")

    print("🔍 Summary:")
    print("This playbook documents Codex artifact integration in CI pipelines, including artifact maps, status badges, Slack alerts, troubleshooting, and rollout checklists.\n")

    print("📦 Artifacts Map:")
    artifacts = [
        ("codex.json", "JSON", "/build/output/", "QA Dashboard", "Core metadata"),
        ("report.html", "HTML", "/ci/reports/", "Test Team", "Visual output"),
        ("coverage.xml", "XML", "/ci/coverage/", "Codacy / Codecov", "For badge + threshold logic"),
    ]
    for a in artifacts:
        print(f" - {a[0]} ({a[1]}) @ {a[2]} → {a[3]} — {a[4]}")

    print("\n🛠️ Codex Commands:")
    print(" - Full run:     codex run --all         # Generates all outputs")
    print(" - Fast test:    codex run --test        # Unit-only CI check")
    print(" - Preview:      codex preview report.html\n")

    print("🏅 Badge Logic:")
    print(" - Statuses: ✅ passing, ⚠️ warnings, ❌ failing")
    print(" - Updates via: badges/update-badge.yml")
    print(" - Triggered on: push to main or PR merge\n")

    print("📊 Burndown + Slack Integration:")
    print(" - codex burndown --daily   → daily metrics")
    print(" - codex notify slack       → posts to #ci-status, #codex-updates\n")

    print("🧯 Troubleshooting:")
    print(" - Artifacts missing → Check 'persist-to-workspace' in CI config")
    print(" - Badge stuck       → Clear badge-bot cache or CDN")
    print(" - Slack silent      → Verify webhook + bot permissions\n")

    print("✅ Ready-to-Do Checklist:")
    checklist = [
        "Add codex run to merge pipeline",
        "Connect Slack bot + webhook",
        "Validate badge rendering",
        "Tune coverage thresholds in codex.json",
        "Share playbook in #eng-ci",
    ]
    for item in checklist:
        print(f" - [ ] {item}")

# Run it
if __name__ == "__main__":
    display_codex_ci_playbook()
```
