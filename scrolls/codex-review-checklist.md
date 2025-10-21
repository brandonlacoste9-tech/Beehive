# Codex Review Ritual: API Key Validation & Workflow Re-run

This checklist keeps the Codex review ritual healthy after rotating OpenAI credentials. Copy it into your runbook or execute it directly.

## 1. Verify the key is active and has quota

### macOS / Linux (bash)

```bash
export OPENAI_API_KEY="<your-new-key>"

# Validate the key by requesting the model catalog (HTTP 200 ⇒ key works).
curl -sS https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY" | head

# Sanity check quota and permissions on the production model.
curl -sS https://api.openai.com/v1/responses \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"gpt-5-pro","input":"ping","max_output_tokens":8}'
```

A healthy key returns HTTP 200 with JSON. HTTP 429 / 402 indicates quota exhaustion or billing lock.

### Windows (PowerShell)

```powershell
$env:OPENAI_API_KEY = "<your-new-key>"

Invoke-RestMethod -Uri "https://api.openai.com/v1/models" -Headers @{ Authorization = "Bearer $env:OPENAI_API_KEY" }

Invoke-RestMethod -Method Post -Uri "https://api.openai.com/v1/responses" `
  -Headers @{ Authorization = "Bearer $env:OPENAI_API_KEY"; "Content-Type" = "application/json" } `
  -Body (@{ model = "gpt-5-pro"; input = "ping"; max_output_tokens = 8 } | ConvertTo-Json)
```

> If your organisation uses a custom base URL or org headers, add them to each call. Avoid pasting raw keys into logs or pull requests.

## 2. Rotate the GitHub Actions secret (after changing keys)

Update the CI secret so Codex review jobs stay authenticated.

```bash
gh secret set OPENAI_API_KEY --repo <owner>/<repo> --body "$OPENAI_API_KEY"
```

Or visit **Settings → Secrets and variables → Actions → OPENAI_API_KEY → Update**. Mirror the new key anywhere else it is consumed (Netlify environment variables, Supabase edge functions, etc.).

## 3. Restart the codex review workflow run

Because `.github/workflows/codex_review_exec.yml` only listens to `pull_request` events, manual dispatch via `gh workflow run` will not fire. Use one of the following instead:

### GitHub UI

1. Open the pull request.
2. Navigate to **Checks**.
3. Open the failed run and choose **Re-run failed jobs** (or **Re-run all jobs**).

### GitHub CLI

```bash
gh auth status || gh auth login

gh run list --workflow codex_review_exec.yml --limit 5

gh run rerun --failed      # reruns the latest failed run
# or specify a concrete run ID
# gh run rerun <run-id>

gh run watch
```

### Optional manual trigger

If you want `gh workflow run codex_review_exec.yml --ref main` to work, add a manual trigger to the workflow:

```yaml
on:
  pull_request:
    types: [opened, synchronize, reopened, ready_for_review]
  workflow_dispatch: {}
```

Commit that change, then dispatch with `gh workflow run codex_review_exec.yml --ref main` followed by `gh run watch`.

## 4. Optional guardrails

- Teach `scripts/codex_review_exec.sh` to exit 0 with a breadcrumb message when quota is exhausted so merges are not blocked.
- Keep `max_output_tokens` small in the quota sanity ping to limit spend.

When the responses ping succeeds and the rerun finishes, Codex PR Review will re-post its findings and the check should pass.
