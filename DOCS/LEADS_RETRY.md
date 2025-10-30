# CRM Retry Worker & Alerting

## Overview
This system retries failed CRM forwards for leads, tracks retry attempts, and sends Slack alerts if retry limits are reached.

## How it works
- The retry worker (`scripts/retry-crm.js`) selects unsynced leads and attempts to forward them to the CRM.
- On failure, it increments the retry count, schedules the next attempt with exponential backoff, and logs the error.
- If a lead hits the retry limit, a Slack alert is sent (via `SLACK_WEBHOOK_URL`).
- The worker is scheduled via `.github/workflows/crm-retry.yml` (every 15 min).

## Env vars
- `DATABASE_URL` — required
- `CRM_WEBHOOK_URL` — required for forwarding
- `CRM_API_KEY` — optional
- `CRM_RETRY_LIMIT` — default `5`
- `CRM_RETRY_BATCH` — default `20`
- `SLACK_WEBHOOK_URL` — required for alerts

## Migration
Run:
```bash
psql "$DATABASE_URL" -f migrations/004_add_crm_retry_columns.sql
```

## Monitoring & Alerts
- Alerts are sent to Slack when a lead fails all CRM retry attempts.
- Monitor logs for repeated failures or worker crashes.
- You can customize alerting in `lib/alert.js` for other channels (email, webhook, etc).

## Operational notes
- Tune `CRM_RETRY_LIMIT` and `CRM_RETRY_BATCH` as needed.
- Ensure `SLACK_WEBHOOK_URL` is set in production for alerting.
- After merge, run the migration above.
