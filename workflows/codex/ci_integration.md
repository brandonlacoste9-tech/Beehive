# Codex CI Integration Notes

- **Review Hook:** `.github/workflows/codex-review.yml` invokes Codex Sentinel via reusable workflow.
- **Dry-Run Artifact:** `.github/workflows/content-agent-ci.yml` archives `artifacts/dry-run-payload.json` and `artifacts/validation-log.ndjson` for replay.
- **PR Comment:** `workflows/codex/pr_comment.md` templated comment posted after Sentinel verdict.
- **Failure Escalation:** Sentinel `status=revise` triggers Slack alert via `CODEx_SLACK_WEBHOOK` (configure separately).
