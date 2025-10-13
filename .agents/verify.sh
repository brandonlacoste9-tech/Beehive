#!/usr/bin/env bash
set -euo pipefail
echo "== checks =="
# clean worktree
if [ -n "$(git status --porcelain)" ]; then echo "❌ dirty worktree"; exit 1; else echo "✅ clean"; fi
# greet.ts requirements
if ! grep -n 'greet\(name: string\)' src/greet.ts >/dev/null; then echo "❌ greet signature missing"; exit 1; fi
if rg -n $'\t' src/greet.ts >/dev/null 2>&1; then echo "❌ tabs present in src/greet.ts"; exit 1; fi
if ! rg -n 'console\.log\(.*\);$' src/greet.ts >/dev/null 2>&1; then echo "❌ missing semicolon on console.log"; exit 1; fi
# scripts okay
npm run -s lint
npm run -s typecheck
npm run -s test
echo "✅ all checks passed"
