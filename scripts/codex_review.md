# Codex PR Review Ritual

Automated Codex review of every PR.  
Invokes Codex agent, inscribes findings, and mints a changelog fragment.

## How it works

- On every PR, Codex CLI checks out the PR head, runs code review, and posts results to the PR.
- Auto-approval if no critical findings.
- Annotates issues, suggests patches, and escalates if necessary.

## Setup

1. Place `codex_review.yml` in `.github/workflows/`
2. Set `OPENAI_API_KEY` in repo secrets.
3. Ensure Codex CLI script is in `scripts/`

## Extensibility

- Custom feedback, patch logic, escalation
- Dry-run/test mode available (`codex_review_test.py`)
