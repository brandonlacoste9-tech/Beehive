# BeeHive Ritual Stack

BeeHive orchestrates creative rituals across agents, telemetry, and observability. This repository contains the Netlify runner,
Supabase schemas, and front-end surfaces for the swarm.

## Codex Agent Runner

Invoke the OpenAI-backed ritual agent via Netlify Functions:

```bash
curl -sS -X POST https://<site>.netlify.app/.netlify/functions/ritual-agent \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Summarize the BeeHive ritual stack"}'
```

Typical response payload (fields are stable for CodexReplay overlays):

```json
{
  "ok": true,
  "requestId": "7f3d0...",
  "output": "...",
  "metadata": {
    "jobId": "chatcmpl-...",
    "model": "gpt-4o-mini",
    "created": 1718132435,
    "usage": { "prompt_tokens": 24, "completion_tokens": 98, "total_tokens": 122 },
    "sizeBytes": 128,
    "status": "stop"
  }
}
```

Set the required environment variable before deploying:

```bash
netlify env:set OPENAI_API_KEY "<your-secret-key>"
```

Override the default `gpt-4o-mini` selection by defining `OPENAI_MODEL`.
