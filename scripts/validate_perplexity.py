"""Validate Perplexity research outputs for recency and compliance."""
from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Iterable, List

try:
    from utils.formatting import emit_log, enforce_banned_phrases  # type: ignore
except ModuleNotFoundError:  # pragma: no cover
    from scripts.utils.formatting import emit_log, enforce_banned_phrases


def load_facts(path: str) -> List[Dict[str, Any]]:
    with open(path, "r", encoding="utf-8") as handle:
        data = json.load(handle)
    if isinstance(data, dict) and "facts" in data:
        return data["facts"]
    if isinstance(data, list):
        return data
    raise ValueError("Fixture must be a list or contain a 'facts' list")


def validate_recency(fact: Dict[str, Any], max_age_days: int) -> None:
    published = datetime.fromisoformat(fact["published_at"].replace("Z", "+00:00"))
    if datetime.now(timezone.utc) - published > timedelta(days=max_age_days):
        raise ValueError(f"Fact {fact['statement']!r} is older than {max_age_days} days")


def validate_domains(fact: Dict[str, Any], banned_domains: Iterable[str]) -> None:
    url = fact.get("source_url", "")
    for domain in banned_domains:
        if domain and domain in url:
            raise ValueError(f"Source {url} uses banned domain {domain}")


def validate_banned_phrases(fact: Dict[str, Any]) -> None:
    violations = list(enforce_banned_phrases(fact.get("statement", "")))
    if violations:
        raise ValueError(f"Statement uses banned phrases: {', '.join(violations)}")


def validate_fact(fact: Dict[str, Any], max_age_days: int, banned_domains: Iterable[str]) -> Dict[str, Any]:
    required = {"statement", "source_url", "published_at"}
    missing = required - fact.keys()
    if missing:
        raise ValueError(f"Fact missing fields: {', '.join(sorted(missing))}")
    validate_recency(fact, max_age_days)
    validate_domains(fact, banned_domains)
    validate_banned_phrases(fact)
    return {
        "statement": fact["statement"],
        "source_url": fact["source_url"],
        "published_at": fact["published_at"],
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate Perplexity research fixtures")
    parser.add_argument("--fixture", required=True, help="Path to research JSON")
    parser.add_argument("--job-id", default="local-job", help="Job identifier")
    parser.add_argument("--max-age-days", type=int, default=365)
    parser.add_argument("--banned-domain", action="append", default=[], help="Additional banned domain")
    args = parser.parse_args()

    banned_domains = set(args.banned_domain)
    facts = load_facts(args.fixture)

    try:
        validated = [validate_fact(f, args.max_age_days, banned_domains) for f in facts]
    except Exception as exc:  # noqa: BLE001
        emit_log(job_id=args.job_id, stage="validation", status="error", payload={"error": str(exc)}, checksum_source=args.fixture)
        raise

    emit_log(job_id=args.job_id, stage="validation", status="success", payload={"facts": validated}, checksum_source=args.fixture)
    print(json.dumps({"facts": validated}, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
