#!/bin/bash

# Phase-2 Orchestrator Setup Script
# Creates GitHub labels, project, and initializes automated PR workflow
# Usage: bash PHASE2_SETUP.sh

set -e

echo "🚀 Phase-2 Orchestrator Setup"
echo "================================"

REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
echo "Repository: $REPO"
echo ""

# Create labels
echo "📌 Creating GitHub labels..."
gh label create "PR-3: Providers" \
  --description "Provider integration tasks (OpenAI, GitHub Models fallback)" \
  --color "ff5733" || echo "Label 'PR-3: Providers' already exists"

gh label create "PR-1: Supabase" \
  --description "Supabase data access + RLS enforcement" \
  --color "33ff57" || echo "Label 'PR-1: Supabase' already exists"

gh label create "PR-5: Auth" \
  --description "Supabase Auth integration + user ownership checks" \
  --color "5743ff" || echo "Label 'PR-5: Auth' already exists"

gh label create "area: ci-cd" \
  --description "GitHub Actions, deployment, infrastructure" \
  --color "0366d6" || echo "Label 'area: ci-cd' already exists"

gh label create "type: docs" \
  --description "Documentation updates" \
  --color "d4c5f9" || echo "Label 'type: docs' already exists"

gh label create "type: test" \
  --description "Test updates or test-only changes" \
  --color "a2eeef" || echo "Label 'type: test' already exists"

echo "✅ Labels created"
echo ""

# Create GitHub project
echo "📊 Creating Phase-2 GitHub Project..."
PROJECT_ID=$(gh project create "Phase-2" \
  --title "Phase-2: Providers, Supabase, Auth" \
  --description "Automated tracking for Phase-2 PRs (PR-3, PR-1, PR-5)" \
  --repository "$REPO" \
  --format json 2>/dev/null | jq -r '.number // empty' || echo "")

if [ -n "$PROJECT_ID" ]; then
  echo "✅ Project created: Phase-2 (#$PROJECT_ID)"
  echo "   URL: https://github.com/$REPO/projects/$PROJECT_ID"
else
  echo "⚠️  Project may already exist or gh version doesn't support --format json"
  echo "   Create manually: https://github.com/$REPO/projects/new"
fi

echo ""
echo "================================"
echo "✅ Phase-2 Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Create a test branch: git checkout -b feat/phase2-kickoff"
echo "2. Touch a file to trigger workflows: mkdir -p lib/providers"
echo "3. Commit and push: git push -u origin feat/phase2-kickoff"
echo "4. Open PR → watch orchestrator run!"
echo ""
echo "📚 Read more:"
echo "   - copilot-instructions.md (CCR priorities)"
echo "   - COPILOT_GUARDRAILS.md (hard constraints)"
echo "   - INFRASTRUCTURE_COMPLETE.md (full setup)"
