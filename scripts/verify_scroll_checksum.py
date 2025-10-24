#!/usr/bin/env python3
"""Checksum verification ritual for the Stellar Integrity Audit scroll."""
from __future__ import annotations

import datetime as _dt
import hashlib
import json
import sys
from pathlib import Path


def _load_index_entry(index_path: Path, scroll_name: str) -> dict:
    try:
        entries = json.loads(index_path.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise SystemExit(f"Missing scroll index at {index_path}") from exc

    for entry in entries:
        if entry.get("name") == scroll_name:
            return entry

    raise SystemExit(f"Scroll named '{scroll_name}' not found in index {index_path}")


def _normalized_scroll_bytes(file_path: Path) -> bytes:
    try:
        lines = file_path.read_text(encoding="utf-8").splitlines()
    except FileNotFoundError as exc:
        raise SystemExit(f"Missing scroll file at {file_path}") from exc

    filtered = [
        line for line in lines if not line.strip().startswith("| checksumSha256")
    ]
    # Rejoin with trailing newline to maintain canonical formatting.
    return ("\n".join(filtered) + "\n").encode("utf-8")


def _compute_sha256(file_path: Path) -> str:
    digest = hashlib.sha256()
    digest.update(_normalized_scroll_bytes(file_path))
    return digest.hexdigest()


def _emit_metadata(*, scroll_path: Path, index_entry: dict, computed_checksum: str) -> dict:
    size_bytes = scroll_path.stat().st_size
    expected_checksum = index_entry.get("checksum_sha256")
    status = "verified" if computed_checksum == expected_checksum else "mismatch"
    return {
        "jobId": "stellar-integrity-audit/verify",
        "status": status,
        "scroll": str(scroll_path.as_posix()),
        "sizeBytes": size_bytes,
        "hashAlgorithm": index_entry.get("hash_algorithm", "sha256"),
        "computedChecksum": computed_checksum,
        "indexChecksum": expected_checksum,
        "timestamp": _dt.datetime.utcnow().replace(microsecond=0).isoformat() + "Z",
    }


def main() -> int:
    repo_root = Path(__file__).resolve().parents[1]
    scroll_path = repo_root / "scrolls" / "stellar-integrity-audit.md"
    index_path = repo_root / "scrolls" / "scroll_index.json"
    index_entry = _load_index_entry(index_path, "stellar_integrity_audit")

    computed = _compute_sha256(scroll_path)
    metadata = _emit_metadata(scroll_path=scroll_path, index_entry=index_entry, computed_checksum=computed)

    json.dump(metadata, sys.stdout, indent=2)
    sys.stdout.write("\n")

    return 0 if metadata["status"] == "verified" else 1


if __name__ == "__main__":
    sys.exit(main())
