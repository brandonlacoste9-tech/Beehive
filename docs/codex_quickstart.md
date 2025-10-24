# Codex Quickstart: AI Content Agent Lineage

This guide outlines how to run, observe, and replay the AI Content Agent inside the Codex ecosystem.

## Prerequisites
- Python 3.11+
- Node 18+ (for n8n self-hosted or Docker runtime)
- Access to Supabase project for job metadata storage
- API keys (store in `.env` or platform secrets):
  - `CONTENT_AGENT_APIFY_TOKEN`
  - `CONTENT_AGENT_OPENROUTER_KEY`
  - `CONTENT_AGENT_SLACK_WEBHOOK`
  - `CONTENT_AGENT_LINKEDIN_TOKEN`
  - `CONTENT_AGENT_PERPLEXITY_MODEL` (e.g. `perplexity/pplx-70b-online`)
  - `CONTENT_AGENT_CLAUDE_MODEL`
  - `CONTENT_AGENT_GPT4O_MODEL`

## Setup Ritual
1. Copy `.env.example` to `.env` and fill in secrets.
2. Install Python dependencies: `pip install -r requirements.txt`.
3. Launch n8n (Docker or `n8n start`) and import `workflows/n8n/content_agent_main.json`.
4. Configure n8n credentials by binding each HTTP Request node to the environment variables documented in `workflows/n8n/connectors.md`.
5. Run `python scripts/scrape_appify.py --dry-run --topic "your topic"` to verify ingress.
6. Execute `python scripts/validate_perplexity.py --fixture tests/fixtures/perplexity_sample.json` to confirm validation heuristics.
7. Trigger the n8n workflow manually with a sample `jobId`.
8. After human approval in Slack, run `python scripts/publish_linkedin.py --dry-run tests/fixtures/draft_payload.json` to inspect the publishing payload.

## Observability & Replay
- Every script writes structured JSON logs to `scrolls/latest.ndjson` by default.
- To replay a run, capture the `jobId` and run `python scripts/utils/formatting.py --replay <jobId>`; this prints a deterministic digest of the stored artefacts.
- GitHub Actions store artefacts (`content-agent-ci`) containing the dry-run payload and validation logs. Use `gh run download` for deeper inspection.

## Governance Checklist
- Ensure brand voice updates happen in `docs/prompts.md` and are reviewed by Codex Sentinel.
- Update banned phrases across scripts and prompts simultaneously to avoid drift.
- Review LinkedIn API scopes quarterly; rotate tokens if unused for 60 days.

## Next Steps
- Connect Appify actor to Supabase for fully automated job intake.
- Expand fixtures with additional edge cases (e.g. stale citations, banned phrases) before production rollout.
