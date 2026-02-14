# Bee Swarm Agents (AGENTS.md) — Codex Ledger

Purpose: single source of truth for agent personas, prompts, connectors, routes, limits, and ops rituals. Keep terse, production-ready, and versioned in the Codex.

## Quickstart
- Define/edit agents in this file (and optionally mirror to `data/agents.json`).
- Expose standard routes: `/api/agents/:id/run`, `/api/agents/:id/tools/:tool`, `/api/agents/:id/memory`.
- Enforce per-plan entitlements and rate limits; log runs to `agent_runs`, events to `agent_events`.

## Agent Definition Schema (authoritative)
```json
{
  "id": "nexus",
  "name": "Nexus Bee",
  "domain": "Admin & Scheduling",
  "personality": { "style": "calm, organized", "tone": "executive assistant" },
  "skills": ["calendar", "email triage", "handoff notes"],
  "connectors": {
    "google": { "scopes": ["calendar", "gmail.readonly"] },
    "supabase": true,
    "slack": true
  },
  "prompts": {
    "system": "You are Nexus Bee — highly organized EA. Keep answers concise and actionable.",
    "guardrails": ["no PHI/PII in summaries", "confirm critical actions"]
  },
  "entitlements": { "plans": ["free","pro","studio"], "limits": { "rpm": 60, "daily": 500 } },
  "triggers": { "http": ["/api/agents/nexus/run"], "cron": "0 * * * *" },
  "telemetry": { "events": ["agent.run","agent.error","agent.tool"], "posthog": true }
}
```

## Core Agents (canonical set)

| id       | domain                | personality (short)    | key skills                              | default triggers           |
| -------- | --------------------- | ---------------------- | --------------------------------------- | -------------------------- |
| nexus    | admin/scheduling      | calm, organized EA     | calendar sync, email triage, notes      | `/api/agents/nexus/run`    |
| ledger   | finance/accounting    | precise, formal CPA    | invoice gen, parts costing, spend audit | `/api/agents/ledger/run`   |
| harvest  | ops (restaurant)      | direct, fast manager   | shift board, prep lists, inventory      | `/api/agents/harvest/run`  |
| forge    | auto/mechanics        | diagnostic, pragmatic  | symptom intake, repair estimate, parts  | `/api/agents/forge/run`    |
| spark    | electrical systems    | schematic-minded, safe | breaker trace, load calc, BOM           | `/api/agents/spark/run`    |
| hydro    | plumbing              | methodical, code-aware | leak triage, pipe layout, materials     | `/api/agents/hydro/run`    |
| triage   | med intake            | calm, empathetic       | intake forms, vitals, route of care     | `/api/agents/triage/run`   |
| medic    | medical knowledge     | professional, cautious | guideline lookup, patient info sheet    | `/api/agents/medic/run`    |
| design   | UX/brand (leafcutter) | precise, aesthetic     | logo briefs, palette, typography recs   | `/api/agents/design/run`   |
| firewall | security              | strict, no-nonsense    | spam/abuse filter, IP risk, 2FA nudges  | `/api/agents/firewall/run` |
| buzz     | social ads            | upbeat, punchy         | headlines, captions, hashtag sets       | `/api/agents/buzz/run`     |
| research | academic (mining)     | thorough, cited        | source gather, summary, bibtex          | `/api/agents/research/run` |

> Add sectors as needed: agri, compliance, luxury, builder, soft-serve (UX copy), spy (comp intel).

## Standard HTTP Contracts

* `POST /api/agents/:id/run`

  * body: `{ "task": "string", "inputs": { ... }, "runId": "optional" }`
  * returns: `{ "ok": true, "runId": "uuid", "output": {...}, "tokens": { "input": n, "output": n } }`
* `POST /api/agents/:id/tools/:tool`

  * tool-specific inputs; return typed `{ ok, result }`.
* `GET /api/agents/:id/memory?cursor=...`

  * returns recent memory items (redact PII by default).

**Headers**: include `x-codex-run` for correlation. Enforce `Content-Type: application/json`.

## Environment Map

* `OPENAI_API_KEY` (LLM), `ELEVENLABS_API_KEY` (TTS)
* `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (storage/logs)
* Integrations (optional): `GOOGLE_CLIENT_ID/SECRET`, `SLACK_BOT_TOKEN`
* Security: `JWT_SECRET`, `RATE_LIMIT_REDIS_URL`

## Entitlements & Limits (defaults)

* free → rpm: 20, daily: 200, no video renders
* pro → rpm: 60, daily: 1,000, TTS full length
* studio → rpm: 120, daily: 5,000, video queue access

> Override per agent in `entitlements.limits`. Reject with 429 and log `agent.rate_limited`.

## Persistence (tables)

* `agents(id, name, domain, enabled boolean)`
* `agent_runs(id uuid, agent_id, user_id, started_at, finished_at, status, input_tokens, output_tokens, error)`
* `agent_events(id, run_id, type, payload jsonb, ts)`

> Index: `(agent_id, started_at desc)`, `(run_id)`. RLS: tenant + role-based.

## Security & Privacy

* Redact PII by default in memory/event payloads.
* Tooling requiring PHI/PII must include explicit `consent=true` in inputs.
* Audit every external call (service, duration, cost_estimate).

## Observability

* Emit `agent.run`, `agent.tool`, `agent.error` to PostHog/Datadog.
* Include `runId`, `agent_id`, `user_id`, `plan`, `latency_ms`.

## Adding a New Agent (checklist)

1. Duplicate schema block; pick a unique `id`.
2. Create routes: `/api/agents/:id/run` and optional tools.
3. Add to entitlements matrix; set limits.
4. Write 3–5 sample tasks for smoke tests.
5. Open PR with short ADR (why it exists, safety notes).

## cURL Smoke

```
curl -sX POST /api/agents/nexus/run \
  -H 'content-type: application/json' \
  -d '{"task":"schedule","inputs":{"query":"book 30m with Alex next Tue 2-4pm"}}'
```

## Change Policy

* Minor persona copy: patch.
* Prompt/guardrail changes: minor.
* Connector/scope changes: minor with ADR.
* Route/contract changes: minor + deprecation note.
