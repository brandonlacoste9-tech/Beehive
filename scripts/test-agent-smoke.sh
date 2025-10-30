#!/bin/bash
# scripts/test-agent-smoke.sh
# Smoke test for agent-runner-playwright.js (mock and real mode)
set -e
cd "$(dirname "$0")/.."

# Mock mode
export USE_MOCK_LIBS=1
node scripts/agent-runner-playwright.js || { echo "[FAIL] mock mode"; exit 1; }
echo "[PASS] mock mode"

# Real mode (requires OPENAI_API_KEY and tesseract)
if [ -n "$OPENAI_API_KEY" ]; then
  unset USE_MOCK_LIBS
  node scripts/agent-runner-playwright.js || { echo "[FAIL] real mode"; exit 1; }
  echo "[PASS] real mode"
else
  echo "[SKIP] real mode (OPENAI_API_KEY not set)"
fi
