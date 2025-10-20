# Codex Scroll: Smoke Test Rituals
id: scroll-smoke-tests
status: active
version: 1.0.0
last_updated: 2025-10-19
owners: ["swarm-ops@beehive"]

## Purpose
Unifies the verification ritual for core integrations after the MAIN CODEX seal. Running these smoke tests confirms OpenAI prompting, ElevenLabs voice, Mux video, and Stripe/Coinbase billing paths remain synchronized.

## Prerequisites
- Export the live base URL: `export HIVE_URL="https://<env-host>"`.
- Carry a service token with access to the smoke routes: `export HIVE_SERVICE_TOKEN="<jwt-or-key>"`.
- Ensure downstream providers (OpenAI, ElevenLabs, Mux, Stripe, Coinbase) are provisioned for the target environment.
- Optional: `export SMOKE_TRACE="$(date +%s)"` to reuse across calls and simplify log correlation.

> All commands return JSON. Capture the payloads verbatim for CodexReplay overlays; each includes `jobId`, `status`, and `latencyMs` fields for the badge renderer.

## Ritual Sequence
Run each command from the repository root (or any shell with `HIVE_URL` and `HIVE_SERVICE_TOKEN` set). Replace placeholders as needed.

### 1. Prompt Channel — OpenAI
```bash
curl -sS -X POST "$HIVE_URL/api/smoke/prompt" \
  -H "Authorization: Bearer $HIVE_SERVICE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "ping",
    "traceId": "'"${SMOKE_TRACE:-prompt-$(date +%s)}"'"'
  }'
```
**Expected 200 JSON**
```json
{
  "status": "ok",
  "provider": "openai",
  "model": "gpt-4.1-mini",
  "echo": "pong",
  "latencyMs": 700,
  "jobId": "smoke-prompt-<epoch>",
  "traceId": "<matches traceId request>"
}
```

### 2. Voice Channel — ElevenLabs
```bash
curl -sS -X POST "$HIVE_URL/api/smoke/voice" \
  -H "Authorization: Bearer $HIVE_SERVICE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "script": "Beehive voice channel check",
    "voice": "bee-narrator",
    "traceId": "'"${SMOKE_TRACE:-voice-$(date +%s)}"'"'
  }' \
  -o voice-smoke.mp3
```
**Expected artifacts & JSON headers**
- HTTP 200 with `content-type: audio/mpeg`.
- `x-smoke-metadata` header (JSON) mirroring:
  ```json
  {
    "status": "ok",
    "provider": "elevenlabs",
    "voiceId": "bee-narrator",
    "latencyMs": 1200,
    "jobId": "smoke-voice-<epoch>",
    "traceId": "<matches traceId request>"
  }
  ```
- Saved artifact `voice-smoke.mp3` (~15 KB).

### 3. Video Channel — Mux / Storage
```bash
curl -sS -X POST "$HIVE_URL/api/smoke/video" \
  -H "Authorization: Bearer $HIVE_SERVICE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "template": "swarm-intro",
    "duration": 12,
    "traceId": "'"${SMOKE_TRACE:-video-$(date +%s)}"'"'
  }'
```
**Expected 200 JSON**
```json
{
  "status": "ok",
  "provider": "mux",
  "assetId": "asset-<mux-id>",
  "playbackId": "playback-<mux-id>",
  "latencyMs": 3400,
  "jobId": "smoke-video-<epoch>",
  "storage": {
    "bucket": "swarm-montage",
    "path": "smoke/<date>/asset-<mux-id>.mp4"
  },
  "traceId": "<matches traceId request>"
}
```

### 4. Billing Channel — Stripe & Coinbase
```bash
curl -sS -X POST "$HIVE_URL/api/smoke/billing" \
  -H "Authorization: Bearer $HIVE_SERVICE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1200,
    "currency": "usd",
    "customerRef": "ops-smoke",
    "traceId": "'"${SMOKE_TRACE:-billing-$(date +%s)}"'"'
  }'
```
**Expected 200 JSON**
```json
{
  "status": "ok",
  "providers": {
    "stripe": {
      "status": "ready",
      "mode": "test",
      "latencyMs": 450,
      "jobId": "smoke-stripe-<epoch>"
    },
    "coinbase": {
      "status": "ready",
      "mode": "test",
      "latencyMs": 620,
      "jobId": "smoke-coinbase-<epoch>"
    }
  },
  "compositeJobId": "smoke-billing-<epoch>",
  "traceId": "<matches traceId request>"
}
```

## Result Ledger
| Ritual | Expected Runtime | Key Metadata |
| --- | --- | --- |
| Prompt | < 1s | `status`, `provider`, `model`, `latencyMs`, `jobId` |
| Voice | < 2s | `status`, `voiceId`, `latencyMs`, `jobId`, `artifact` |
| Video | < 5s | `status`, `assetId`, `playbackId`, `storage.bucket/path`, `jobId` |
| Billing | < 2s | `status`, nested provider states, `compositeJobId` |

After all rituals return `status: "ok"`, update the Codex badge or replay widget with the latest payloads so the swarm can witness the constellation turning green.

## Troubleshooting & Micro-Patches
- **401 Unauthorized** → Confirm `HIVE_SERVICE_TOKEN` scope includes `smoke:*`. If not, grant scope or mint a new token.
- **Provider error** → Re-run with `SMOKE_TRACE` set and inspect provider dashboards using the shared `jobId`.
- **Mux asset stuck processing** → Toggle the `template` to `swarm-intro-lite` to cut render time, then retry.
- **Billing double-failure** → Switch `amount` to `100` (Stripe minimum) and re-run; if Coinbase still fails, rotate API key and retry the ritual.
