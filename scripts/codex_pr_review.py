#!/usr/bin/env python3
"""
Codex PR Review Invocation Script
BeeHive Swarm Agent — v1.0
"""

import os, sys, subprocess, argparse
from datetime import datetime

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
REPO_PATH = os.getenv("REPO_PATH", ".")
FINDINGS_FILE = "codex_review_findings.txt"

def log(msg):
    print(f"[{datetime.utcnow().isoformat()}] {msg}")

def run_codex_review(pr_number):
    if not OPENAI_API_KEY:
        log("ERROR: OPENAI_API_KEY not set.")
        sys.exit(1)

    cmd = [
        "codex", "review",
        "--pr", str(pr_number),
        "--repo", REPO_PATH,
        "--output", FINDINGS_FILE,
        "--api-key", OPENAI_API_KEY
    ]

    log(f"Invoking Codex CLI for PR #{pr_number}...")
    try:
        subprocess.run(cmd, check=True)
        log(f"Codex review completed. Findings saved to {FINDINGS_FILE}")
    except subprocess.CalledProcessError as e:
        log(f"Codex CLI failed: {e}")
        sys.exit(1)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--pr", required=True, help="Pull request number")
    args = parser.parse_args()
    run_codex_review(args.pr)

if __name__ == "__main__":
    main()
