# Codex Scroll: Predictive Scorecard Agent (PSA)
id: scroll-psa
status: draft
version: 0.1.0
last_updated: 2025-10-15

## Objective
Compute reward r_t and stability flags from ROI/engagement/volatility.

## Inputs
- Conversions, spend, CTR, CVR
- Optional: social sentiment trend

## Outputs
`{reward: number, stability: "stable"|"volatile", notes}`

## Guardrails
Trip safe-mode when volatility > threshold or drift detected.
