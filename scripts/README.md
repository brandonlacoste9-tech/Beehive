### quota_sentinel.py

Monitors OpenAI API usage and renewal, alerting the BeeHive swarm in Slack when quota drops below threshold or renewal is near.

**Config:**  
- `OPENAI_API_KEY`: Your OpenAI API key (env or `.env`)
- `SLACK_WEBHOOK_URL`: Slack incoming webhook URL  
- `ALERT_THRESHOLD`: Quota alert threshold (default 0.10 for 10%)  
- `DRY_RUN`: Set to `true` to test without sending Slack alerts

**Usage:**  
```bash
python quota_sentinel.py
```
Audit logs are written to `quota_sentinel_audit.log`. Extendable for other alerting methods (Discord, email).

---

Codex Swarm: inherit, extend, and deploy as needed!
