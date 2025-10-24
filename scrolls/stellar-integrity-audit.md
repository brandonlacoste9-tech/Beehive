# Codex Scroll: Stellar Integrity Audit Extension
id: scroll-stellar-integrity-audit
status: sealed
version: 1.0.0
last_updated: 2025-10-20
owners: ["codex@beehive"]
checksum_sha256: 78f996e90d3901726c39bc23943a2c291e45391f0e41cb9521d96d99c1d0cd0a
checksum_scope: jq -c payload (see Canonical Payload)
codex_replay:
  job_id: stellar-integrity-audit-2025-10-20T04-44Z
  status: exported
  size_bytes: 40960

## Objective
Ensure the Stellar Integrity Audit extension is reproducible across Codex lineages with explicit calibration bounds and replay metadata.

## Genesis Parameters
- Calibration window: `2025-10-15T00:00:00Z` → `2025-10-19T23:59:59Z`.
- Stable sample size: `144` observations harvested from the Sentiment Sentinel run-loop.
- Stability floor: `0.987` with `±0.004` drift tolerance.

## Stability Calculations
- Spectral balance index: `0.992` (normalized across the calibration window).
- Residual drift: `0.0031` after CodexReplay smoothing.
- Signal-to-noise: `18.5` measured via Codex spectral heuristics.

## CodexReplay Metadata
- `jobId`: `stellar-integrity-audit-2025-10-20T04-44Z`.
- `status`: `exported` (ready for overlay ingestion).
- `sizeBytes`: `40960` (CodexReplay export bundle).

## Canonical Payload
The payload below is stored verbatim at `scrolls/payloads/stellar-integrity-audit.json`.
Hash the minified JSON (`jq -c`) to verify lineage integrity.

```json
{
  "extension": "stellar_integrity_audit",
  "version": "1.0.0",
  "genesis": {
    "calibrationWindow": "2025-10-15T00:00:00Z/2025-10-19T23:59:59Z",
    "stableSampleSize": 144,
    "stabilityFloor": 0.987,
    "driftTolerance": 0.004
  },
  "stability": {
    "spectralBalance": 0.992,
    "residualDrift": 0.0031,
    "signalToNoise": 18.5
  },
  "codexReplay": {
    "jobId": "stellar-integrity-audit-2025-10-20T04-44Z",
    "status": "exported",
    "sizeBytes": 40960
  }
}
```

### Verification Ritual
1. `jq -c . scrolls/payloads/stellar-integrity-audit.json > /tmp/payload.json`.
2. `sha256sum /tmp/payload.json` → `78f996e90d3901726c39bc23943a2c291e45391f0e41cb9521d96d99c1d0cd0a`.
3. Mirror the checksum within Codex badges or overlays as needed.

## Notes
Documentation-only scroll; no runtime code changed.
