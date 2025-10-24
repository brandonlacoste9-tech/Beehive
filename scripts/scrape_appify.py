"""Trigger Appify actors to seed the content agent corpus."""
from __future__ import annotations

import argparse
import json
import os
import sys
from typing import Any, Dict

import requests

try:
    from utils.formatting import emit_log  # type: ignore
except ModuleNotFoundError:  # pragma: no cover - fallback for package import
    from scripts.utils.formatting import emit_log

DEFAULT_HEADERS = {"Content-Type": "application/json"}


def trigger_appify(topic: str, dry_run: bool = False) -> Dict[str, Any]:
    token = os.getenv("CONTENT_AGENT_APIFY_TOKEN")
    actor = os.getenv("CONTENT_AGENT_APPIFY_TOPIC_ACTOR")
    if not token or not actor:
        raise RuntimeError("Missing CONTENT_AGENT_APIFY_TOKEN or CONTENT_AGENT_APPIFY_TOPIC_ACTOR")
    payload = {
        "token": token,
        "input": {
            "topic": topic,
            "maxItems": 10,
        },
    }
    if dry_run:
        return {"status": "dry-run", "request": payload}
    url = f"https://api.apify.com/v2/acts/{actor}/run-sync-get-dataset-items"
    response = requests.post(url, headers=DEFAULT_HEADERS, data=json.dumps(payload), timeout=60)
    response.raise_for_status()
    return response.json() if response.content else {"status": "ok"}


def main() -> int:
    parser = argparse.ArgumentParser(description="Trigger Appify scrape for content agent")
    parser.add_argument("--topic", required=True, help="Topic to harvest")
    parser.add_argument("--job-id", default="local-job", help="Job identifier for logging")
    parser.add_argument("--dry-run", action="store_true", help="Skip network call and emit payload only")
    args = parser.parse_args()

    try:
        result = trigger_appify(args.topic, dry_run=args.dry_run)
    except Exception as exc:  # noqa: BLE001
        emit_log(job_id=args.job_id, stage="ingress", status="error", payload={"error": str(exc)}, checksum_source=args.topic)
        raise

    emit_log(job_id=args.job_id, stage="ingress", status="success", payload=result, checksum_source=args.topic)
    print(json.dumps(result, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
