# Codex Scroll: Budget Adapter Service
id: scroll-budget-adapter
status: draft
version: 0.1.0
last_updated: 2025-10-15
owners: ["ads@beehive"]

## Objective
Uniform `/POST {provider}/budget` API to sync directives to ad networks.

## API
`POST /{provider}/budget`  
Body: `{campaign_id, daily_budget, reason, request_id}`  
Auth: `X-API-Key` (per-tenant)  
Resp: `{status:"applied"|"failed", provider_ref}`

## Providers
- Meta, Google, TikTok (extensible via driver pattern)

## Telemetry
Emit to `budget_actions` with `status`.

## TODO
- [ ] Rate-limit + retry backoff
- [ ] Per-provider schema validation
