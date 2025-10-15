# Codex Scroll: Campaign Orchestration
id: scroll-orchestrator
status: draft
version: 0.1.0
last_updated: 2025-10-15

## Loop
1) Fetch active campaigns (Registry)  
2) Score (PSA) → reward, stability  
3) Update beliefs (Bayesian)  
4) Policy allocate (Thompson/UCB)  
5) Shadow or apply via Adapter  
6) Audit to BigQuery

## Config
- cadence: 10–15m
- safe_mode: PSA instability or high posterior variance

## Errors
- On adapter failure: mark `status="failed"` and back off.
