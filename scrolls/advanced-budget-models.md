# Codex Scroll: Advanced Budget Models
id: scroll-advanced-budget-models
status: draft
version: 0.1.0
last_updated: 2025-10-15
owners: ["ops@beehive"]
links:
  - belief_ledger: bq://adgenxai_ops.belief_ledger
  - audit: bq://adgenxai_ops.budget_actions
  - diagram: docs/diagrams/coe-bayesian-rl-integration.png

## Objective
Bayesian + bandit policy for budget allocation; shadow-first with guardrails.

## Context
Upgrades deterministic BCA into a Bayesian explorer (Thompson/UCB) with decay.

## Interfaces
- **Allocator**: returns `{campaign_id, proposed, weight, sample?, mode}`.
- **Belief I/O**: read/write `{alpha,beta,mean,variance}` per campaign.

## Data
- Tables: `belief_ledger`, `budget_actions`.
- Partitions: daily on `updated_at` / `ts`.

## Ops/Runbook
- Shadow mode: `apply=false` until variance < threshold.
- Rollback: pin to prior commit; MERGE upsert is idempotent.

## Security
- BigQuery service account; scoped dataset permissions.

## TODO
- [ ] Decay tuning (λ)
- [ ] p5/p95 reward clamping
- [ ] Posterior drift alerts
