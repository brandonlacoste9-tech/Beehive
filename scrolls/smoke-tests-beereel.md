# Smoke Test Scroll — BEEREEL `/create`

This scroll captures the curl harness required to validate the `/create` ritual end-to-end.
Run each invocation against a local or staging deployment **after** `npm run dev` is active.

## Ritual Overview
- Ensure environment variables: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`.
- Start the dev server: `npm run dev`.
- In another shell, execute the curls below; expected snippets are illustrative.

### /api/reels — create
```bash
curl -X POST http://localhost:3000/api/reels \
  -H 'content-type: application/json' \
  -d '{"persona":"founder","script":"Launch teaser","voice":"lumen"}'
```
Expected (200):
```json
{
  "ok": true,
  "reel": {
    "id": "uuid",
    "status": "queued",
    "persona": "founder"
  }
}
```

### /api/reels — list
```bash
curl http://localhost:3000/api/reels
```
Expected (200): Array of queued and completed reels with `status`, `createdAt`, and `persona`.

### /api/personas — catalog
```bash
curl http://localhost:3000/api/personas
```
Expected (200):
```json
{
  "ok": true,
  "personas": [
    { "id": "founder", "voice": "lumen", "mood": "upbeat" }
  ]
}
```

### /api/uploads — asset upload
```bash
curl -X POST http://localhost:3000/api/uploads \
  -H 'content-type: application/json' \
  -d '{"name":"hero-frame.png","type":"image/png"}'
```
Expected (200): signed upload URL payload with `url`, `fields`, and `expiresAt` keys.

Document actual responses during smoke runs and archive them under `docs/releases/` when sealing a ritual.
