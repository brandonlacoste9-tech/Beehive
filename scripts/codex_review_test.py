#!/usr/bin/env python3
"""
Codex Review Dry-Run Validator
"""

import os
from datetime import datetime

FINDINGS_FILE = "codex_review_findings.txt"

def log(msg):
    print(f"[{datetime.utcnow().isoformat()}] {msg}")

def main():
    if not os.path.exists(FINDINGS_FILE):
        log("ERROR: Findings file not found.")
        return

    with open(FINDINGS_FILE) as f:
        findings = f.read()

    if "error" in findings.lower():
        log("⚠️ Codex review contains errors.")
    else:
        log("✅ Codex review findings are clean.")

if __name__ == "__main__":
    main()
