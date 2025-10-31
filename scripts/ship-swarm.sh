#!/usr/bin/env bash
# scripts/ship-swarm.sh
# Bulk ship bee creatives to platforms

API_URL="${1:-https://your-site.netlify.app/.netlify/functions/bee-ship}"
PLATFORMS="${2:-instagram}"

SEEDS=(
  "promo-summer-sale"
  "promo-limited-fomo"
  "event-product-launch"
  "feature-showcase-ai"
  "testimonial-social-proof"
)

echo "🐝 Shipping bee swarm to $PLATFORMS..."

for seed in "${SEEDS[@]}"; do
  echo "  → Deploying: $seed"
  
  curl -s -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -d "{\"seed\":\"$seed\",\"platforms\":[\"$PLATFORMS\"]}" \
    | jq -r '.ok // .error'
  
  sleep 2
done

echo "✓ Swarm deployed"
