"""Publish LinkedIn content with dry-run safety."""
from __future__ import annotations

import argparse
import json
import os
import sys
from typing import Any, Dict

import requests

try:
    from utils.formatting import emit_log, enforce_banned_phrases  # type: ignore
except ModuleNotFoundError:  # pragma: no cover
    from scripts.utils.formatting import emit_log, enforce_banned_phrases

LINKEDIN_ENDPOINT = "https://api.linkedin.com/v2/ugcPosts"


def build_payload(draft: Dict[str, Any]) -> Dict[str, Any]:
    required = {"title", "body", "cta"}
    missing = required - draft.keys()
    if missing:
        raise ValueError(f"Draft missing keys: {', '.join(sorted(missing))}")
    violations = list(enforce_banned_phrases(" ".join(draft[k] for k in ["title", "body", "cta"])))
    if violations:
        raise ValueError(f"Draft violates banned phrases: {', '.join(violations)}")
    author = os.getenv("CONTENT_AGENT_LINKEDIN_AUTHOR")
    if not author:
        raise RuntimeError("CONTENT_AGENT_LINKEDIN_AUTHOR not configured")
    return {
        "author": f"urn:li:person:{author}",
        "lifecycleState": "PUBLISHED",
        "specificContent": {
            "com.linkedin.ugc.ShareContent": {
                "shareCommentary": {
                    "text": f"{draft['body'].strip()}\n\n{draft['cta'].strip()}"
                },
                "shareMediaCategory": "NONE",
            }
        },
        "visibility": {
            "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
        },
    }


def publish(payload: Dict[str, Any], dry_run: bool = False) -> Dict[str, Any]:
    if dry_run:
        return {"status": "dry-run", "payload": payload}
    token = os.getenv("CONTENT_AGENT_LINKEDIN_TOKEN")
    if not token:
        raise RuntimeError("CONTENT_AGENT_LINKEDIN_TOKEN not configured")
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }
    response = requests.post(LINKEDIN_ENDPOINT, headers=headers, data=json.dumps(payload), timeout=60)
    response.raise_for_status()
    return response.json() if response.content else {"status": "ok"}


def main() -> int:
    parser = argparse.ArgumentParser(description="Publish LinkedIn draft")
    parser.add_argument("--draft", required=True, help="Path to draft JSON (title/body/cta)")
    parser.add_argument("--job-id", default="local-job", help="Job identifier")
    parser.add_argument("--dry-run", action="store_true", help="Emit payload without publishing")
    args = parser.parse_args()

    with open(args.draft, "r", encoding="utf-8") as handle:
        draft = json.load(handle)

    payload = build_payload(draft)

    try:
        result = publish(payload, dry_run=args.dry_run)
    except Exception as exc:  # noqa: BLE001
        emit_log(job_id=args.job_id, stage="publish", status="error", payload={"error": str(exc)}, checksum_source=args.draft)
        raise

    emit_log(job_id=args.job_id, stage="publish", status="success", payload=result, checksum_source=json.dumps(payload, sort_keys=True))
    print(json.dumps(result, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
