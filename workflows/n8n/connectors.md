# n8n Connector Inventory

All connectors rely on environment variables prefixed with `CONTENT_AGENT_`. Configure these in n8n by mapping to environment variables via the Credentials UI or environment expressions (e.g. `{{$env.CONTENT_AGENT_APIFY_TOKEN}}`).

| Node Name | Purpose | HTTP Method | Endpoint | Required Env Vars | Notes |
| --- | --- | --- | --- | --- | --- |
| `Fetch Job Manifest` | Load job metadata from Supabase | GET | `${CONTENT_AGENT_SUPABASE_REST_URL}/rest/v1/content_jobs?id=eq.{{$json["jobId"]}}` | `CONTENT_AGENT_SUPABASE_REST_URL`, `CONTENT_AGENT_SUPABASE_SERVICE_KEY` | Uses `apikey` header for Supabase service role (read-only). |
| `YouTube Harvester` | Trigger Apify actor for YouTube scrape | POST | `https://api.apify.com/v2/acts/${CONTENT_AGENT_APIFY_YOUTUBE_ACTOR}/run-sync-get-dataset-items?token={{$env.CONTENT_AGENT_APIFY_TOKEN}}` | `CONTENT_AGENT_APIFY_TOKEN`, `CONTENT_AGENT_APIFY_YOUTUBE_ACTOR` | Payload includes topic and max results. |
| `X Harvester` | Trigger Apify actor for X/Twitter | POST | `https://api.apify.com/v2/acts/${CONTENT_AGENT_APIFY_TWITTER_ACTOR}/run-sync-get-dataset-items?token={{$env.CONTENT_AGENT_APIFY_TOKEN}}` | Same as above | Handles rate limiting via built-in retries. |
| `Ideation (OpenRouter)` | Generate angles via GPT-4o | POST | `https://openrouter.ai/api/v1/chat/completions` | `CONTENT_AGENT_OPENROUTER_KEY`, `CONTENT_AGENT_GPT4O_MODEL` | `model` set from env var; includes `X-Title: Codex-Ideation`. |
| `Research (Perplexity)` | Fetch supporting facts | POST | `https://openrouter.ai/api/v1/chat/completions` | `CONTENT_AGENT_OPENROUTER_KEY`, `CONTENT_AGENT_PERPLEXITY_MODEL` | Temperature `0`, `max_tokens` `1200`. |
| `Draft (Claude)` | Compose post draft | POST | `https://openrouter.ai/api/v1/chat/completions` | `CONTENT_AGENT_OPENROUTER_KEY`, `CONTENT_AGENT_CLAUDE_MODEL` | Adds `X-Title: Codex-Drafting`. |
| `Slack Notify` | Send draft to review channel | POST | `{{$env.CONTENT_AGENT_SLACK_WEBHOOK}}` | `CONTENT_AGENT_SLACK_WEBHOOK` | Uses Slack incoming webhook message. |
| `LinkedIn Publish` | Publish or dry-run | POST | `https://api.linkedin.com/v2/ugcPosts` | `CONTENT_AGENT_LINKEDIN_TOKEN` | Use `{{$env.CONTENT_AGENT_PUBLISH_MODE}}` to control dry-run vs live. |
| `Prometheus Metrics` | Push job metrics | POST | `${CONTENT_AGENT_PROMETHEUS_GATEWAY}` | `CONTENT_AGENT_PROMETHEUS_GATEWAY` | Optional; skip if unset. |

### Timeout & Retry Defaults
- HTTP nodes use `responseFormat: json`, `timeout: 180000` (3 minutes).
- Retries: 3 attempts with exponential backoff (`5s`, `15s`, `45s`).
- Error handler routes to `Emit Failure Event` sub-workflow, which logs to Supabase and Slack.

### Required Headers
```
Authorization: Bearer {{$env.CONTENT_AGENT_OPENROUTER_KEY}}
HTTP-Referer: {{$env.CONTENT_AGENT_HTTP_REFERRER}}
X-Title: <custom>
Content-Type: application/json
```

Ensure `CONTENT_AGENT_HTTP_REFERRER` matches your verified domain in OpenRouter to prevent rejected calls.
