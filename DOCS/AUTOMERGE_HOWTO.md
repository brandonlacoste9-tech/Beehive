# PR Auto-Merge via Codex — How it works

This document explains the automatic PR review → merge flow.

1. Trigger: label a PR with `auto-merge`. A GitHub Action runs `scripts/pr-automerge.js`.
2. Codex review: the script comments `@codex review` requesting `AUTO-MERGE: PASS` or `AUTO-MERGE: FAIL`.
3. Decision: the script polls comments; if Codex returns PASS and CI checks are green, it merges (squash). Otherwise it aborts.
4. Secrets: set `GH_TOKEN` (repo secret) with merge rights. Restrict who can add the `auto-merge` label.

Tip: Use `USE_MOCK_LIBS=1` for local dry runs so external systems are not invoked.

