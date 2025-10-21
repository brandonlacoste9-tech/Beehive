#!/usr/bin/env python3
"""
Codex Quota Sentinel v1.0
BeeHive Swarm Audit Script

Monitors OpenAI API quota and renewal, sends Slack alerts when thresholds are breached.

Requirements:
- Python 3.8+
- requests
- python-dotenv (optional, for .env support)

Configurable via ENV or .env:
- OPENAI_API_KEY
- SLACK_WEBHOOK_URL
- ALERT_THRESHOLD (default: 0.10 = 10%)
- DRY_RUN (default: false)
"""

import importlib.util
import os
import sys
from datetime import datetime
from importlib import import_module
from typing import Any, Dict, List, Optional

import requests

# Resolve optional dotenv support without violating import guardrails
_dotenv_spec = importlib.util.find_spec("dotenv")
if _dotenv_spec is not None:
    load_dotenv = import_module("dotenv").load_dotenv  # type: ignore[attr-defined]
else:
    def load_dotenv(*_args: Any, **_kwargs: Any) -> bool:
        """Fallback noop when python-dotenv is unavailable."""
        return False

# Load env vars from .env if present
load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
SLACK_WEBHOOK_URL = os.getenv("SLACK_WEBHOOK_URL")
ALERT_THRESHOLD = float(os.getenv("ALERT_THRESHOLD", "0.10"))
DRY_RUN = os.getenv("DRY_RUN", "false").lower() == "true"

USAGE_ENDPOINT = "https://api.openai.com/v1/dashboard/billing/usage"
SUB_ENDPOINT = "https://api.openai.com/v1/dashboard/billing/subscription"

AUDIT_LOG = "quota_sentinel_audit.log"


def log_event(message: str) -> None:
    timestamp = datetime.utcnow().isoformat()
    entry = f"[{timestamp}] {message}\n"
    with open(AUDIT_LOG, "a", encoding="utf-8") as audit_file:
        audit_file.write(entry)
    print(entry.strip())


def _api_get(url: str) -> Optional[Dict[str, Any]]:
    headers = {"Authorization": f"Bearer {OPENAI_API_KEY}"}
    try:
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        return response.json()
    except Exception as err:
        log_event(f"[ERROR] GET {url} failed: {err}")
        return None


def fetch_usage() -> Optional[Dict[str, Any]]:
    return _api_get(USAGE_ENDPOINT)


def fetch_subscription() -> Optional[Dict[str, Any]]:
    return _api_get(SUB_ENDPOINT)


def send_slack_alert(message: str) -> None:
    if DRY_RUN:
        log_event(f"[DRY RUN] Slack alert not sent: {message}")
        return
    payload = {"text": message}
    try:
        response = requests.post(SLACK_WEBHOOK_URL, json=payload, timeout=10)
        response.raise_for_status()
        log_event("[ALERT] Slack notification sent.")
    except Exception as err:
        log_event(f"[ERROR] Failed to send Slack alert: {err}")


def summarize_alerts(alerts: List[str]) -> str:
    return (
        "*Codex Quota Sentinel Alert*\n"
        + "\n".join(alerts)
        + f"\nAudit: {datetime.utcnow().isoformat()}"
    )


def ensure_configuration() -> None:
    if not OPENAI_API_KEY or not SLACK_WEBHOOK_URL:
        log_event("[FATAL] OPENAI_API_KEY or SLACK_WEBHOOK_URL not configured.")
        sys.exit(1)


def compute_metrics(usage: Dict[str, Any], subscription: Dict[str, Any]) -> Dict[str, Any]:
    total_quota = float(subscription.get("hard_limit_usd", 0))
    used_quota = float(usage.get("total_usage", 0)) / 100.0
    renewal_date = subscription.get("access_until")
    renewal_dt = datetime.utcfromtimestamp(renewal_date) if renewal_date else None

    remaining = total_quota - used_quota
    percent_remaining = remaining / total_quota if total_quota > 0 else 0.0
    days_to_renewal = None
    if renewal_dt is not None:
        days_to_renewal = (renewal_dt - datetime.utcnow()).days

    return {
        "total_quota": total_quota,
        "used_quota": used_quota,
        "remaining": remaining,
        "percent_remaining": percent_remaining,
        "renewal_dt": renewal_dt,
        "days_to_renewal": days_to_renewal,
    }


def audit(metrics: Dict[str, Any]) -> None:
    log_event(
        (
            "Quota: ${remaining:.2f} remaining of ${total_quota:.2f} "
            "(used: ${used_quota:.2f}, {percent_remaining:.1%})"
        ).format(**metrics)
    )
    renewal_dt = metrics["renewal_dt"]
    if renewal_dt is not None:
        log_event(
            f"Renewal date: {renewal_dt.isoformat()} "
            f"({metrics['days_to_renewal']} days left)"
        )
    else:
        log_event("Renewal date: Unknown")


def evaluate_alerts(metrics: Dict[str, Any], usage: Optional[Dict[str, Any]], subscription: Optional[Dict[str, Any]]) -> List[str]:
    alerts: List[str] = []
    if metrics["percent_remaining"] < ALERT_THRESHOLD:
        alerts.append(
            f"⚠️ Quota low: ${metrics['remaining']:.2f} (<{ALERT_THRESHOLD*100:.0f}%) remaining."
        )
    days_to_renewal = metrics["days_to_renewal"]
    renewal_dt = metrics["renewal_dt"]
    if renewal_dt is not None and days_to_renewal is not None and days_to_renewal <= 3:
        alerts.append(
            f"⏰ Renewal within {days_to_renewal} days ({renewal_dt.date()})."
        )
    if not usage or not subscription or "error" in usage or "error" in subscription:
        alerts.append("🚨 API key invalid/revoked or error fetching quota.")
    return alerts


def main() -> None:
    ensure_configuration()

    usage = fetch_usage()
    subscription = fetch_subscription()

    if usage is None or subscription is None:
        send_slack_alert(
            "Codex Quota Sentinel: API key invalid, revoked, or network error. "
            "Immediate attention required."
        )
        return

    metrics = compute_metrics(usage, subscription)
    audit(metrics)

    alerts = evaluate_alerts(metrics, usage, subscription)

    if alerts:
        send_slack_alert(summarize_alerts(alerts))
    else:
        log_event("No alerts triggered.")


if __name__ == "__main__":
    main()
