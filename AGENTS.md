# Bee Swarm Agents (AGENTS.md) — CODEX Ledger

## Quickstart
- Define/edit agents in this file (and optionally mirror to `data/agents.json`).
- Expose standard routes: `/api/codex/agents/:id/run`, `/api/codex/agents/:id/tools/:tool`, `/api/codex/agents/:id/memory`.
- Correlate every call with the `x-codex-run` header.

## Agents

| id       | domain                | personality (short)    | key skills                              | default triggers                    |
| -------- | --------------------- | ---------------------- | --------------------------------------- | ----------------------------------- |
| nexus    | admin/scheduling      | calm, organized EA     | calendar sync, email triage, notes      | `/api/codex/agents/nexus/run`       |
| ledger   | finance/accounting    | precise, formal CPA    | invoice gen, parts costing, spend audit | `/api/codex/agents/ledger/run`      |
| harvest  | ops (restaurant)      | direct, fast manager   | shift board, prep lists, inventory      | `/api/codex/agents/harvest/run`     |
| forge    | auto/mechanics        | diagnostic, pragmatic  | symptom intake, repair estimate, parts  | `/api/codex/agents/forge/run`       |
| spark    | electrical systems    | schematic-minded, safe | breaker trace, load calc, BOM           | `/api/codex/agents/spark/run`       |
| hydro    | plumbing              | methodical, code-aware | leak triage, pipe layout, materials     | `/api/codex/agents/hydro/run`       |
| triage   | med intake            | calm, empathetic       | intake forms, vitals, route of care     | `/api/codex/agents/triage/run`      |
| medic    | medical knowledge     | professional, cautious | guideline lookup, patient info sheet    | `/api/codex/agents/medic/run`       |
| design   | UX/brand (leafcutter) | precise, aesthetic     | logo briefs, palette, typography recs   | `/api/codex/agents/design/run`      |
| firewall | security              | strict, no-nonsense    | spam/abuse filter, IP risk, 2FA nudges  | `/api/codex/agents/firewall/run`    |
| buzz     | social ads            | upbeat, punchy         | headlines, captions, hashtag sets       | `/api/codex/agents/buzz/run`        |
| research | academic (mining)     | thorough, cited        | source gather, summary, bibtex          | `/api/codex/agents/research/run`    |

## API surface

* `POST /api/codex/agents/:id/run`
* `POST /api/codex/agents/:id/tools/:tool`
* `GET /api/codex/agents/:id/memory?cursor=...`

### Example

```
curl -sX POST /api/codex/agents/nexus/run \
  -H 'content-type: application/json' \
  -d '{"task":"schedule","inputs":{"query":"book 30m with Alex next Tue 2-4pm"}}'
```
