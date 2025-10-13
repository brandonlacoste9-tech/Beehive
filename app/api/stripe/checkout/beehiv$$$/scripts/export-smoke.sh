#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000}"

echo "▶ Enqueue"
ENQ=$(curl -s -X POST "$BASE_URL/api/export" -H "content-type: application/json" -d '{"composition":{"title":"Swarm"},"settings":{"preset":"1080p"}}')
JOB=$(echo "$ENQ" | node -e 'process.stdin.on("data",b=>{try{const j=JSON.parse(b);console.log(j.jobId||"")}catch{}})')
if [ -z "${JOB:-}" ]; then
  echo "✖ Failed to enqueue (no jobId). Response: $ENQ" >&2
  exit 1
fi
echo "✓ jobId=$JOB"

curl -s -X POST "$BASE_URL/api/export/webhook" -H "content-type: application/json" -d "{\"jobId\":\"$JOB\",\"payload\":{}}" >/dev/null 2>&1 || true

echo "▶ Polling status…"
ATTEMPTS=40
SLEEP=0.5
STATUS=""
URL=""
SIZE=""
for i in $(seq 1 $ATTEMPTS); do
  RES=$(curl -s "$BASE_URL/api/export/status/$JOB")
  STATUS=$(echo "$RES" | node -e 'process.stdin.on("data",b=>{try{const j=JSON.parse(b);console.log(j.status||"")}catch{}})')
  URL=$(echo "$RES" | node -e 'process.stdin.on("data",b=>{try{const j=JSON.parse(b);console.log(j.downloadUrl||"")}catch{}})')
  SIZE=$(echo "$RES" | node -e 'process.stdin.on("data",b=>{try{const j=JSON.parse(b);console.log(j.sizeBytes??"")}catch{}})')
  [ "$STATUS" = "completed" ] && break
  sleep $SLEEP
done

echo "status=$STATUS"
echo "downloadUrl=$URL"
echo "sizeBytes=$SIZE"

if [ "$STATUS" != "completed" ]; then
  echo "✖ Did not reach completed." >&2
  exit 2
fi
if [ -z "$URL" ]; then
  echo "✖ downloadUrl missing." >&2
  exit 3
fi
if ! echo "$SIZE" | grep -Eq '^[0-9]+$' ; then
  echo "✖ sizeBytes not numeric." >&2
  exit 4
fi
echo "✓ Smoke passed."
