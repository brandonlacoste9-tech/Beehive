"""Utilities for formatting content and emitting Codex lineage logs."""
from __future__ import annotations

import argparse
import hashlib
import json
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, Iterable, Optional

LOG_PATH = Path("scrolls/latest.ndjson")
BANNED_PHRASES = {
    "unlocking potential",
    "game changer",
    "synergy",
    "AI revolution",
}


@dataclass
class Draft:
    title: str
    body: str
    cta: str

    def canonicalize(self) -> Dict[str, str]:
        """Return canonicalized draft sections trimmed and normalized."""
        return {
            "title": " ".join(self.title.strip().split()),
            "body": "\n".join(line.strip() for line in self.body.strip().splitlines()),
            "cta": self.cta.strip(),
        }


def checksum(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def emit_log(*, job_id: str, stage: str, status: str, payload: Dict[str, Any], checksum_source: Optional[str] = None) -> None:
    """Emit a structured log line used for Codex replays."""
    LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    log = {
        "timestamp": datetime.utcnow().isoformat(timespec="seconds") + "Z",
        "jobId": job_id,
        "stage": stage,
        "status": status,
        "payload": payload,
        "sizeBytes": len(json.dumps(payload, ensure_ascii=False).encode("utf-8")),
    }
    if checksum_source is not None:
        log["checksum"] = checksum(checksum_source)
    with LOG_PATH.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(log, ensure_ascii=False) + "\n")


def enforce_banned_phrases(text: str) -> Iterable[str]:
    """Yield banned phrases present in the provided text."""
    lowered = text.lower()
    for phrase in BANNED_PHRASES:
        if phrase in lowered:
            yield phrase


def replay(job_id: str) -> Iterable[Dict[str, Any]]:
    """Yield log events matching the job id."""
    if not LOG_PATH.exists():
        return []
    events = []
    with LOG_PATH.open("r", encoding="utf-8") as handle:
        for line in handle:
            try:
                data = json.loads(line)
            except json.JSONDecodeError:
                continue
            if data.get("jobId") == job_id:
                events.append(data)
    return events


def _cli() -> None:
    parser = argparse.ArgumentParser(description="Codex formatting utilities")
    parser.add_argument("--replay", dest="replay", help="Replay logs for a jobId")
    args = parser.parse_args()
    if args.replay:
        events = replay(args.replay)
        if not events:
            print(json.dumps({"jobId": args.replay, "events": []}))
            return
        print(json.dumps({"jobId": args.replay, "events": events}, indent=2))


if __name__ == "__main__":
    _cli()
